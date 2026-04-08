-- 비회원 문의 비밀번호 (BCrypt 해시)
ALTER TABLE inquiry ADD COLUMN IF NOT EXISTS guest_password_hash VARCHAR(72);
