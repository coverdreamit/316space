package com.space316.be.admin;

import com.space316.be.admin.dto.ScheduleBlockResponse;
import com.space316.be.admin.dto.ScheduleBlockUpsertRequest;
import com.space316.be.domain.booking.BookingRepository;
import com.space316.be.domain.hall.ScheduleBlock;
import com.space316.be.domain.hall.ScheduleBlockRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminScheduleBlockService {

    private final ScheduleBlockRepository scheduleBlockRepository;
    private final BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public List<ScheduleBlockResponse> list(LocalDateTime from, LocalDateTime to, String hallId) {
        validateRange(from, to);
        String hall = blankToNull(hallId);
        return scheduleBlockRepository.findOverlappingRange(hall, from, to).stream()
                .map(ScheduleBlockResponse::from)
                .toList();
    }

    @Transactional
    public ScheduleBlockResponse create(ScheduleBlockUpsertRequest req) {
        validateRange(req.startAt(), req.endAt());
        validateNoBlockOverlap(null, req.hallId(), req.startAt(), req.endAt());
        validateNoBookingOverlap(req.hallId(), req.startAt(), req.endAt());

        ScheduleBlock saved = scheduleBlockRepository.save(ScheduleBlock.builder()
                .hallId(req.hallId().trim())
                .startAt(req.startAt())
                .endAt(req.endAt())
                .blockType(req.blockType())
                .title(blankToNull(req.title()))
                .note(req.note())
                .build());
        return ScheduleBlockResponse.from(saved);
    }

    @Transactional
    public ScheduleBlockResponse update(Long id, ScheduleBlockUpsertRequest req) {
        ScheduleBlock block = scheduleBlockRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 스케줄 블록입니다."));
        validateRange(req.startAt(), req.endAt());
        validateNoBlockOverlap(id, req.hallId(), req.startAt(), req.endAt());
        validateNoBookingOverlap(req.hallId(), req.startAt(), req.endAt());

        block.replace(
                req.hallId().trim(),
                req.startAt(),
                req.endAt(),
                req.blockType(),
                blankToNull(req.title()),
                req.note());
        return ScheduleBlockResponse.from(block);
    }

    @Transactional
    public void delete(Long id) {
        if (!scheduleBlockRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 스케줄 블록입니다.");
        }
        scheduleBlockRepository.deleteById(id);
    }

    private void validateRange(LocalDateTime from, LocalDateTime to) {
        if (!to.isAfter(from)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "조회 종료 시각은 시작 시각보다 늦어야 합니다.");
        }
    }

    private void validateNoBlockOverlap(Long excludeId, String hallId, LocalDateTime startAt, LocalDateTime endAt) {
        boolean overlap = excludeId == null
                ? scheduleBlockRepository.existsOverlap(hallId, startAt, endAt)
                : scheduleBlockRepository.existsOverlapExcluding(excludeId, hallId, startAt, endAt);
        if (overlap) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "같은 홀에 겹치는 스케줄 블록이 이미 있습니다.");
        }
    }

    private void validateNoBookingOverlap(String hallId, LocalDateTime startAt, LocalDateTime endAt) {
        if (bookingRepository.existsOverlap(hallId, startAt, endAt)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "해당 시간대에 예약이 있어 블록을 둘 수 없습니다.");
        }
    }

    private static String blankToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }
}
