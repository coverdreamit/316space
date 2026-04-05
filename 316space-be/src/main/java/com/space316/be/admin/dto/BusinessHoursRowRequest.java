package com.space316.be.admin.dto;

import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalTime;

public record BusinessHoursRowRequest(
        @NotNull DayOfWeek dayOfWeek,
        @NotNull LocalTime openTime,
        @NotNull LocalTime closeTime) {}
