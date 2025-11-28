-- =========================================
-- 가정용 재고 관리 앱 – 데이터베이스 스키마 (v1.2)
-- 실제 DB(pg_dump) 기준 문서화 버전
-- =========================================

-- =============================
-- 0) 확장 모듈 (Extensions)
-- =============================

-- pgcrypto: gen_random_uuid() 등 암호 관련 함수
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- [v1.2 변경]
-- v1.1에서는 citext 확장을 사용했지만,
--  v1.2에서는 VARCHAR + lower(email) UNIQUE 인덱스로 이메일 대소문자 무시 처리.


-- =============================
-- 1) 공통 함수 & 트리거 함수
-- =============================

-- ensure_group_owner():
--  그룹이 생성될 때 생성자를 자동으로 OWNER 멤버로 추가
CREATE OR REPLACE FUNCTION ensure_group_owner()
RETURNS TRIGGER AS $$
BEGIN
INSERT INTO group_member(group_id, user_id, role)
VALUES (NEW.group_id, NEW.created_by, 'OWNER')
    ON CONFLICT DO NOTHING;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- on_shopping_item_purchased():
--  쇼핑 항목이 'PURCHASED'로 바뀔 때
--   1) purchase_history에 구매 이력 기록
--   2) linked_item 재고 수량 증가
--   3) item_event에 PURCHASE_IN 이벤트 기록
CREATE OR REPLACE FUNCTION on_shopping_item_purchased()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'PURCHASED' AND (OLD.status IS DISTINCT FROM 'PURCHASED') THEN
    INSERT INTO purchase_history(
      group_id, item_name, qty, unit, purchased_by,
      purchased_at, linked_item, source_list
    )
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

INSERT INTO item_event(item_id, actor_id, event_type, qty_change, created_at)
VALUES (
           NEW.linked_item,
           NEW.assignee_id,
           'PURCHASE_IN',
           COALESCE(NEW.purchased_qty, NEW.desired_qty),
           now()
       );
END IF;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- touch_updated_at():
--  updated_at 컬럼을 항상 현재 시각으로 갱신하는 공통 함수
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================
-- 2) 사용자 & 인증 (Users & Auth)
-- =============================

-- app_user: 회원 기본 정보 (로그인 계정)
CREATE TABLE app_user (
                          user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          email         VARCHAR(320) NOT NULL, -- [v1.2] CITEXT → VARCHAR(320)
                          password_hash TEXT NOT NULL,
                          name          VARCHAR(30) NOT NULL,
                          profile_image TEXT,
                          email_verified BOOLEAN NOT NULL DEFAULT FALSE,
                          created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
                          updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
                          CONSTRAINT app_user_name_check
                              CHECK (char_length(name) BETWEEN 1 AND 30)
);

-- [v1.2 변경]
-- v1.1: email CITEXT UNIQUE
-- v1.2: VARCHAR + LOWER(email) UNIQUE 인덱스로 대소문자 무시
CREATE UNIQUE INDEX ux_app_user_email_nocase
    ON app_user (LOWER(email));

CREATE INDEX idx_app_user_created_at
    ON app_user(created_at);


-- email_verification: 이메일 인증 / 비밀번호 재설정 / 이메일 변경 토큰
CREATE TABLE email_verification (
                                    token_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    user_id    UUID NOT NULL,
                                    token      CHAR(64) NOT NULL, -- [v1.2] TEXT → CHAR(64), UNIQUE 인덱스로 관리
                                    purpose    VARCHAR(20) NOT NULL,
                                    new_email  VARCHAR(320),
                                    expires_at TIMESTAMPTZ NOT NULL,
                                    used_at    TIMESTAMPTZ,
                                    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                    CONSTRAINT email_verification_purpose_check
                                        CHECK (purpose IN ('verify_email','reset_password','change_email'))
);

ALTER TABLE email_verification
    ADD CONSTRAINT email_verification_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES app_user(user_id) ON DELETE CASCADE;

