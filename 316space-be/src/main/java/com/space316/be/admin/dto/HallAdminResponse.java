package com.space316.be.admin.dto;

import com.space316.be.domain.hall.Hall;
import java.time.LocalDateTime;

public record HallAdminResponse(
        Long id,
        String hallId,
        String name,
        int sortOrder,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static HallAdminResponse from(Hall h) {
        return new HallAdminResponse(
                h.getId(),
                h.getHallId(),
                h.getName(),
                h.getSortOrder(),
                h.isActive(),
                h.getCreatedAt(),
                h.getUpdatedAt());
    }
}
