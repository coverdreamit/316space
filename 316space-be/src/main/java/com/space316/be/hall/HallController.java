package com.space316.be.hall;

import com.space316.be.domain.hall.HallRepository;
import com.space316.be.hall.dto.HallResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class HallController {

    private final HallRepository hallRepository;

    @GetMapping("/api/halls")
    public List<HallResponse> listActiveHalls() {
        return hallRepository.findByActiveTrueOrderBySortOrderAsc().stream()
                .map(HallResponse::from)
                .toList();
    }
}
