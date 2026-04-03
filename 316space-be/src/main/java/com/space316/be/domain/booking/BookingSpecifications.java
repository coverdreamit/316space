package com.space316.be.domain.booking;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

public final class BookingSpecifications {

    private BookingSpecifications() {}

    /** 관리자 예약 목록 — optional 필터(PostgreSQL에서 null 바인딩 타입 오류를 피하기 위해 Specification 사용) */
    public static Specification<Booking> forAdminSearch(
            String hallId, BookingStatus status, LocalDateTime from, LocalDateTime to) {
        return (root, query, cb) -> {
            List<Predicate> parts = new ArrayList<>();
            if (hallId != null) {
                parts.add(cb.equal(root.get("hallId"), hallId));
            }
            if (status != null) {
                parts.add(cb.equal(root.get("status"), status));
            }
            if (from != null) {
                parts.add(cb.greaterThanOrEqualTo(root.get("startAt"), from));
            }
            if (to != null) {
                parts.add(cb.lessThanOrEqualTo(root.get("startAt"), to));
            }
            return parts.isEmpty() ? cb.conjunction() : cb.and(parts.toArray(Predicate[]::new));
        };
    }
}
