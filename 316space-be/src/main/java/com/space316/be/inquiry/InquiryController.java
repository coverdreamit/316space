package com.space316.be.inquiry;

import com.space316.be.inquiry.dto.AnswerRequest;
import com.space316.be.inquiry.dto.AnswerResponse;
import com.space316.be.inquiry.dto.CreateInquiryRequest;
import com.space316.be.inquiry.dto.InquiryDetailResponse;
import com.space316.be.inquiry.dto.InquiryListItemResponse;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    /** 문의 목록 (비공개는 제목 마스킹, 인증 여부 무관) */
    @GetMapping
    public ResponseEntity<Page<InquiryListItemResponse>> getList(
            @AuthenticationPrincipal Long memberId,
            @PageableDefault(size = 20) Pageable pageable) {
        boolean isAdmin = hasAdminRole();
        return ResponseEntity.ok(inquiryService.getList(memberId, isAdmin, pageable));
    }

    /** 문의 상세 (비공개: 본인 또는 관리자만) */
    @GetMapping("/{id}")
    public ResponseEntity<InquiryDetailResponse> getDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId) {
        boolean isAdmin = hasAdminRole();
        return ResponseEntity.ok(inquiryService.getDetail(id, memberId, isAdmin));
    }

    /** 문의 작성 (회원/비회원 모두 가능) */
    @PostMapping
    public ResponseEntity<InquiryDetailResponse> create(
            @AuthenticationPrincipal Long memberId,
            @Valid @RequestBody CreateInquiryRequest req) {
        return ResponseEntity.ok(inquiryService.create(req, memberId));
    }

    /** 문의 삭제 (본인 회원만, 답변 전) */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId) {
        inquiryService.delete(id, memberId);
        return ResponseEntity.noContent().build();
    }

    // ── 관리자 전용 ───────────────────────────────────────────

    /** 답변 작성 */
    @PostMapping("/{id}/answer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnswerResponse> createAnswer(
            @PathVariable Long id,
            @AuthenticationPrincipal Long adminId,
            @Valid @RequestBody AnswerRequest req) {
        return ResponseEntity.ok(inquiryService.createAnswer(id, adminId, req));
    }

    /** 답변 수정 */
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
