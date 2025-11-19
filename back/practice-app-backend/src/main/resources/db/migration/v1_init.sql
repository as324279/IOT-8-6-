-- 가정용 재고 관리 앱 – 데이터베이스 스키마 (v1.0)
-- 대상 DB: PostgreSQL 15 이상
-- 참고:
-- - 모든 타임스탬프는 UTC 기준 (timestamptz)
-- - Enum(열거형)은 CHECK 제약 조건으로 구현됨
-- - 비밀번호는 해시(bcrypt/argon2)로 저장됨; 복잡도 검사는 애플리케이션 계층에서 처리

-- =============================
-- 0) 확장 모듈 (Extensions)
-- =============================
-- gen_random_uuid()는 PG 13+에 내장되어 있지만, 추후 다른 암호화 기능을 위해 pgcrypto 유지
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- 대소문자 구분 없는 이메일 비교를 위해 필요 (app_user.email 필수)
CREATE EXTENSION IF NOT EXISTS citext;


-- =============================
-- 1) 핵심: 사용자 및 인증 (Users & Auth)
-- =============================
CREATE TABLE app_user (
                          user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          email CITEXT NOT NULL UNIQUE,
                          password_hash TEXT NOT NULL,
                          name VARCHAR(30) NOT NULL CHECK (char_length(name) BETWEEN 1 AND 30),
                          profile_image TEXT,
                          email_verified BOOLEAN NOT NULL DEFAULT FALSE,
                          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_user_created_at ON app_user(created_at);

-- 비밀번호 재설정 및 이메일 인증 토큰
CREATE TABLE email_verification (
                                    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    user_id UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
                                    token TEXT NOT NULL UNIQUE,
                                    purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('verify_email','reset_password','change_email')),
                                    new_email CITEXT, -- 이메일 변경 시 사용
                                    expires_at TIMESTAMPTZ NOT NULL,
                                    used_at TIMESTAMPTZ,
                                    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_verification_user_expires ON email_verification(user_id, expires_at);

-- 세션: 사용자당 하나의 활성 세션만 강제 (요구사항 34)
CREATE TABLE user_session (
                              session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_id UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
                              device_info TEXT,
                              ip_addr INET,
                              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                              last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
                              revoked BOOLEAN NOT NULL DEFAULT FALSE
);

-- 취소되지 않은(revoked=false) 세션은 사용자당 하나만 존재하도록 강제
CREATE UNIQUE INDEX ux_user_single_active_session ON user_session(user_id) WHERE (revoked = FALSE);


-- =============================
-- 2) 그룹 및 멤버십 (Groups & Membership)
-- =============================
CREATE TABLE app_group (
                           group_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           name VARCHAR(100) NOT NULL,
                           created_by UUID NOT NULL REFERENCES app_user(user_id) ON DELETE RESTRICT,
                           created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                           dissolved_at TIMESTAMPTZ -- 그룹 해산 일시
);

CREATE INDEX idx_group_created_by ON app_group(created_by);

-- 역할: OWNER(소유자), MANAGER(관리자), MEMBER(멤버)
CREATE TABLE group_member (
                              group_id UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                              user_id UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
                              role VARCHAR(10) NOT NULL CHECK (role IN ('OWNER','MANAGER','MEMBER')),
                              joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                              PRIMARY KEY (group_id, user_id)
);

CREATE INDEX idx_group_member_user ON group_member(user_id);
-- 참고: 스케줄러 작업을 통해 멤버가 없는 그룹은 dissolved_at을 설정하여 자동 해산 가능

-- 초대 코드 / 코드로 가입
CREATE TABLE invite_code (
                             code_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             group_id UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                             inviter_id UUID REFERENCES app_user(user_id) ON DELETE SET NULL,
                             code VARCHAR(12) NOT NULL UNIQUE,
                             expires_at TIMESTAMPTZ NOT NULL,
                             max_uses INT NOT NULL DEFAULT 1 CHECK (max_uses > 0),
                             used_count INT NOT NULL DEFAULT 0 CHECK (used_count >= 0),
                             created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                             status VARCHAR(12) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','EXPIRED','REVOKED'))
);

CREATE INDEX idx_invite_code_group ON invite_code(group_id);

-- 코드를 통한 실제 가입 이력 추적
CREATE TABLE invite_redeem (
                               redeem_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               code_id UUID NOT NULL REFERENCES invite_code(code_id) ON DELETE CASCADE,
                               group_id UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                               user_id UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
                               redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invite_redeem_code ON invite_redeem(code_id);


-- =============================
-- 3) 재고 (품목, 카테고리, 위치, 이력)
-- =============================
CREATE TABLE category (
                          category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          group_id UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                          name VARCHAR(60) NOT NULL,
                          UNIQUE (group_id, name)
);

-- 보관 장소 프리셋: 냉장, 냉동, 실온, 팬트리, 기타
CREATE TABLE storage_location (
                                  location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  group_id UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                                  name VARCHAR(60) NOT NULL,
                                  storage_type VARCHAR(12) NOT NULL CHECK (storage_type IN ('FRIDGE','FREEZER','ROOM_TEMP','PANTRY','OTHER')),
                                  UNIQUE (group_id, name)
);

