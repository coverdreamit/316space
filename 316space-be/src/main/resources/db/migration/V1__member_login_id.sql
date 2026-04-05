-- 기존 이메일 로그인 스키마 → 아이디(login_id) 기준으로 이전합니다. (PostgreSQL)

ALTER TABLE member ADD COLUMN IF NOT EXISTS login_id VARCHAR(30);

UPDATE member SET login_id = email WHERE login_id IS NULL;

ALTER TABLE member ALTER COLUMN login_id SET NOT NULL;

ALTER TABLE member ALTER COLUMN email DROP NOT NULL;

ALTER TABLE member ALTER COLUMN phone DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_member_login_id ON member (login_id);
