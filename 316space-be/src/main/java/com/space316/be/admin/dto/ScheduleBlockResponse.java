package com.space316.be.admin.dto;

import com.space316.be.domain.hall.ScheduleBlock;
import com.space316.be.domain.hall.ScheduleBlockType;
import java.time.LocalDateTime;

public record ScheduleBlockResponse(
        Long id,
        String hallId,
        LocalDateTime startAt,
        LocalDateTime endAt,
        ScheduleBlockType blockType,
        String title,
        String note,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static ScheduleBlockResponse from(ScheduleBlock s) {
        return new ScheduleBlockResponse(
                s.getId(),
                s.getHallId(),
                s.getStartAt(),
                s.getEndAt(),
                s.getBlockType(),
                s.getTitle(),
                s.getNote(),
                s.getCreatedAt(),
                s.getUpdatedAt());
    }
}
