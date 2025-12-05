-- v1.6 (핵심: app_group.created_by -> ON DELETE CASCADE)

-- 0) 초기화 & 확장 ------------------------------------------------------------
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- UUID 생성용(gen_random_uuid)

-- 1) Users & Auth -------------------------------------------------------------

-- app_user: 회원 계정(프로필/이메일 인증 상태 포함)
CREATE TABLE app_user (
                          user_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          email          VARCHAR(320)        NOT NULL,
                          password_hash  TEXT                NOT NULL,
                          name           VARCHAR(30)         NOT NULL,
                          profile_image  TEXT,
                          email_verified BOOLEAN             NOT NULL DEFAULT FALSE,
                          created_at     TIMESTAMPTZ         NOT NULL DEFAULT now(),
                          updated_at     TIMESTAMPTZ         NOT NULL DEFAULT now()
);

-- (대소문자 무시 이메일 유니크)
CREATE UNIQUE INDEX ux_app_user_email_nocase ON app_user (LOWER(email));


-- email_verification: 이메일 토큰(가입/검증/비번재설정/변경용)
CREATE TABLE email_verification (
                                    token_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    email       VARCHAR(320)  NOT NULL,
                                    token       VARCHAR(255)  NOT NULL,
                                    purpose     VARCHAR(20)   NOT NULL,
                                    new_email   VARCHAR(320),
                                    expires_at  TIMESTAMPTZ   NOT NULL,
                                    used_at     TIMESTAMPTZ,
                                    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
                                    CONSTRAINT email_verification_purpose_check
                                        CHECK (purpose IN ('signup','verify_email','reset_password','change_email'))
);


-- user_session: 기기/세션(탈퇴 시 세션 자동 삭제)
CREATE TABLE user_session (
                              session_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_id     UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
                              device_info TEXT,
                              ip_addr     INET,
                              created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                              last_seen   TIMESTAMPTZ NOT NULL DEFAULT now(),
                              revoked     BOOLEAN     NOT NULL DEFAULT FALSE
);


-- 2) Groups & Membership ------------------------------------------------------

-- app_group: 그룹(생성자 탈퇴 시 그룹도 삭제)  ← v1.6 변경점
CREATE TABLE app_group (
                           group_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           name         VARCHAR(100) NOT NULL,
                           created_by   UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
                           created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
                           dissolved_at TIMESTAMPTZ
);


-- group_member: 그룹 멤버(OWNER/MANAGER/MEMBER)
CREATE TABLE group_member (
                              group_id  UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                              user_id   UUID NOT NULL REFERENCES app_user(user_id)  ON DELETE CASCADE,
                              role      VARCHAR(10) NOT NULL CHECK (role IN ('OWNER','MANAGER','MEMBER')),
                              joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                              PRIMARY KEY (group_id, user_id)
);


-- invite_code: 초대 코드(1회/다회, 만료, 상태)
CREATE TABLE invite_code (
                             code_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             group_id    UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                             inviter_id  UUID REFERENCES app_user(user_id) ON DELETE SET NULL,
                             code        VARCHAR(64) UNIQUE NOT NULL,
                             expires_at  TIMESTAMPTZ NOT NULL,
                             max_uses    INTEGER     NOT NULL DEFAULT 1,
                             used_count  INTEGER     NOT NULL DEFAULT 0,
                             created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                             status      VARCHAR(12) NOT NULL DEFAULT 'ACTIVE'
);


-- invite_redeem: 초대 사용 이력(누가 언제 어떤 코드로 합류)
CREATE TABLE invite_redeem (
                               redeem_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               code_id     UUID NOT NULL REFERENCES invite_code(code_id) ON DELETE CASCADE,
                               group_id    UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                               user_id     UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
                               redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 3) Inventory ---------------------------------------------------------------

-- category: 품목 카테고리(그룹 내 고유)
CREATE TABLE category (
                          category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          group_id    UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                          name        VARCHAR(60) NOT NULL,
                          UNIQUE (group_id, name)
);


