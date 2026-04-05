package com.space316.be.admin;

import com.space316.be.admin.dto.HallAdminResponse;
import com.space316.be.admin.dto.HallCreateRequest;
import com.space316.be.admin.dto.HallUpdateRequest;
import com.space316.be.domain.hall.Hall;
import com.space316.be.domain.hall.HallRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminHallService {

    private final HallRepository hallRepository;

    @Transactional(readOnly = true)
    public List<HallAdminResponse> listAll() {
        return hallRepository.findAllByOrderBySortOrderAscIdAsc().stream()
                .map(HallAdminResponse::from)
                .toList();
    }

    @Transactional
    public HallAdminResponse create(HallCreateRequest req) {
        String code = req.hallId().trim();
        if (hallRepository.existsByHallId(code)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 존재하는 홀 코드입니다.");
        }
        Hall saved = hallRepository.save(Hall.builder()
                .hallId(code)
                .name(req.name().trim())
                .sortOrder(req.sortOrder())
                .active(req.active())
                .build());
        return HallAdminResponse.from(saved);
    }

    @Transactional
    public HallAdminResponse update(Long id, HallUpdateRequest req) {
        Hall hall = hallRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 홀입니다."));
        hall.update(req.name().trim(), req.sortOrder(), req.active());
        return HallAdminResponse.from(hall);
    }
}