-- [v1.2 변경] token UNIQUE 컬럼 → token에 대한 UNIQUE 인덱스
CREATE UNIQUE INDEX ux_email_verification_token_hash
    ON email_verification(token);

CREATE INDEX idx_email_verification_user_expires
    ON email_verification(user_id, expires_at);


-- user_session: 로그인 세션 관리 (유저당 1개 활성 세션)
CREATE TABLE user_session (
                              session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_id    UUID NOT NULL,
                              device_info TEXT,
                              ip_addr    INET,
                              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                              last_seen  TIMESTAMPTZ NOT NULL DEFAULT now(),
                              revoked    BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE user_session
    ADD CONSTRAINT user_session_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES app_user(user_id) ON DELETE CASCADE;

-- 사용자당 revoked=false 세션 1개 제한
CREATE UNIQUE INDEX ux_user_single_active_session
    ON user_session(user_id)
    WHERE revoked = FALSE;


-- =============================
-- 3) 그룹 & 멤버십 (Groups & Membership)
-- =============================

-- app_group: 가족/가구 단위 그룹 정보
CREATE TABLE app_group (
                           group_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           name        VARCHAR(100) NOT NULL,
                           created_by  UUID NOT NULL,
                           created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                           dissolved_at TIMESTAMPTZ
);

ALTER TABLE app_group
    ADD CONSTRAINT app_group_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES app_user(user_id) ON DELETE RESTRICT;

CREATE INDEX idx_group_created_by
    ON app_group(created_by);

-- group_member: 그룹-유저 연결 + 역할 (OWNER/MANAGER/MEMBER)
CREATE TABLE group_member (
                              group_id  UUID NOT NULL,
                              user_id   UUID NOT NULL,
                              role      VARCHAR(10) NOT NULL,
                              joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                              CONSTRAINT group_member_pkey PRIMARY KEY (group_id, user_id),
                              CONSTRAINT group_member_role_check
                                  CHECK (role IN ('OWNER','MANAGER','MEMBER'))
);

ALTER TABLE group_member
    ADD CONSTRAINT group_member_group_id_fkey
        FOREIGN KEY (group_id) REFERENCES app_group(group_id) ON DELETE CASCADE;

ALTER TABLE group_member
    ADD CONSTRAINT group_member_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES app_user(user_id) ON DELETE CASCADE;

CREATE INDEX idx_group_member_user
    ON group_member(user_id);


-- invite_code: 그룹 초대코드 (해시 기반)
CREATE TABLE invite_code (
                             code_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             group_id   UUID NOT NULL,
                             inviter_id UUID,
                             code_hash  CHAR(64),          -- [v1.2] 추가: 코드 해시
                             expires_at TIMESTAMPTZ NOT NULL,
                             max_uses   INTEGER NOT NULL DEFAULT 1,
                             used_count INTEGER NOT NULL DEFAULT 0,
                             created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                             status     VARCHAR(12) NOT NULL DEFAULT 'ACTIVE',
                             code       VARCHAR(64),       -- 실제 초대 코드 문자열 (nullable)
                             CONSTRAINT invite_code_max_uses_check CHECK (max_uses > 0),
                             CONSTRAINT invite_code_used_count_check CHECK (used_count >= 0),
                             CONSTRAINT invite_code_status_check
                                 CHECK (status IN ('ACTIVE','EXPIRED','REVOKED'))
);

ALTER TABLE invite_code
    ADD CONSTRAINT invite_code_group_id_fkey
        FOREIGN KEY (group_id) REFERENCES app_group(group_id) ON DELETE CASCADE;

ALTER TABLE invite_code
    ADD CONSTRAINT invite_code_inviter_id_fkey
        FOREIGN KEY (inviter_id) REFERENCES app_user(user_id) ON DELETE SET NULL;

