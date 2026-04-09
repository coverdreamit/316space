package com.space316.be.booking;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Component;

/**
 * 동일 홀에 대한 예약 생성을 직렬화해, 겹침 검사와 INSERT 사이 레이스로 이중 예약이 들어가는 것을 막습니다.
 * PostgreSQL 전용(pg_advisory_xact_lock).
 */
@Component
public class PostgresHallBookingLock {

    @PersistenceContext
    private EntityManager entityManager;

    public void lockHallForNewBooking(String hallId) {
        if (hallId == null || hallId.isBlank()) {
            return;
        }
        entityManager
                .createNativeQuery("SELECT pg_advisory_xact_lock(hashtext(cast(:hid as text)))")
                .setParameter("hid", hallId.trim())
                .getSingleResult();
    }
}
