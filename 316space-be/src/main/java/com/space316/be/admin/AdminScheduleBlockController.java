package com.space316.be.admin;

import com.space316.be.admin.dto.ScheduleBlockResponse;
import com.space316.be.admin.dto.ScheduleBlockUpsertRequest;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/schedule-blocks")
@RequiredArgsConstructor
public class AdminScheduleBlockController {

    private final AdminScheduleBlockService adminScheduleBlockService;

    /** 구간과 겹치는 블록 목록 (캘린더용). hallId 생략 시 전체 홀. */
    @GetMapping
    public ResponseEntity<List<ScheduleBlockResponse>> list(
            @RequestParam LocalDateTime from,
            @RequestParam LocalDateTime to,
            @RequestParam(required = false) String hallId) {
        return ResponseEntity.ok(adminScheduleBlockService.list(from, to, hallId));
    }

    @PostMapping
    public ResponseEntity<ScheduleBlockResponse> create(@Valid @RequestBody ScheduleBlockUpsertRequest req) {
        ScheduleBlockResponse body = adminScheduleBlockService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScheduleBlockResponse> update(
            @PathVariable Long id, @Valid @RequestBody ScheduleBlockUpsertRequest req) {
        return ResponseEntity.ok(adminScheduleBlockService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        adminScheduleBlockService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