-- [v1.2 변경]
-- v1.1: code VARCHAR(12) UNIQUE
-- v1.2: code_hash CHAR(64) UNIQUE (실제 코드는 code 컬럼에 저장)
CREATE UNIQUE INDEX invite_code_code_hash_key
    ON invite_code(code_hash);

CREATE INDEX idx_invite_code_group
    ON invite_code(group_id);

CREATE INDEX idx_invite_code_status
    ON invite_code(status);


-- invite_redeem: 초대코드로 실제 가입한 이력
CREATE TABLE invite_redeem (
                               redeem_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               code_id     UUID NOT NULL,
                               group_id    UUID NOT NULL,
                               user_id     UUID NOT NULL,
                               redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE invite_redeem
    ADD CONSTRAINT invite_redeem_code_id_fkey
        FOREIGN KEY (code_id) REFERENCES invite_code(code_id) ON DELETE CASCADE;

ALTER TABLE invite_redeem
    ADD CONSTRAINT invite_redeem_group_id_fkey
        FOREIGN KEY (group_id) REFERENCES app_group(group_id) ON DELETE CASCADE;

ALTER TABLE invite_redeem
    ADD CONSTRAINT invite_redeem_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES app_user(user_id) ON DELETE CASCADE;

CREATE INDEX idx_invite_redeem_code
    ON invite_redeem(code_id);


-- =============================
-- 4) 재고 (Inventory)
-- =============================

-- category: 그룹별 품목 카테고리
CREATE TABLE category (
                          category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          group_id    UUID NOT NULL,
                          name        VARCHAR(60) NOT NULL
);

ALTER TABLE category
    ADD CONSTRAINT category_group_id_fkey
        FOREIGN KEY (group_id) REFERENCES app_group(group_id) ON DELETE CASCADE;

ALTER TABLE category
    ADD CONSTRAINT category_group_id_name_key
        UNIQUE (group_id, name);

-- storage_location: 보관 위치 (냉장/냉동/실온 등)
CREATE TABLE storage_location (
                                  location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  group_id    UUID NOT NULL,
                                  name        VARCHAR(60) NOT NULL,
                                  storage_type VARCHAR(12) NOT NULL,
                                  CONSTRAINT storage_location_storage_type_check
                                      CHECK (storage_type IN ('FRIDGE','FREEZER','ROOM_TEMP','PANTRY','OTHER'))
);

ALTER TABLE storage_location
    ADD CONSTRAINT storage_location_group_id_fkey
        FOREIGN KEY (group_id) REFERENCES app_group(group_id) ON DELETE CASCADE;

ALTER TABLE storage_location
    ADD CONSTRAINT storage_location_group_id_name_key
        UNIQUE (group_id, name);

-- item: 실제 재고 품목
CREATE TABLE item (
                      item_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                      group_id     UUID NOT NULL,
                      name         VARCHAR(120) NOT NULL,
                      category_id  UUID,
                      location_id  UUID,
                      quantity     NUMERIC(12,3) NOT NULL DEFAULT 0,
                      unit         VARCHAR(16) NOT NULL DEFAULT 'ea',
                      min_threshold NUMERIC(12,3),
                      expiry_date  DATE,
                      status       VARCHAR(12) NOT NULL DEFAULT 'ACTIVE',
                      barcode      VARCHAR(32),
                      photo_url    TEXT,
                      created_by   UUID,
                      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
                      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
                      CONSTRAINT item_quantity_check      CHECK (quantity >= 0),
                      CONSTRAINT item_min_threshold_check CHECK (min_threshold >= 0),
                      CONSTRAINT item_status_check
                          CHECK (status IN ('ACTIVE','EXPIRED','DEPLETED'))
);

ALTER TABLE item
    ADD CONSTRAINT item_group_id_fkey
        FOREIGN KEY (group_id) REFERENCES app_group(group_id) ON DELETE CASCADE;

ALTER TABLE item
    ADD CONSTRAINT item_category_id_fkey
        FOREIGN KEY (category_id) REFERENCES category(category_id) ON DELETE SET NULL;