-- storage_location: 보관 장소(예: 냉장/냉동/창고; 그룹 내 고유)
CREATE TABLE storage_location (
                                  location_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  group_id     UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                                  name         VARCHAR(60) NOT NULL,
                                  storage_type VARCHAR(12) NOT NULL,
                                  UNIQUE (group_id, name)
);


-- item: 재고 품목(수량/단위/유통기한/상태/바코드/위치)
CREATE TABLE item (
                      item_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                      group_id      UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                      name          VARCHAR(120) NOT NULL,
                      category_id   UUID REFERENCES category(category_id),
                      location_id   UUID REFERENCES storage_location(location_id),
                      quantity      NUMERIC(12,3) NOT NULL DEFAULT 0,
                      unit          VARCHAR(16)   NOT NULL DEFAULT 'ea',
                      min_threshold NUMERIC(12,3),
                      expiry_date   DATE,
                      status        VARCHAR(12)   NOT NULL DEFAULT 'ACTIVE',
                      barcode       VARCHAR(32),
                      photo_url     TEXT,
                      created_by    UUID REFERENCES app_user(user_id),
                      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
                      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
                      UNIQUE (group_id, name, unit)
);


-- item_event: 품목 변경 이력(증감량/이전-이후 값 스냅샷)
CREATE TABLE item_event (
                            event_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            item_id     UUID NOT NULL REFERENCES item(item_id) ON DELETE CASCADE,
                            actor_id    UUID REFERENCES app_user(user_id),
                            event_type  VARCHAR(16) NOT NULL,
                            qty_change  NUMERIC(12,3),
                            prev_values JSONB,
                            new_values  JSONB,
                            created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 4) Shopping ----------------------------------------------------------------

-- shopping_list: 장보기 리스트(작성/확정/상태)
CREATE TABLE shopping_list (
                               list_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               group_id     UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                               title        VARCHAR(120) NOT NULL,
                               status       VARCHAR(16)  NOT NULL DEFAULT 'DRAFT',
                               confirmed_by UUID REFERENCES app_user(user_id),
                               confirmed_at TIMESTAMPTZ,
                               created_by   UUID NOT NULL REFERENCES app_user(user_id),
                               created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
                               updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- shopping_item: 리스트 항목(담당자/연결 품목/구매 완료 처리)
CREATE TABLE shopping_item (
                               item_row_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               list_id       UUID NOT NULL REFERENCES shopping_list(list_id) ON DELETE CASCADE,
                               item_name     VARCHAR(120) NOT NULL,
                               desired_qty   NUMERIC(12,3) NOT NULL,
                               unit          VARCHAR(16)   NOT NULL DEFAULT 'ea',
                               note          VARCHAR(255),
                               linked_item   UUID REFERENCES item(item_id),
                               assignee_id   UUID REFERENCES app_user(user_id),
                               status        VARCHAR(16)   NOT NULL DEFAULT 'PENDING',
                               purchased_qty NUMERIC(12,3),
                               purchased_at  TIMESTAMPTZ
);


-- shopping_comment: 리스트 댓글(토론/메모)
CREATE TABLE shopping_comment (
                                  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  list_id    UUID NOT NULL REFERENCES shopping_list(list_id) ON DELETE CASCADE,
                                  author_id  UUID NOT NULL REFERENCES app_user(user_id) ON DELETE SET NULL,
                                  body       TEXT NOT NULL,
                                  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- purchase_history: 구매 완료 기록(금액/통화/연결 품목/출처 리스트)
CREATE TABLE purchase_history (
                                  purchase_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  group_id     UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                                  item_name    VARCHAR(120) NOT NULL,
                                  qty          NUMERIC(12,3) NOT NULL,
                                  unit         VARCHAR(16)   NOT NULL DEFAULT 'ea',
                                  price_total  NUMERIC(12,2),
                                  currency     VARCHAR(8)    DEFAULT 'KRW',
                                  purchased_by UUID REFERENCES app_user(user_id),
                                  purchased_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
                                  linked_item  UUID REFERENCES item(item_id),
                                  source_list  UUID REFERENCES shopping_list(list_id)
);


-- 5) Notification -------------------------------------------------------------

-- notification_pref: 사용자 알림 설정(푸시/이메일)
CREATE TABLE notification_pref (
                                   user_id       UUID PRIMARY KEY REFERENCES app_user(user_id) ON DELETE CASCADE,
                                   push_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
                                   email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                                   updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- notification: 발송된 알림함(제목/본문/페이로드/읽음시각)
CREATE TABLE notification (
                              notif_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_id  UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
                              topic    VARCHAR(24) NOT NULL,
                              title    TEXT        NOT NULL,
                              body     TEXT        NOT NULL,
                              payload  JSONB,
                              sent_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                              read_at  TIMESTAMPTZ,
                              CONSTRAINT notification_topic_check
                                  CHECK (topic IN ('LOW_STOCK','EXPIRY_SOON','INVITE_EXPIRY','NEW_MEMBER','LIST_CONFIRMED','PURCHASE_DONE','SYSTEM'))
);

CREATE INDEX idx_notification_user_time ON notification (user_id, sent_at DESC);


-- 6) Logs --------------------------------------------------------------------

-- audit_log: 주요 행위 감사용(누가/무엇을/언제/어떻게)
CREATE TABLE audit_log (
                           log_id      BIGSERIAL PRIMARY KEY,
                           occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                           actor_id    UUID REFERENCES app_user(user_id)  ON DELETE SET NULL,
                           group_id    UUID REFERENCES app_group(group_id) ON DELETE SET NULL,
                           entity_type VARCHAR(24) NOT NULL,
                           entity_id   UUID,
                           action      VARCHAR(16) NOT NULL,
                           details     JSONB
);

CREATE INDEX idx_audit_actor ON audit_log (actor_id);
CREATE INDEX idx_audit_time  ON audit_log (occurred_at DESC);


-- error_log: 에러 추적(레벨/메시지/스택/컨텍스트)
CREATE TABLE error_log (
                           error_id    BIGSERIAL PRIMARY KEY,
                           occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                           level       VARCHAR(10) NOT NULL,
                           message     TEXT        NOT NULL,
                           stacktrace  TEXT,
                           context     JSONB,
                           CONSTRAINT error_log_level_check
                               CHECK (level IN ('INFO','WARN','ERROR','FATAL'))
);


-- 7) Functions & Triggers ----------------------------------------------------

