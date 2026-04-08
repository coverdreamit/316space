package com.space316.be.inquiry;

import com.space316.be.inquiry.dto.AnswerRequest;
import com.space316.be.inquiry.dto.AnswerResponse;
import com.space316.be.inquiry.dto.CreateInquiryRequest;
import com.space316.be.inquiry.dto.InquiryDetailResponse;
import com.space316.be.inquiry.dto.InquiryListItemResponse;
import com.space316.be.inquiry.dto.UpdateInquiryRequest;
import com.space316.be.domain.inquiry.InquiryStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    public static final String GUEST_PASSWORD_HEADER = "X-Inquiry-Guest-Password";

    private final InquiryService inquiryService;

    @GetMapping
    public ResponseEntity<Page<InquiryListItemResponse>> getList(
            @AuthenticationPrincipal Long memberId,
            @RequestParam(required = false) InquiryStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        boolean isAdmin = hasAdminRole();
        return ResponseEntity.ok(inquiryService.getList(memberId, isAdmin, pageable, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InquiryDetailResponse> getDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId,
            @RequestHeader(value = GUEST_PASSWORD_HEADER, required = false) String guestPassword) {
        boolean isAdmin = hasAdminRole();
        return ResponseEntity.ok(inquiryService.getDetail(id, memberId, isAdmin, guestPassword));
    }

    @PostMapping
    public ResponseEntity<InquiryDetailResponse> create(
            @AuthenticationPrincipal Long memberId,
            @Valid @RequestBody CreateInquiryRequest req) {
        return ResponseEntity.ok(inquiryService.create(req, memberId));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<InquiryDetailResponse> update(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId,
            @RequestHeader(value = GUEST_PASSWORD_HEADER, required = false) String guestPassword,
            @Valid @RequestBody UpdateInquiryRequest req) {
        return ResponseEntity.ok(inquiryService.update(id, memberId, guestPassword, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId,
            @RequestHeader(value = GUEST_PASSWORD_HEADER, required = false) String guestPassword) {
        boolean isAdmin = hasAdminRole();
        inquiryService.delete(id, memberId, guestPassword, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/answer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnswerResponse> createAnswer(
            @PathVariable Long id,
            @AuthenticationPrincipal Long adminId,
            @Valid @RequestBody AnswerRequest req) {
        return ResponseEntity.ok(inquiryService.createAnswer(id, adminId, req));
    }

    @PatchMapping("/{id}/answer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnswerResponse> updateAnswer(
            @PathVariable Long id,
            @Valid @RequestBody AnswerRequest req) {
        return ResponseEntity.ok(inquiryService.updateAnswer(id, req));
    }

    private boolean hasAdminRole() {
        return SecurityContextHolder.getContext().getAuthentication() != null
                && SecurityContextHolder.getContext().getAuthentication()
                        .getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