ALTER TABLE item
    ADD CONSTRAINT item_location_id_fkey
        FOREIGN KEY (location_id) REFERENCES storage_location(location_id) ON DELETE SET NULL;

ALTER TABLE item
    ADD CONSTRAINT item_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES app_user(user_id) ON DELETE SET NULL;

ALTER TABLE item
    ADD CONSTRAINT item_group_id_name_unit_key
        UNIQUE (group_id, name, unit);

CREATE INDEX idx_item_group   ON item(group_id);
CREATE INDEX idx_item_expiry  ON item(expiry_date);
CREATE INDEX idx_item_status  ON item(status);

CREATE UNIQUE INDEX ux_item_barcode_per_group
    ON item(group_id, barcode)
    WHERE barcode IS NOT NULL;

-- item_event: 품목 변경 이력
CREATE TABLE item_event (
                            event_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            item_id    UUID NOT NULL,
                            actor_id   UUID,
                            event_type VARCHAR(16) NOT NULL,
                            qty_change NUMERIC(12,3),
                            prev_values JSONB,
                            new_values  JSONB,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                            CONSTRAINT item_event_event_type_check
                                CHECK (event_type IN ('CREATE','UPDATE','DELETE','ADJUST','PURCHASE_IN'))
);

ALTER TABLE item_event
    ADD CONSTRAINT item_event_item_id_fkey
        FOREIGN KEY (item_id) REFERENCES item(item_id) ON DELETE CASCADE;

ALTER TABLE item_event
    ADD CONSTRAINT item_event_actor_id_fkey
        FOREIGN KEY (actor_id) REFERENCES app_user(user_id) ON DELETE SET NULL;

CREATE INDEX idx_item_event_item
    ON item_event(item_id);


-- =============================
-- 5) 쇼핑 리스트 & 구매
-- =============================

-- shopping_list: 그룹별 쇼핑 리스트 헤더
CREATE TABLE shopping_list (
                               list_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               group_id    UUID NOT NULL,
                               title       VARCHAR(120) NOT NULL,
                               status      VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
                               confirmed_by UUID,
                               confirmed_at TIMESTAMPTZ,
                               created_by  UUID NOT NULL,
                               created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                               updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                               CONSTRAINT shopping_list_status_check
                                   CHECK (status IN ('DRAFT','CONFIRMED','ORDERED','CLOSED'))
);

ALTER TABLE shopping_list
    ADD CONSTRAINT shopping_list_group_id_fkey
        FOREIGN KEY (group_id) REFERENCES app_group(group_id) ON DELETE CASCADE;

ALTER TABLE shopping_list
    ADD CONSTRAINT shopping_list_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES app_user(user_id) ON DELETE SET NULL;

ALTER TABLE shopping_list
    ADD CONSTRAINT shopping_list_confirmed_by_fkey
        FOREIGN KEY (confirmed_by) REFERENCES app_user(user_id) ON DELETE SET NULL;

CREATE INDEX idx_shopping_list_group
    ON shopping_list(group_id);

-- shopping_item: 쇼핑 리스트 항목
CREATE TABLE shopping_item (
                               item_row_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               list_id       UUID NOT NULL,
                               item_name     VARCHAR(120) NOT NULL,
                               desired_qty   NUMERIC(12,3) NOT NULL,
                               unit          VARCHAR(16) NOT NULL DEFAULT 'ea',
                               linked_item   UUID,
                               assignee_id   UUID,
                               status        VARCHAR(16) NOT NULL DEFAULT 'PENDING',
                               purchased_qty NUMERIC(12,3),
                               purchased_at  TIMESTAMPTZ,
                               CONSTRAINT shopping_item_desired_qty_check CHECK (desired_qty > 0),
                               CONSTRAINT shopping_item_purchased_qty_check CHECK (purchased_qty >= 0),
                               CONSTRAINT shopping_item_status_check
                                   CHECK (status IN ('PENDING','PURCHASED','REMOVED'))
);

