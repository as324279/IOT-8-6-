--1.6버전
--변경 사항: app_group 테이블의 created_by FK 제약조건을
-- ON DELETE CASCADE로 변경하여 회원 탈퇴 시 그룹도 함께 삭제되도록 수정했습니다.

-- ========================================================
-- 1. 스키마 초기화 (기존 데이터 삭제)
-- ========================================================
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- 확장 모듈 설치
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ========================================================
-- 2. 사용자 및 인증 (Users & Auth)
-- ========================================================

-- [사용자] app_user
CREATE TABLE app_user (
                          user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          email         VARCHAR(320) NOT NULL,
                          password_hash TEXT NOT NULL,
                          name          VARCHAR(30) NOT NULL,
                          profile_image TEXT,
                          email_verified BOOLEAN NOT NULL DEFAULT FALSE,
                          created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
                          updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ux_app_user_email_nocase ON app_user (LOWER(email));

-- [이메일 인증] email_verification (팀원 로직: user_id 대신 email 사용)
CREATE TABLE email_verification (
                                    token_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    email      VARCHAR(320) NOT NULL, -- 가입 전 식별자
                                    token      VARCHAR(255) NOT NULL,
                                    purpose    VARCHAR(20) NOT NULL,
                                    new_email  VARCHAR(320),
                                    expires_at TIMESTAMPTZ NOT NULL,
                                    used_at    TIMESTAMPTZ,
                                    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                    CONSTRAINT email_verification_purpose_check
                                        CHECK (purpose IN ('signup', 'verify_email', 'reset_password', 'change_email'))
);

-- [세션] user_session
CREATE TABLE user_session (
                              session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_id    UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
                              device_info TEXT,
                              ip_addr    INET,
                              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                              last_seen  TIMESTAMPTZ NOT NULL DEFAULT now(),
                              revoked    BOOLEAN NOT NULL DEFAULT FALSE
);


-- ========================================================
-- 3. 그룹 및 멤버십 (Groups & Membership)
-- ========================================================

-- [그룹] app_group
-- [v1.6 변경] ON DELETE CASCADE 추가 (회원 탈퇴 시 그룹도 자동 삭제)
CREATE TABLE app_group (
                           group_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           name        VARCHAR(100) NOT NULL,
                           created_by  UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
                           created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                           dissolved_at TIMESTAMPTZ
);

-- [멤버] group_member
CREATE TABLE group_member (
                              group_id  UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                              user_id   UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
                              role      VARCHAR(10) NOT NULL CHECK (role IN ('OWNER','MANAGER','MEMBER')),
                              joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                              PRIMARY KEY (group_id, user_id)
);

-- [초대코드] invite_code
CREATE TABLE invite_code (
                             code_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             group_id   UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                             inviter_id UUID REFERENCES app_user(user_id) ON DELETE SET NULL,
                             code       VARCHAR(64) UNIQUE NOT NULL,
                             expires_at TIMESTAMPTZ NOT NULL,
                             max_uses   INTEGER NOT NULL DEFAULT 1,
                             used_count INTEGER NOT NULL DEFAULT 0,
                             created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                             status     VARCHAR(12) NOT NULL DEFAULT 'ACTIVE'
);

-- [초대사용이력] invite_redeem
CREATE TABLE invite_redeem (
                               redeem_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               code_id     UUID NOT NULL REFERENCES invite_code(code_id) ON DELETE CASCADE,
                               group_id    UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                               user_id     UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
                               redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ========================================================
-- 4. 재고 관리 (Inventory)
-- ========================================================

-- [카테고리] category
CREATE TABLE category (
                          category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          group_id    UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                          name        VARCHAR(60) NOT NULL,
                          UNIQUE (group_id, name)
);

-- [보관장소] storage_location
CREATE TABLE storage_location (
                                  location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  group_id    UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                                  name        VARCHAR(60) NOT NULL,
                                  storage_type VARCHAR(12) NOT NULL,
                                  UNIQUE (group_id, name)
);

-- [물품] item
CREATE TABLE item (
                      item_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                      group_id     UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                      name         VARCHAR(120) NOT NULL,
                      category_id  UUID REFERENCES category(category_id),
                      location_id  UUID REFERENCES storage_location(location_id),
                      quantity     NUMERIC(12,3) NOT NULL DEFAULT 0,
                      unit         VARCHAR(16) NOT NULL DEFAULT 'ea',
                      min_threshold NUMERIC(12,3),
                      expiry_date  DATE,
                      status       VARCHAR(12) NOT NULL DEFAULT 'ACTIVE',
                      barcode      VARCHAR(32),
                      photo_url    TEXT,
                      created_by   UUID REFERENCES app_user(user_id),
                      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
                      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
                      UNIQUE (group_id, name, unit)
);

-- [물품이력] item_event
CREATE TABLE item_event (
                            event_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            item_id    UUID NOT NULL REFERENCES item(item_id) ON DELETE CASCADE,
                            actor_id   UUID REFERENCES app_user(user_id),
                            event_type VARCHAR(16) NOT NULL,
                            qty_change NUMERIC(12,3),
                            prev_values JSONB,
                            new_values  JSONB,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ========================================================
-- 5. 쇼핑 리스트 (Shopping)
-- ========================================================

-- [쇼핑리스트] shopping_list
CREATE TABLE shopping_list (
                               list_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               group_id    UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                               title       VARCHAR(120) NOT NULL,
                               status      VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
                               confirmed_by UUID REFERENCES app_user(user_id),
                               confirmed_at TIMESTAMPTZ,
                               created_by  UUID NOT NULL REFERENCES app_user(user_id),
                               created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                               updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [쇼핑항목] shopping_item
CREATE TABLE shopping_item (
                               item_row_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               list_id       UUID NOT NULL REFERENCES shopping_list(list_id) ON DELETE CASCADE,
                               item_name     VARCHAR(120) NOT NULL,
                               desired_qty   NUMERIC(12,3) NOT NULL,
                               unit          VARCHAR(16) NOT NULL DEFAULT 'ea',
                               note          VARCHAR(255), -- 메모 기능
                               linked_item   UUID REFERENCES item(item_id),
                               assignee_id   UUID REFERENCES app_user(user_id),
                               status        VARCHAR(16) NOT NULL DEFAULT 'PENDING',
                               purchased_qty NUMERIC(12,3),
                               purchased_at  TIMESTAMPTZ
);

-- [쇼핑댓글] shopping_comment
CREATE TABLE shopping_comment (
                                  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  list_id    UUID NOT NULL REFERENCES shopping_list(list_id) ON DELETE CASCADE,
                                  author_id  UUID NOT NULL REFERENCES app_user(user_id) ON DELETE SET NULL,
                                  body       TEXT NOT NULL,
                                  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [구매이력] purchase_history
CREATE TABLE purchase_history (
                                  purchase_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  group_id     UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                                  item_name    VARCHAR(120) NOT NULL,
                                  qty          NUMERIC(12,3) NOT NULL,
                                  unit         VARCHAR(16) NOT NULL DEFAULT 'ea',
                                  price_total  NUMERIC(12,2),
                                  currency     VARCHAR(8) DEFAULT 'KRW',
                                  purchased_by UUID REFERENCES app_user(user_id),
                                  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                  linked_item  UUID REFERENCES item(item_id),
                                  source_list  UUID REFERENCES shopping_list(list_id)
);


-- ========================================================
-- 6. 알림 및 설정 (Notification)
-- ========================================================

-- [알림설정] notification_pref
CREATE TABLE notification_pref (
                                   user_id      UUID PRIMARY KEY REFERENCES app_user(user_id) ON DELETE CASCADE,
                                   push_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
                                   email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                                   updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [알림함] notification
CREATE TABLE notification (
                              notif_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_id  UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
                              topic    VARCHAR(24) NOT NULL,
                              title    TEXT NOT NULL,
                              body     TEXT NOT NULL,
                              payload  JSONB,
                              sent_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                              read_at  TIMESTAMPTZ,
                              CONSTRAINT notification_topic_check CHECK (topic IN ('LOW_STOCK','EXPIRY_SOON','INVITE_EXPIRY','NEW_MEMBER','LIST_CONFIRMED','PURCHASE_DONE','SYSTEM'))
);
CREATE INDEX idx_notification_user_time ON notification(user_id, sent_at DESC);


-- ========================================================
-- 7. 감사 및 에러 로그 (Logs)
-- ========================================================

-- [감사로그] audit_log
CREATE TABLE audit_log (
                           log_id      BIGSERIAL PRIMARY KEY,
                           occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                           actor_id    UUID REFERENCES app_user(user_id) ON DELETE SET NULL,
                           group_id    UUID REFERENCES app_group(group_id) ON DELETE SET NULL,
                           entity_type VARCHAR(24) NOT NULL,
                           entity_id   UUID,
                           action      VARCHAR(16) NOT NULL,
                           details     JSONB
);

-- [에러로그] error_log
CREATE TABLE error_log (
                           error_id   BIGSERIAL PRIMARY KEY,
                           occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                           level      VARCHAR(10) NOT NULL,
                           message    TEXT NOT NULL,
                           stacktrace TEXT,
                           context    JSONB,
                           CONSTRAINT error_log_level_check CHECK (level IN ('INFO','WARN','ERROR','FATAL'))
);


-- ========================================================
-- 8. 함수 및 트리거 (Functions & Triggers)
-- ========================================================

-- [함수] 그룹 생성 시 생성자를 자동으로 OWNER로 설정
CREATE OR REPLACE FUNCTION ensure_group_owner()
RETURNS TRIGGER AS $$
BEGIN
INSERT INTO group_member(group_id, user_id, role)
VALUES (NEW.group_id, NEW.created_by, 'OWNER')
    ON CONFLICT DO NOTHING;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_group_owner AFTER INSERT ON app_group FOR EACH ROW EXECUTE FUNCTION ensure_group_owner();


-- [함수] 쇼핑 구매 완료 시 -> 재고 증가 및 구매 이력 저장 (핵심 로직)
CREATE OR REPLACE FUNCTION on_shopping_item_purchased()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'PURCHASED' AND (OLD.status IS DISTINCT FROM 'PURCHASED') THEN
    INSERT INTO purchase_history(group_id, item_name, qty, unit, purchased_by, purchased_at, linked_item, source_list)
    VALUES (
      (SELECT group_id FROM shopping_list WHERE list_id = NEW.list_id),
      NEW.item_name, COALESCE(NEW.purchased_qty, NEW.desired_qty), NEW.unit,
      NEW.assignee_id, COALESCE(NEW.purchased_at, now()), NEW.linked_item, NEW.list_id
    );
    IF NEW.linked_item IS NOT NULL THEN
UPDATE item SET quantity = quantity + COALESCE(NEW.purchased_qty, NEW.desired_qty) WHERE item_id = NEW.linked_item;
END IF;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_shopping_item_purchased AFTER UPDATE ON shopping_item FOR EACH ROW EXECUTE FUNCTION on_shopping_item_purchased();


-- [함수] updated_at 자동 갱신
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_touch_user BEFORE UPDATE ON app_user FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_touch_item BEFORE UPDATE ON item FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_touch_shopping_list BEFORE UPDATE ON shopping_list FOR EACH ROW EXECUTE FUNCTION touch_updated_at();