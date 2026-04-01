package com.space316.be.booking.dto;

import com.space316.be.domain.booking.Booking;
import com.space316.be.domain.booking.BookingStatus;
import java.time.LocalDateTime;

public record BookingResponse(
        Long id,
        String bookingNo,
        String guestName,
        String guestPhone,
        String hallId,
        LocalDateTime startAt,
        LocalDateTime endAt,
        Integer headcount,
        String purpose,
        String note,
        BookingStatus status,
        LocalDateTime cancelledAt,
        String cancelReason,
        LocalDateTime createdAt
) {
    public static BookingResponse from(Booking b) {
        return new BookingResponse(
                b.getId(),
                b.getBookingNo(),
                b.getGuestName(),
                b.getGuestPhone(),
                b.getHallId(),
                b.getStartAt(),
                b.getEndAt(),
                b.getHeadcount(),
                b.getPurpose(),
                b.getNote(),
                b.getStatus(),
                b.getCancelledAt(),
                b.getCancelReason(),
                b.getCreatedAt()
        );
    }
}
