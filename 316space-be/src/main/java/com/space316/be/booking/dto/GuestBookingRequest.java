package com.space316.be.booking.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record GuestBookingRequest(

        @NotBlank @Size(max = 50)
        String guestName,

        @NotBlank @Pattern(regexp = "^010-\\d{4}-\\d{4}$", message = "전화번호 형식: 010-0000-0000")
        String guestPhone,

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