CREATE TABLE item (
                      item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                      group_id UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                      name VARCHAR(120) NOT NULL,
                      category_id UUID REFERENCES category(category_id) ON DELETE SET NULL,
                      location_id UUID REFERENCES storage_location(location_id) ON DELETE SET NULL,
                      quantity NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
                      unit VARCHAR(16) NOT NULL DEFAULT 'ea',
                      min_threshold NUMERIC(12,3) CHECK (min_threshold >= 0), -- 최소 수량 (알림용)
                      expiry_date DATE,
                      status VARCHAR(12) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','EXPIRED','DEPLETED')),
                      barcode VARCHAR(32),
                      photo_url TEXT,
                      created_by UUID REFERENCES app_user(user_id) ON DELETE SET NULL,
                      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                      UNIQUE (group_id, name, unit)
);

CREATE INDEX idx_item_group ON item(group_id);
CREATE INDEX idx_item_expiry ON item(expiry_date);
CREATE INDEX idx_item_status ON item(status);
-- 그룹 내에서 바코드는 유일해야 함 (바코드가 있을 경우에만)
CREATE UNIQUE INDEX ux_item_barcode_per_group ON item(group_id, barcode) WHERE barcode IS NOT NULL;

-- 품목 변경 이력 (요구사항 48)
CREATE TABLE item_event (
                            event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            item_id UUID NOT NULL REFERENCES item(item_id) ON DELETE CASCADE,
                            actor_id UUID REFERENCES app_user(user_id) ON DELETE SET NULL,
                            event_type VARCHAR(16) NOT NULL CHECK (event_type IN ('CREATE','UPDATE','DELETE','ADJUST','PURCHASE_IN')),
                            qty_change NUMERIC(12,3),
                            prev_values JSONB,
                            new_values JSONB,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_item_event_item ON item_event(item_id);


-- =============================
-- 4) 쇼핑 목록 및 구매 (Shopping Lists & Purchasing)
-- =============================
CREATE TABLE shopping_list (
                               list_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               group_id UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                               title VARCHAR(120) NOT NULL,
                               status VARCHAR(16) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','CONFIRMED','ORDERED','CLOSED')),
                               confirmed_by UUID REFERENCES app_user(user_id) ON DELETE SET NULL,
                               confirmed_at TIMESTAMPTZ,
                               created_by UUID NOT NULL REFERENCES app_user(user_id) ON DELETE SET NULL,
                               created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                               updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shopping_list_group ON shopping_list(group_id);

CREATE TABLE shopping_item (
                               item_row_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               list_id UUID NOT NULL REFERENCES shopping_list(list_id) ON DELETE CASCADE,
                               item_name VARCHAR(120) NOT NULL, -- 자유 입력 텍스트
                               desired_qty NUMERIC(12,3) NOT NULL CHECK (desired_qty > 0),
                               unit VARCHAR(16) NOT NULL DEFAULT 'ea',
                               linked_item UUID REFERENCES item(item_id) ON DELETE SET NULL, -- 기존 재고 품목과 연결된 경우
                               assignee_id UUID REFERENCES app_user(user_id) ON DELETE SET NULL, -- 구매 담당자
                               status VARCHAR(16) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PURCHASED','REMOVED')),
                               purchased_qty NUMERIC(12,3) CHECK (purchased_qty >= 0),
                               purchased_at TIMESTAMPTZ
);

CREATE INDEX idx_shopping_item_list ON shopping_item(list_id);
CREATE INDEX idx_shopping_item_status ON shopping_item(status);

-- 댓글 / 토론 (요구사항 53)
CREATE TABLE shopping_comment (
                                  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  list_id UUID NOT NULL REFERENCES shopping_list(list_id) ON DELETE CASCADE,
                                  author_id UUID NOT NULL REFERENCES app_user(user_id) ON DELETE SET NULL,
                                  body TEXT NOT NULL,
                                  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 구매 이력 분석용 (요구사항 57)
CREATE TABLE purchase_history (
                                  purchase_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  group_id UUID NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,
                                  item_name VARCHAR(120) NOT NULL,
                                  qty NUMERIC(12,3) NOT NULL CHECK (qty > 0),
                                  unit VARCHAR(16) NOT NULL DEFAULT 'ea',
                                  price_total NUMERIC(12,2),
                                  currency VARCHAR(8) DEFAULT 'KRW',
                                  purchased_by UUID REFERENCES app_user(user_id) ON DELETE SET NULL,
                                  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                  linked_item UUID REFERENCES item(item_id) ON DELETE SET NULL,
                                  source_list UUID REFERENCES shopping_list(list_id) ON DELETE SET NULL
);

CREATE INDEX idx_purchase_group_time ON purchase_history(group_id, purchased_at);


-- =============================
-- 5) 알림 및 설정 (Notifications & Preferences)
-- =============================
CREATE TABLE notification_pref (
                                   user_id UUID PRIMARY KEY REFERENCES app_user(user_id) ON DELETE CASCADE,
                                   push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                                   email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    -- 채널별 토글은 컬럼으로 추가 가능
                                   updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notification (
                              notif_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_id UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
                              topic VARCHAR(24) NOT NULL CHECK (topic IN (
                                                                          'LOW_STOCK','EXPIRY_SOON','INVITE_EXPIRY','NEW_MEMBER',
                                                                          'LIST_CONFIRMED','PURCHASE_DONE','SYSTEM'
                                  )),
                              title TEXT NOT NULL,
                              body TEXT NOT NULL,
                              payload JSONB,
                              sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                              read_at TIMESTAMPTZ
);

CREATE INDEX idx_notification_user_time ON notification(user_id, sent_at DESC);


-- =============================
-- 6) 감사 및 에러 로그 (Auditing & Error Logs)
-- =============================
CREATE TABLE audit_log (
                           log_id BIGSERIAL PRIMARY KEY,
                           occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                           actor_id UUID REFERENCES app_user(user_id) ON DELETE SET NULL,
                           group_id UUID REFERENCES app_group(group_id) ON DELETE SET NULL,
                           entity_type VARCHAR(24) NOT NULL,
                           entity_id UUID,
                           action VARCHAR(16) NOT NULL, -- CREATE/UPDATE/DELETE/LOGIN/LOGOUT 등
                           details JSONB
);

CREATE INDEX idx_audit_time ON audit_log(occurred_at DESC);
CREATE INDEX idx_audit_actor ON audit_log(actor_id);

CREATE TABLE error_log (
                           error_id BIGSERIAL PRIMARY KEY,
                           occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                           level VARCHAR(10) NOT NULL CHECK (level IN ('INFO','WARN','ERROR','FATAL')),
                           message TEXT NOT NULL,
                           stacktrace TEXT,
                           context JSONB
);


-- =============================
-- 7) 파생 데이터 및 자동화 보조 (Derived & Automation Aids)
-- =============================
-- 재고 부족 및 유통기한 임박 감지 뷰 (요구사항 44–47, 59–60)
CREATE VIEW v_item_low_stock AS
SELECT i.*
FROM item i
WHERE i.min_threshold IS NOT NULL
  AND i.quantity <= i.min_threshold
  AND i.status <> 'DEPLETED';

