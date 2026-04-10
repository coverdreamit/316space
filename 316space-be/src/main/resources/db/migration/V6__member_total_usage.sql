-- 회원 누적 이용 시간(분) + 예약별 적립 여부(중복 방지)
-- PostgreSQL

ALTER TABLE member ADD COLUMN IF NOT EXISTS total_usage_minutes BIGINT NOT NULL DEFAULT 0;

ALTER TABLE booking ADD COLUMN IF NOT EXISTS usage_applied BOOLEAN NOT NULL DEFAULT FALSE;

-- 기존 데이터: 확정·종료된 회원 예약을 합산해 회원 합계에 반영 후 적립 완료 표시
UPDATE member AS m
SET total_usage_minutes = COALESCE(s.sum_minutes, 0)
FROM (
    SELECT b.member_id AS mid,
           SUM(GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (b.end_at - b.start_at)) / 60))::bigint) AS sum_minutes
    FROM booking b
    WHERE b.member_id IS NOT NULL
      AND b.status = 'CONFIRMED'
      AND b.end_at <= NOW()
    GROUP BY b.member_id
) AS s
WHERE m.id = s.mid;

UPDATE booking
SET usage_applied = TRUE
WHERE member_id IS NOT NULL
  AND status = 'CONFIRMED'
  AND end_at <= NOW();
