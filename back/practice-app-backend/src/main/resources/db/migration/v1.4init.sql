
--1.5v 알림 로그 테이블 추가


-- ========================================================
-- 1. 스키마 초기화 (Warning: 기존 데이터가 모두 삭제됩니다)
-- ========================================================
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- [확장 모듈] 암호화 및 UUID 생성을 위한 pgcrypto 설치
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ========================================================
-- 2. 사용자 및 인증 (Users & Auth)
-- ========================================================

-- [사용자] app_user: 서비스에 가입한 회원 정보
CREATE TABLE app_user (
                          user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          email         VARCHAR(320) NOT NULL,
                          password_hash TEXT NOT NULL,
                          name          VARCHAR(30) NOT NULL,
                          profile_image TEXT,
                          email_verified BOOLEAN NOT NULL DEFAULT FALSE, -- 이메일 인증 여부
                          created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
                          updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- 이메일 대소문자 구분 없이 중복 방지
CREATE UNIQUE INDEX ux_app_user_email_nocase ON app_user (LOWER(email));

-- [이메일 인증] email_verification: 회원가입 전 인증번호 관리 (팀원 로직: email로 식별)
CREATE TABLE email_verification (
                                    token_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    email      VARCHAR(320) NOT NULL, -- 가입 전이므로 user_id가 아닌 email 사용
                                    token      VARCHAR(255) NOT NULL, -- 인증번호 (6자리)
                                    purpose    VARCHAR(20) NOT NULL,  -- 용도 (signup, reset_password 등)
                                    new_email  VARCHAR(320),
                                    expires_at TIMESTAMPTZ NOT NULL,  -- 만료 시간
                                    used_at    TIMESTAMPTZ,           -- 사용 완료 시간
                                    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                    CONSTRAINT email_verification_purpose_check
                                        CHECK (purpose IN ('signup', 'verify_email', 'reset_password', 'change_email'))
);

-- [세션] user_session: 중복 로그인 방지 및 기기 관리
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

-- [그룹] app_group: 가족/공유 그룹 정보
CREATE TABLE app_group (
                           group_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           name        VARCHAR(100) NOT NULL,
                           created_by  UUID NOT NULL REFERENCES app_user(user_id), -- 생성자
                           created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                           dissolved_at TIMESTAMPTZ -- 그룹 해산일
);

-- [멤버] group_member: 그룹과 유저의 연결 (N:M 관계)
CREATE TABLE group_member (
                              group_id  UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                              user_id   UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
                              role      VARCHAR(10) NOT NULL CHECK (role IN ('OWNER','MANAGER','MEMBER')),
                              joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                              PRIMARY KEY (group_id, user_id)
);

-- [초대코드] invite_code: 그룹 가입을 위한 초대 링크/코드
CREATE TABLE invite_code (
                             code_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             group_id   UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                             inviter_id UUID REFERENCES app_user(user_id) ON DELETE SET NULL,
                             code       VARCHAR(64) UNIQUE NOT NULL, -- 난수 코드
                             expires_at TIMESTAMPTZ NOT NULL,
                             max_uses   INTEGER NOT NULL DEFAULT 1,
                             used_count INTEGER NOT NULL DEFAULT 0,
                             created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                             status     VARCHAR(12) NOT NULL DEFAULT 'ACTIVE'
);

-- [초대사용이력] invite_redeem: 누가 어떤 코드로 들어왔는지 기록
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

-- [카테고리] category: 물품 분류 (식품, 생활용품 등)
CREATE TABLE category (
                          category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          group_id    UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                          name        VARCHAR(60) NOT NULL,
                          UNIQUE (group_id, name)
);

-- [보관장소] storage_location: 냉장고, 펜트리 등 위치 정보
CREATE TABLE storage_location (
                                  location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  group_id    UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                                  name        VARCHAR(60) NOT NULL,
                                  storage_type VARCHAR(12) NOT NULL,
                                  UNIQUE (group_id, name)
);

-- [물품] item: 실제 재고 아이템
CREATE TABLE item (
                      item_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                      group_id     UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                      name         VARCHAR(120) NOT NULL,
                      category_id  UUID REFERENCES category(category_id),
                      location_id  UUID REFERENCES storage_location(location_id),
                      quantity     NUMERIC(12,3) NOT NULL DEFAULT 0,
                      unit         VARCHAR(16) NOT NULL DEFAULT 'ea',
                      min_threshold NUMERIC(12,3), -- 알림 기준 최소 수량
                      expiry_date  DATE,           -- 유통기한
                      status       VARCHAR(12) NOT NULL DEFAULT 'ACTIVE',
                      barcode      VARCHAR(32),
                      photo_url    TEXT,
                      created_by   UUID REFERENCES app_user(user_id),
                      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
                      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
                      UNIQUE (group_id, name, unit)
);

-- [물품이력] item_event: 입고, 출고, 수정 등 변경 로그
CREATE TABLE item_event (
                            event_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            item_id    UUID NOT NULL REFERENCES item(item_id) ON DELETE CASCADE,
                            actor_id   UUID REFERENCES app_user(user_id), -- 누가 변경했는지
                            event_type VARCHAR(16) NOT NULL, -- CREATE, UPDATE, PURCHASE_IN 등
                            qty_change NUMERIC(12,3),        -- 수량 변화 (+/-)
                            prev_values JSONB,
                            new_values  JSONB,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ========================================================
-- 5. 쇼핑 리스트 (Shopping)
-- ========================================================

-- [쇼핑리스트] shopping_list: 장보기 목록 헤더
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

-- [쇼핑항목] shopping_item: 리스트에 담긴 개별 물품
CREATE TABLE shopping_item (
                               item_row_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               list_id       UUID NOT NULL REFERENCES shopping_list(list_id) ON DELETE CASCADE,
                               item_name     VARCHAR(120) NOT NULL,
                               desired_qty   NUMERIC(12,3) NOT NULL,
                               unit          VARCHAR(16) NOT NULL DEFAULT 'ea',
                               note          VARCHAR(255), -- [추가] 메모 기능
                               linked_item   UUID REFERENCES item(item_id), -- 기존 재고와 연동
                               assignee_id   UUID REFERENCES app_user(user_id),
                               status        VARCHAR(16) NOT NULL DEFAULT 'PENDING', -- PENDING, PURCHASED
                               purchased_qty NUMERIC(12,3),
                               purchased_at  TIMESTAMPTZ
);

-- [쇼핑댓글] shopping_comment: 리스트 내 의견 교환
CREATE TABLE shopping_comment (
                                  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  list_id    UUID NOT NULL REFERENCES shopping_list(list_id) ON DELETE CASCADE,
                                  author_id  UUID NOT NULL REFERENCES app_user(user_id) ON DELETE SET NULL,
                                  body       TEXT NOT NULL,
                                  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [구매이력] purchase_history: 구매 완료된 내역 (통계용)
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

-- [알림설정] notification_pref: 유저별 수신 동의 설정
CREATE TABLE notification_pref (
                                   user_id      UUID PRIMARY KEY REFERENCES app_user(user_id) ON DELETE CASCADE,
                                   push_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
                                   email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                                   updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [알림함] notification: 사용자에게 발송된 알림 내역
CREATE TABLE notification (
                              notif_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_id  UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
                              topic    VARCHAR(24) NOT NULL, -- LOW_STOCK, NEW_MEMBER 등
                              title    TEXT NOT NULL,
                              body     TEXT NOT NULL,
                              payload  JSONB,
                              sent_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                              read_at  TIMESTAMPTZ,
                              CONSTRAINT notification_topic_check
                                  CHECK (topic IN ('LOW_STOCK','EXPIRY_SOON','INVITE_EXPIRY','NEW_MEMBER','LIST_CONFIRMED','PURCHASE_DONE','SYSTEM'))
);
CREATE INDEX idx_notification_user_time ON notification(user_id, sent_at DESC);


-- ========================================================
-- 7. 감사 및 에러 로그 (Logs)
-- ========================================================

-- [감사로그] audit_log: 주요 행위 기록 (보안/추적용)
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

-- [에러로그] error_log: 시스템 에러 기록
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
    -- 1. 구매 이력 저장
    INSERT INTO purchase_history(group_id, item_name, qty, unit, purchased_by, purchased_at, linked_item, source_list)
    VALUES (
      (SELECT group_id FROM shopping_list WHERE list_id = NEW.list_id),
      NEW.item_name, COALESCE(NEW.purchased_qty, NEW.desired_qty), NEW.unit,
      NEW.assignee_id, COALESCE(NEW.purchased_at, now()), NEW.linked_item, NEW.list_id
    );
    -- 2. 재고 수량 증가 (연동된 경우)
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