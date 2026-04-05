package com.space316.be.booking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.space316.be.domain.booking.Booking;
import com.space316.be.domain.booking.BookingStatus;
import com.space316.be.domain.hall.ScheduleBlock;
import com.space316.be.domain.hall.ScheduleBlockType;
import java.time.LocalDateTime;

@JsonInclude(Include.NON_NULL)
public record AvailabilityItemResponse(
        String kind,
        LocalDateTime startAt,
        LocalDateTime endAt,
        String bookingNo,
        BookingStatus status,
        ScheduleBlockType blockType,
        String title) {

    public static AvailabilityItemResponse fromBooking(Booking b) {
        return new AvailabilityItemResponse(
                "BOOKING", b.getStartAt(), b.getEndAt(), b.getBookingNo(), b.getStatus(), null, null);
    }

    public static AvailabilityItemResponse fromBlock(ScheduleBlock s) {
        return new AvailabilityItemResponse(
                "BLOCK", s.getStartAt(), s.getEndAt(), null, null, s.getBlockType(), s.getTitle());
    }
}
