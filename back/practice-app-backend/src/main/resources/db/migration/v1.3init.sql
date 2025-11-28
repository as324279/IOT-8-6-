-- 1. 스키마 초기화 (기존 데이터 삭제)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- 2. 확장 모듈
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ========================================================
-- 3. 사용자 & 인증 (Users & Auth) - [팀원 로직 반영]
-- ========================================================

-- 3-1. app_user (email_verified 컬럼 추가됨)
CREATE TABLE app_user (
                          user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          email         VARCHAR(320) NOT NULL,
                          password_hash TEXT NOT NULL,
                          name          VARCHAR(30) NOT NULL,
                          profile_image TEXT,
                          email_verified BOOLEAN NOT NULL DEFAULT FALSE, -- [팀원 추가]
                          created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
                          updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ux_app_user_email_nocase ON app_user (LOWER(email));

-- 3-2. email_verification (user_id FK 삭제 -> email 사용)
CREATE TABLE email_verification (
                                    token_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    email      VARCHAR(320) NOT NULL,   -- [팀원 변경] 가입 전이라 user_id가 없음 -> email로 식별
                                    token      VARCHAR(255) NOT NULL,
                                    purpose    VARCHAR(20) NOT NULL,
                                    new_email  VARCHAR(320),
                                    expires_at TIMESTAMPTZ NOT NULL,
                                    used_at    TIMESTAMPTZ,
                                    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                    CONSTRAINT email_verification_purpose_check
                                        CHECK (purpose IN ('signup', 'verify_email', 'reset_password', 'change_email'))
);
-- (주의: 여기엔 user_id FK가 없습니다!)

-- 3-3. user_session
CREATE TABLE user_session (
                              session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_id    UUID NOT NULL,
                              device_info TEXT,
                              ip_addr    INET,
                              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                              last_seen  TIMESTAMPTZ NOT NULL DEFAULT now(),
                              revoked    BOOLEAN NOT NULL DEFAULT FALSE
);
ALTER TABLE user_session ADD CONSTRAINT user_session_user_id_fkey FOREIGN KEY (user_id) REFERENCES app_user(user_id) ON DELETE CASCADE;


-- ========================================================
-- 4. 나머지 테이블 (그룹, 물품, 쇼핑 - 작성자님 기존 코드)
-- ========================================================

-- app_group
CREATE TABLE app_group (
                           group_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           name        VARCHAR(100) NOT NULL,
                           created_by  UUID NOT NULL REFERENCES app_user(user_id),
                           created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                           dissolved_at TIMESTAMPTZ
);

-- group_member
CREATE TABLE group_member (
                              group_id  UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                              user_id   UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
                              role      VARCHAR(10) NOT NULL CHECK (role IN ('OWNER','MANAGER','MEMBER')),
                              joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                              PRIMARY KEY (group_id, user_id)
);

-- invite_code
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

-- invite_redeem
CREATE TABLE invite_redeem (
                               redeem_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               code_id     UUID NOT NULL REFERENCES invite_code(code_id) ON DELETE CASCADE,
                               group_id    UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                               user_id     UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
                               redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- category
CREATE TABLE category (
                          category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          group_id    UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                          name        VARCHAR(60) NOT NULL,
                          UNIQUE (group_id, name)
);

-- storage_location
CREATE TABLE storage_location (
                                  location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  group_id    UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                                  name        VARCHAR(60) NOT NULL,
                                  storage_type VARCHAR(12) NOT NULL,
                                  UNIQUE (group_id, name)
);

-- item
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

-- item_event
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

-- shopping_list
CREATE TABLE shopping_list (
                               list_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               group_id    UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                               title       VARCHAR(120) NOT NULL,
                               status      VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
                               created_by  UUID NOT NULL REFERENCES app_user(user_id),
                               created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                               updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- shopping_item
CREATE TABLE shopping_item (
                               item_row_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               list_id       UUID NOT NULL REFERENCES shopping_list(list_id) ON DELETE CASCADE,
                               item_name     VARCHAR(120) NOT NULL,
                               desired_qty   NUMERIC(12,3) NOT NULL,
                               unit          VARCHAR(16) NOT NULL DEFAULT 'ea',
                               linked_item   UUID REFERENCES item(item_id),
                               assignee_id   UUID REFERENCES app_user(user_id),
                               status        VARCHAR(16) NOT NULL DEFAULT 'PENDING',
                               purchased_qty NUMERIC(12,3),
                               purchased_at  TIMESTAMPTZ
);

-- purchase_history
CREATE TABLE purchase_history (
                                  purchase_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  group_id     UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                                  item_name    VARCHAR(120) NOT NULL,
                                  qty          NUMERIC(12,3) NOT NULL,
                                  unit         VARCHAR(16) NOT NULL DEFAULT 'ea',
                                  purchased_by UUID REFERENCES app_user(user_id),
                                  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                  linked_item  UUID REFERENCES item(item_id),
                                  source_list  UUID REFERENCES shopping_list(list_id)
);

-- Function & Trigger (재고 자동 반영)
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

CREATE TRIGGER trg_shopping_item_purchased
    AFTER UPDATE ON shopping_item
    FOR EACH ROW EXECUTE FUNCTION on_shopping_item_purchased();


ALTER TABLE shopping_item ADD COLUMN note VARCHAR(255);--쇼핑리스트 메모기능추가