package com.space316.be.domain.booking;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {

    Optional<Booking> findByBookingNo(String bookingNo);

    List<Booking> findByMemberIdOrderByCreatedAtDesc(Long memberId);

    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // 홀 시간대 중복 체크 (취소 제외)
    @Query("""
            SELECT COUNT(b) > 0 FROM Booking b
            WHERE b.hallId = :hallId
              AND b.status <> 'CANCELLED'
              AND b.startAt < :endAt
              AND b.endAt > :startAt
            """)
    boolean existsOverlap(
            @Param("hallId") String hallId,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt);

    @Query("""
            SELECT b FROM Booking b
            WHERE b.hallId = :hallId
              AND b.status <> 'CANCELLED'
              AND b.startAt < :rangeEnd
              AND b.endAt > :rangeStart
            ORDER BY b.startAt
            """)
    List<Booking> findActiveInRange(
            @Param("hallId") String hallId,
            @Param("rangeStart") LocalDateTime rangeStart,
            @Param("rangeEnd") LocalDateTime rangeEnd);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Booking b SET b.member = null WHERE b.member.id = :memberId")
    void detachMember(@Param("memberId") Long memberId);

    @Query("""
            SELECT b.id FROM Booking b
            WHERE b.member.id = :memberId
              AND b.usageApplied = false
              AND b.status = 'CONFIRMED'
              AND b.endAt <= :now
            ORDER BY b.id
            """)
    List<Long> findIdsPendingUsageForMember(@Param("memberId") Long memberId, @Param("now") LocalDateTime now);

    @Query("""
            SELECT b.id FROM Booking b
            WHERE b.usageApplied = false
              AND b.status = 'CONFIRMED'
              AND b.member IS NOT NULL
              AND b.endAt <= :now
            ORDER BY b.id
            """)
    List<Long> findIdsPendingUsage(@Param("now") LocalDateTime now);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Booking b SET b.usageApplied = true WHERE b.id = :id AND b.usageApplied = false")
    int markUsageApplied(@Param("id") Long id);
}