-- 그룹 생성 시 생성자를 OWNER로 자동 등록
CREATE OR REPLACE FUNCTION ensure_group_owner()
RETURNS TRIGGER AS $$
BEGIN
INSERT INTO group_member(group_id, user_id, role)
VALUES (NEW.group_id, NEW.created_by, 'OWNER')
    ON CONFLICT DO NOTHING;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_group_owner
    AFTER INSERT ON app_group
    FOR EACH ROW EXECUTE FUNCTION ensure_group_owner();


-- 쇼핑 항목이 PURCHASED 되면 구매이력 기록 + 재고 증가
CREATE OR REPLACE FUNCTION on_shopping_item_purchased()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'PURCHASED' AND (OLD.status IS DISTINCT FROM 'PURCHASED') THEN
    INSERT INTO purchase_history
      (group_id, item_name, qty, unit, purchased_by, purchased_at, linked_item, source_list)
    VALUES (
      (SELECT group_id FROM shopping_list WHERE list_id = NEW.list_id),
      NEW.item_name,
      COALESCE(NEW.purchased_qty, NEW.desired_qty),
      NEW.unit,
      NEW.assignee_id,
      COALESCE(NEW.purchased_at, now()),
      NEW.linked_item,
      NEW.list_id
    );

    IF NEW.linked_item IS NOT NULL THEN
UPDATE item
SET quantity = quantity + COALESCE(NEW.purchased_qty, NEW.desired_qty)
WHERE item_id = NEW.linked_item;
END IF;
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_shopping_item_purchased
    AFTER UPDATE ON shopping_item
    FOR EACH ROW EXECUTE FUNCTION on_shopping_item_purchased();


-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_touch_user
    BEFORE UPDATE ON app_user
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER trg_touch_item
    BEFORE UPDATE ON item
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER trg_touch_shopping_list
    BEFORE UPDATE ON shopping_list
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