ALTER TABLE shopping_item
    ADD CONSTRAINT shopping_item_list_id_fkey
        FOREIGN KEY (list_id) REFERENCES shopping_list(list_id) ON DELETE CASCADE;

ALTER TABLE shopping_item
    ADD CONSTRAINT shopping_item_linked_item_fkey
        FOREIGN KEY (linked_item) REFERENCES item(item_id) ON DELETE SET NULL;

ALTER TABLE shopping_item
    ADD CONSTRAINT shopping_item_assignee_id_fkey
        FOREIGN KEY (assignee_id) REFERENCES app_user(user_id) ON DELETE SET NULL;

CREATE INDEX idx_shopping_item_list
    ON shopping_item(list_id);

CREATE INDEX idx_shopping_item_status
    ON shopping_item(status);

-- shopping_comment: 쇼핑 리스트 댓글
CREATE TABLE shopping_comment (
                                  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  list_id    UUID NOT NULL,
                                  author_id  UUID NOT NULL,
                                  body       TEXT NOT NULL,
                                  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE shopping_comment
    ADD CONSTRAINT shopping_comment_list_id_fkey
        FOREIGN KEY (list_id) REFERENCES shopping_list(list_id) ON DELETE CASCADE;

ALTER TABLE shopping_comment
    ADD CONSTRAINT shopping_comment_author_id_fkey
        FOREIGN KEY (author_id) REFERENCES app_user(user_id) ON DELETE SET NULL;

-- purchase_history: 구매 이력
CREATE TABLE purchase_history (
                                  purchase_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  group_id     UUID NOT NULL,
                                  item_name    VARCHAR(120) NOT NULL,
                                  qty          NUMERIC(12,3) NOT NULL,
                                  unit         VARCHAR(16) NOT NULL DEFAULT 'ea',
                                  price_total  NUMERIC(12,2),
                                  currency     VARCHAR(8) DEFAULT 'KRW',
                                  purchased_by UUID,
                                  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                  linked_item  UUID,
                                  source_list  UUID,
                                  CONSTRAINT purchase_history_qty_check CHECK (qty > 0)
);

ALTER TABLE purchase_history
    ADD CONSTRAINT purchase_history_group_id_fkey
        FOREIGN KEY (group_id) REFERENCES app_group(group_id) ON DELETE CASCADE;

ALTER TABLE purchase_history
    ADD CONSTRAINT purchase_history_purchased_by_fkey
        FOREIGN KEY (purchased_by) REFERENCES app_user(user_id) ON DELETE SET NULL;

ALTER TABLE purchase_history
    ADD CONSTRAINT purchase_history_linked_item_fkey
        FOREIGN KEY (linked_item) REFERENCES item(item_id) ON DELETE SET NULL;

ALTER TABLE purchase_history
    ADD CONSTRAINT purchase_history_source_list_fkey
        FOREIGN KEY (source_list) REFERENCES shopping_list(list_id) ON DELETE SET NULL;

CREATE INDEX idx_purchase_group_time
    ON purchase_history(group_id, purchased_at);


-- =============================
-- 6) 알림 & 설정
-- =============================

-- notification_pref: 사용자별 알림 설정
CREATE TABLE notification_pref (
                                   user_id      UUID PRIMARY KEY,
                                   push_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
                                   email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                                   updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notification_pref
    ADD CONSTRAINT notification_pref_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES app_user(user_id) ON DELETE CASCADE;

-- notification: 실제 발송된 알림 로그
CREATE TABLE notification (
                              notif_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_id  UUID NOT NULL,
                              topic    VARCHAR(24) NOT NULL,
                              title    TEXT NOT NULL,
                              body     TEXT NOT NULL,
                              payload  JSONB,
                              sent_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                              read_at  TIMESTAMPTZ,
                              CONSTRAINT notification_topic_check
                                  CHECK (topic IN (
                                                   'LOW_STOCK','EXPIRY_SOON','INVITE_EXPIRY','NEW_MEMBER',
                                                   'LIST_CONFIRMED','PURCHASE_DONE','SYSTEM'
                                      ))
);

ALTER TABLE notification
    ADD CONSTRAINT notification_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES app_user(user_id) ON DELETE CASCADE;

CREATE INDEX idx_notification_user_time
    ON notification(user_id, sent_at DESC);


-- =============================
-- 7) 감사 & 에러 로그
-- =============================

