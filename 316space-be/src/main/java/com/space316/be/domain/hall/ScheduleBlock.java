package com.space316.be.domain.hall;

import com.space316.be.domain.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "schedule_block")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ScheduleBlock extends BaseEntity {

    @Id
    @SequenceGenerator(name = "schedule_block_seq", sequenceName = "schedule_block_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "schedule_block_seq")
    private Long id;

    @Column(name = "hall_id", nullable = false, length = 30)
    private String hallId;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "block_type", nullable = false, length = 30)
    private ScheduleBlockType blockType;

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Builder
    private ScheduleBlock(String hallId, LocalDateTime startAt, LocalDateTime endAt,
            ScheduleBlockType blockType, String title, String note) {
        this.hallId = hallId;
        this.startAt = startAt;
        this.endAt = endAt;
        this.blockType = blockType;
        this.title = title;
        this.note = note;
    }

    public void replace(String hallId, LocalDateTime startAt, LocalDateTime endAt,
            ScheduleBlockType blockType, String title, String note) {
        this.hallId = hallId;
        this.startAt = startAt;
        this.endAt = endAt;
        this.blockType = blockType;
        this.title = title;
        this.note = note;
    }
}
