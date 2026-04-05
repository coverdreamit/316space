package com.space316.be.admin;

import com.space316.be.admin.dto.BusinessHoursReplaceRequest;
import com.space316.be.admin.dto.BusinessHoursRowRequest;
import com.space316.be.admin.dto.BusinessHoursRowResponse;
import com.space316.be.domain.hall.BusinessHours;
import com.space316.be.domain.hall.BusinessHoursRepository;
import com.space316.be.domain.hall.HallRepository;
import java.time.DayOfWeek;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminBusinessHoursService {

    private final HallRepository hallRepository;
    private final BusinessHoursRepository businessHoursRepository;

    @Transactional(readOnly = true)
    public List<BusinessHoursRowResponse> list(String hallId) {
        ensureHallExists(hallId);
        return businessHoursRepository.findByHallIdOrderByDayOfWeek(hallId).stream()
                .map(BusinessHoursRowResponse::from)
                .toList();
    }

    @Transactional
    public List<BusinessHoursRowResponse> replace(String hallId, BusinessHoursReplaceRequest req) {
        ensureHallExists(hallId);
        Set<DayOfWeek> seen = new HashSet<>();
        for (BusinessHoursRowRequest row : req.rows()) {
            if (!seen.add(row.dayOfWeek())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "요일이 중복되었습니다.");
            }
            if (!row.closeTime().isAfter(row.openTime())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "종료 시각은 시작 시각보다 늦어야 합니다.");
            }
        }
        businessHoursRepository.deleteByHallId(hallId);
        for (BusinessHoursRowRequest row : req.rows()) {
            businessHoursRepository.save(new BusinessHours(
                    hallId, row.dayOfWeek(), row.openTime(), row.closeTime()));
        }
        return list(hallId);
    }

    private void ensureHallExists(String hallId) {
        hallRepository
                .findByHallId(hallId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 홀입니다."));
    }
}
