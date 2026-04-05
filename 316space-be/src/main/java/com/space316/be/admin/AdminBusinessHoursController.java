package com.space316.be.admin;

import com.space316.be.admin.dto.BusinessHoursReplaceRequest;
import com.space316.be.admin.dto.BusinessHoursRowResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/halls/{hallId}/business-hours")
@RequiredArgsConstructor
public class AdminBusinessHoursController {

    private final AdminBusinessHoursService adminBusinessHoursService;

    @GetMapping
    public List<BusinessHoursRowResponse> list(@PathVariable String hallId) {
        return adminBusinessHoursService.list(hallId);
    }

    @PutMapping
    public List<BusinessHoursRowResponse> replace(
            @PathVariable String hallId, @Valid @RequestBody BusinessHoursReplaceRequest req) {
        return adminBusinessHoursService.replace(hallId, req);
    }
}
