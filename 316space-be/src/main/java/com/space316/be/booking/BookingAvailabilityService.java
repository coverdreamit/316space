package com.space316.be.booking;

import com.space316.be.booking.dto.AvailabilityItemResponse;
import com.space316.be.booking.dto.AvailabilityResponse;
import com.space316.be.domain.booking.Booking;
import com.space316.be.domain.booking.BookingRepository;
import com.space316.be.domain.hall.HallRepository;
import com.space316.be.domain.hall.ScheduleBlock;
import com.space316.be.domain.hall.ScheduleBlockRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class BookingAvailabilityService {

    private static final int DEFAULT_SLOT_MINUTES = 60;

    private final HallRepository hallRepository;
    private final BookingRepository bookingRepository;
    private final ScheduleBlockRepository scheduleBlockRepository;

    @Transactional(readOnly = true)
    public AvailabilityResponse getAvailability(String hallId, LocalDateTime from, LocalDateTime to) {
        if (!to.isAfter(from)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "조회 종료 시각은 시작 시각보다 늦어야 합니다.");
        }
        hallRepository
                .findByHallIdAndActiveTrue(hallId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않거나 비활성인 홀입니다."));

        List<Booking> bookings = bookingRepository.findActiveInRange(hallId, from, to);
        List<ScheduleBlock> blocks = scheduleBlockRepository.findOverlappingRange(hallId, from, to);

        List<AvailabilityItemResponse> items = new ArrayList<>();
        bookings.stream().map(AvailabilityItemResponse::fromBooking).forEach(items::add);
        blocks.stream().map(AvailabilityItemResponse::fromBlock).forEach(items::add);
        items.sort(Comparator.comparing(AvailabilityItemResponse::startAt));

        return new AvailabilityResponse(hallId, DEFAULT_SLOT_MINUTES, items);
    }
}
