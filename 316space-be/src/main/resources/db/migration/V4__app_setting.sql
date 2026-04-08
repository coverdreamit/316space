-- 키-값 앱 설정 (Slack 웹훅 등). 관리자 UI에서 수정.
CREATE TABLE IF NOT EXISTS app_setting (
    setting_key   VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
