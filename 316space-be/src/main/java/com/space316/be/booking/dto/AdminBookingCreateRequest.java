package com.space316.be.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record AdminBookingCreateRequest(
        @NotBlank @Size(max = 50) String guestName,
        @NotBlank @Size(max = 20) String guestPhone,
        @NotBlank @Size(max = 30) String hallId,
        @NotNull LocalDateTime startAt,
        @NotNull LocalDateTime endAt,
        @Positive Integer headcount,
        @Size(max = 100) String purpose,
        String note) {}
