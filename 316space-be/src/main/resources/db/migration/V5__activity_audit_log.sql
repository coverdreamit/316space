-- 사이트 활동 감사 로그 (관리자 조회용)
CREATE TABLE IF NOT EXISTS activity_audit_log (
    id              BIGSERIAL PRIMARY KEY,
    occurred_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actor_member_id BIGINT NULL REFERENCES member (id) ON DELETE SET NULL,
    actor_label     VARCHAR(128) NULL,
    action          VARCHAR(64) NOT NULL,
    target_type     VARCHAR(32) NULL,
    target_id       VARCHAR(64) NULL,
    ip_address      VARCHAR(45) NULL,
    detail          TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_audit_log_occurred_at ON activity_audit_log (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_audit_log_action ON activity_audit_log (action);
