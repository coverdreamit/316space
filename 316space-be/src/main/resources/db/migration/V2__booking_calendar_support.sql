-- 예약 캘린더 확장: 홀 마스터, 점유 블록(정검·청소 등), 요일별 영업시간, 휴무/예외일
-- PostgreSQL. IF NOT EXISTS: 운영 DB에 Hibernate 등으로 일부 테이블만 있을 때도 적용 가능

-- 홀(룸) 마스터 — Booking.hall_id 문자열과 동일 코드를 쓰면 조인·검증이 수월합니다.
CREATE TABLE IF NOT EXISTS hall (
    id              BIGSERIAL PRIMARY KEY,
    hall_id         VARCHAR(30) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_hall_active_sort ON hall (active, sort_order);

-- 예약과 별도로 시간대를 막는 구간 (정검, 청소, 내부 사용 등)
CREATE TABLE IF NOT EXISTS schedule_block (
    id              BIGSERIAL PRIMARY KEY,
    hall_id         VARCHAR(30) NOT NULL,
    start_at        TIMESTAMPTZ NOT NULL,
    end_at          TIMESTAMPTZ NOT NULL,
    block_type      VARCHAR(30) NOT NULL,
    title           VARCHAR(200),
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_schedule_block_range CHECK (end_at > start_at)
);

CREATE INDEX IF NOT EXISTS ix_schedule_block_hall_time ON schedule_block (hall_id, start_at, end_at);

-- 홀별 요일 기본 영업 구간 (자정 넘김 영업은 별도 행/정책으로 확장)
CREATE TABLE IF NOT EXISTS business_hours (
    id              BIGSERIAL PRIMARY KEY,
    hall_id         VARCHAR(30) NOT NULL,
    day_of_week     VARCHAR(10) NOT NULL,
    open_time       TIME NOT NULL,
    close_time      TIME NOT NULL,
    CONSTRAINT uq_business_hours_hall_day UNIQUE (hall_id, day_of_week),
    CONSTRAINT chk_business_hours_range CHECK (close_time > open_time)
);

-- 특정 일 휴무·부분 휴무 (hall_id NULL = 전체 시설)
CREATE TABLE IF NOT EXISTS hall_closure (
    id              BIGSERIAL PRIMARY KEY,
    hall_id         VARCHAR(30),
    closure_date    DATE NOT NULL,
    all_day         BOOLEAN NOT NULL DEFAULT TRUE,
    start_at        TIMESTAMPTZ,
    end_at          TIMESTAMPTZ,
    reason          VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_hall_closure_times CHECK (
        all_day = TRUE
        OR (start_at IS NOT NULL AND end_at IS NOT NULL AND end_at > start_at)
    )
);

CREATE INDEX IF NOT EXISTS ix_hall_closure_date_hall ON hall_closure (closure_date, hall_id);
