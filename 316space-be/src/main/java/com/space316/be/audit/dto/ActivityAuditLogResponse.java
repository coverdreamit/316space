package com.space316.be.audit.dto;

import com.space316.be.domain.audit.ActivityAuditLog;
import java.time.LocalDateTime;

public record ActivityAuditLogResponse(
        long id,
        LocalDateTime occurredAt,
        Long actorMemberId,
        String actorLabel,
        String action,
        String targetType,
        String targetId,
        String ipAddress,
        String detail) {

    public static ActivityAuditLogResponse from(ActivityAuditLog e) {
        return new ActivityAuditLogResponse(
                e.getId(),
                e.getOccurredAt(),
                e.getActorMemberId(),
                e.getActorLabel(),
                e.getAction().name(),
                e.getTargetType(),
                e.getTargetId(),
                e.getIpAddress(),
                e.getDetail());
    }
}
