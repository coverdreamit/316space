package com.space316.be.admin;

import com.space316.be.admin.dto.AdminMemberResponse;
import com.space316.be.admin.dto.AdminMemberUpdateRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/members")
@RequiredArgsConstructor
public class AdminMemberController {

    private final AdminMemberService adminMemberService;

    @GetMapping
    public ResponseEntity<List<AdminMemberResponse>> list(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(adminMemberService.listMembers(q));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AdminMemberResponse> update(
            @PathVariable Long id, @Valid @RequestBody AdminMemberUpdateRequest req) {
        return ResponseEntity.ok(adminMemberService.updateMember(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id, @AuthenticationPrincipal Long actingAdminId) {
        adminMemberService.deleteMember(id, actingAdminId);
        return ResponseEntity.noContent().build();
    }
}