-- audit_log: 주요 액션 감사 로그
CREATE TABLE audit_log (
                           log_id      BIGSERIAL PRIMARY KEY,
                           occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                           actor_id    UUID,
                           group_id    UUID,
                           entity_type VARCHAR(24) NOT NULL,
                           entity_id   UUID,
                           action      VARCHAR(16) NOT NULL,
                           details     JSONB
);

ALTER TABLE audit_log
    ADD CONSTRAINT audit_log_actor_id_fkey
        FOREIGN KEY (actor_id) REFERENCES app_user(user_id) ON DELETE SET NULL;

ALTER TABLE audit_log
    ADD CONSTRAINT audit_log_group_id_fkey
        FOREIGN KEY (group_id) REFERENCES app_group(group_id) ON DELETE SET NULL;

CREATE INDEX idx_audit_time
    ON audit_log(occurred_at DESC);

CREATE INDEX idx_audit_actor
    ON audit_log(actor_id);

-- error_log: 시스템 에러 로그
CREATE TABLE error_log (
                           error_id   BIGSERIAL PRIMARY KEY,
                           occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                           level      VARCHAR(10) NOT NULL,
                           message    TEXT NOT NULL,
                           stacktrace TEXT,
                           context    JSONB,
                           CONSTRAINT error_log_level_check
                               CHECK (level IN ('INFO','WARN','ERROR','FATAL'))
);

-- =============================
-- 8) 파생 뷰 (재고 부족/유통기한 임박)
-- =============================

CREATE VIEW v_item_low_stock AS
SELECT
    item_id, group_id, name, category_id, location_id,
    quantity, unit, min_threshold, expiry_date,
    status, barcode, photo_url,
    created_by, created_at, updated_at
FROM item i
WHERE min_threshold IS NOT NULL
  AND quantity <= min_threshold
  AND status <> 'DEPLETED';

CREATE VIEW v_item_expiry_alert AS
SELECT
    item_id, group_id, name, category_id, location_id,
    quantity, unit, min_threshold, expiry_date,
    status, barcode, photo_url,
    created_by, created_at, updated_at,
    (expiry_date - CURRENT_DATE) AS days_to_expiry
FROM item i
WHERE expiry_date IS NOT NULL
  AND status = 'ACTIVE'
  AND (expiry_date - CURRENT_DATE) BETWEEN 0 AND 7;


-- =============================
-- 9) 트리거 정의
-- =============================

-- 그룹 생성 시 OWNER 자동 추가
CREATE TRIGGER trg_group_owner
    AFTER INSERT ON app_group
    FOR EACH ROW EXECUTE FUNCTION ensure_group_owner();

-- app_user.updated_at 자동 갱신
CREATE TRIGGER trg_touch_user
    BEFORE UPDATE ON app_user
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- item.updated_at 자동 갱신
CREATE TRIGGER trg_touch_item
    BEFORE UPDATE ON item
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- shopping_list.updated_at 자동 갱신
CREATE TRIGGER trg_touch_shopping_list
    BEFORE UPDATE ON shopping_list
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- 쇼핑 항목 구매 시 후처리
CREATE TRIGGER trg_shopping_item_purchased
    AFTER UPDATE ON shopping_item
    FOR EACH ROW EXECUTE FUNCTION on_shopping_item_purchased();

-- =========================================
-- 스키마 v1.2 끝
-- =========================================
