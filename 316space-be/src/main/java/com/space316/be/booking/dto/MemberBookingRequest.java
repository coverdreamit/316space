package com.space316.be.booking.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public record MemberBookingRequest(

        @NotBlank
        String hallId,

        @NotNull @Future
        LocalDateTime startAt,

        @NotNull @Future
        LocalDateTime endAt,

        @Positive
        Integer headcount,

        String purpose,

        String note
) {}
