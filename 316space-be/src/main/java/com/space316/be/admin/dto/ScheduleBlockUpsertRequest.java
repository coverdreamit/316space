package com.space316.be.admin.dto;

import com.space316.be.domain.hall.ScheduleBlockType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record ScheduleBlockUpsertRequest(
        @NotBlank @Size(max = 30) String hallId,
        @NotNull LocalDateTime startAt,
        @NotNull LocalDateTime endAt,
        @NotNull ScheduleBlockType blockType,
        @Size(max = 200) String title,
        @Size(max = 5000) String note) {}
