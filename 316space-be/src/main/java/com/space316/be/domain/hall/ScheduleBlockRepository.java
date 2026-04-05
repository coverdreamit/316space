package com.space316.be.domain.hall;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ScheduleBlockRepository extends JpaRepository<ScheduleBlock, Long> {

    @Query("""
            SELECT COUNT(s) > 0 FROM ScheduleBlock s
            WHERE s.hallId = :hallId
              AND s.startAt < :endAt
              AND s.endAt > :startAt
            """)
    boolean existsOverlap(
            @Param("hallId") String hallId,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt);

    @Query("""
            SELECT COUNT(s) > 0 FROM ScheduleBlock s
            WHERE s.hallId = :hallId
              AND s.id <> :excludeId
              AND s.startAt < :endAt
              AND s.endAt > :startAt
            """)
    boolean existsOverlapExcluding(
            @Param("excludeId") Long excludeId,
            @Param("hallId") String hallId,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt);

    @Query("""
            SELECT s FROM ScheduleBlock s
            WHERE s.startAt < :rangeEnd
              AND s.endAt > :rangeStart
              AND (:hallId IS NULL OR s.hallId = :hallId)
            ORDER BY s.hallId, s.startAt
            """)
    List<ScheduleBlock> findOverlappingRange(
            @Param("hallId") String hallId,
            @Param("rangeStart") LocalDateTime rangeStart,
            @Param("rangeEnd") LocalDateTime rangeEnd);
}