CREATE VIEW v_item_expiry_alert AS
SELECT i.*,
       (i.expiry_date - CURRENT_DATE) AS days_to_expiry
FROM item i
WHERE i.expiry_date IS NOT NULL
  AND i.status = 'ACTIVE'
  AND (i.expiry_date - CURRENT_DATE) BETWEEN 0 AND 7; -- 7일 이내 임박

-- 보조: 만료된 품목 매일 업데이트
-- 스케줄러 작업 예시:
-- UPDATE item SET status='EXPIRED' WHERE expiry_date < CURRENT_DATE AND status <> 'EXPIRED';


-- =============================
-- 8) 데이터 무결성 헬퍼 (Triggers & Functions)
-- =============================

-- 그룹 생성자를 자동으로 OWNER로 설정
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

-- updated_at 컬럼 자동 업데이트 함수
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


-- 옵션: 쇼핑 아이템이 '구매됨(PURCHASED)' 상태가 되면 구매 이력을 기록하고 재고를 증가시킴
CREATE OR REPLACE FUNCTION on_shopping_item_purchased()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'PURCHASED' AND (OLD.status IS DISTINCT FROM 'PURCHASED') THEN

        -- 1. 구매 이력(purchase_history)에 기록
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

        -- 2. 기존 재고(item)와 연결된 경우 재고 수량 증가 및 이벤트 로그 기록
        IF NEW.linked_item IS NOT NULL THEN
UPDATE item
SET quantity = quantity + COALESCE(NEW.purchased_qty, NEW.desired_qty)
WHERE item_id = NEW.linked_item;

INSERT INTO item_event(
    item_id, actor_id, event_type, qty_change, created_at
)
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

CREATE TRIGGER trg_shopping_item_purchased
    AFTER UPDATE ON shopping_item
    FOR EACH ROW EXECUTE FUNCTION on_shopping_item_purchased();

-- =============================
-- 9) 예시 쿼리 (문서화)
-- =============================

-- a) 특정 그룹의 멤버와 역할 조회
-- SELECT u.user_id, u.email, gm.role
-- FROM group_member gm
-- JOIN app_user u USING(user_id)
-- WHERE gm.group_id = $1;

-- b) 특정 그룹의 유통기한 7일 이내 임박 품목 조회
-- SELECT * FROM v_item_expiry_alert WHERE group_id = $1;

-- c) 특정 그룹의 재고 부족 품목 조회
-- SELECT * FROM v_item_low_stock WHERE group_id = $1;

-- =============================
-- 스키마 끝
-- =============================