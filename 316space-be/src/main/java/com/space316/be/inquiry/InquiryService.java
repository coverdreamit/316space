package com.space316.be.inquiry;

import com.space316.be.domain.inquiry.Inquiry;
import com.space316.be.domain.inquiry.InquiryAnswer;
import com.space316.be.domain.inquiry.InquiryAnswerRepository;
import com.space316.be.domain.inquiry.InquiryRepository;
import com.space316.be.domain.member.Member;
import com.space316.be.domain.member.MemberRepository;
import com.space316.be.inquiry.dto.AnswerRequest;
import com.space316.be.inquiry.dto.AnswerResponse;
import com.space316.be.inquiry.dto.CreateInquiryRequest;
import com.space316.be.inquiry.dto.InquiryDetailResponse;
import com.space316.be.inquiry.dto.InquiryListItemResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final InquiryAnswerRepository inquiryAnswerRepository;
    private final MemberRepository memberRepository;

    // 문의 목록 (비공개는 제목 마스킹)
    @Transactional(readOnly = true)
    public Page<InquiryListItemResponse> getList(Long memberId, boolean isAdmin, Pageable pageable) {
        return inquiryRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(inquiry -> {
                    boolean canAccess = canAccess(inquiry, memberId, isAdmin);
                    return InquiryListItemResponse.from(inquiry, canAccess);
                });
    }

    // 문의 상세 (비공개 접근 권한 체크)
    @Transactional(readOnly = true)
    public InquiryDetailResponse getDetail(Long id, Long memberId, boolean isAdmin) {
        Inquiry inquiry = findOrThrow(id);

        if (inquiry.isPrivate() && !canAccess(inquiry, memberId, isAdmin)) {
            throw new IllegalStateException("비공개 문의입니다.");
        }

        return InquiryDetailResponse.from(inquiry);
    }

    // 문의 작성 (회원: memberId 전달, 비회원: null)
    @Transactional
    public InquiryDetailResponse create(CreateInquiryRequest req, Long memberId) {
        Member member = memberId != null
                ? memberRepository.findById(memberId).orElse(null)
                : null;

        String authorName = (member != null) ? member.getName() : req.authorName();
        String authorPhone = (member != null) ? member.getPhone() : req.authorPhone();
        String authorEmail = req.authorEmail();

        Inquiry inquiry = Inquiry.builder()
                .member(member)
                .authorName(authorName)
                .authorPhone(authorPhone)
                .authorEmail(authorEmail)
                .category(req.category())
                .title(req.title())
                .content(req.content())
                .isPrivate(req.isPrivate())
                .build();

        return InquiryDetailResponse.from(inquiryRepository.save(inquiry));
    }

    // 문의 삭제 (본인만)
    @Transactional
    public void delete(Long id, Long memberId) {
        Inquiry inquiry = findOrThrow(id);

        if (inquiry.getMember() == null || !inquiry.getMember().getId().equals(memberId)) {
            throw new IllegalStateException("본인의 문의만 삭제할 수 있습니다.");
        }
        if (inquiry.getStatus().name().equals("ANSWERED")) {
            throw new IllegalStateException("답변 완료된 문의는 삭제할 수 없습니다.");
        }

        inquiryRepository.delete(inquiry);
    }

    // ── 관리자 전용 ───────────────────────────────────────────

    // 답변 작성
    @Transactional
    public AnswerResponse createAnswer(Long inquiryId, Long adminId, AnswerRequest req) {
        Inquiry inquiry = findOrThrow(inquiryId);

        if (inquiry.getAnswer() != null) {
            throw new IllegalStateException("이미 답변이 존재합니다. 수정을 이용해 주세요.");
        }

        Member admin = memberRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("관리자 계정을 찾을 수 없습니다."));

        InquiryAnswer answer = InquiryAnswer.builder()
                .inquiry(inquiry)
                .admin(admin)
                .content(req.content())
                .build();

        inquiryAnswerRepository.save(answer);
        inquiry.markAnswered();

        return AnswerResponse.from(answer);
    }

    // 답변 수정
    @Transactional
    public AnswerResponse updateAnswer(Long inquiryId, AnswerRequest req) {
        InquiryAnswer answer = inquiryAnswerRepository.findByInquiryId(inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("답변이 존재하지 않습니다."));

        answer.updateContent(req.content());
        return AnswerResponse.from(answer);
    }

    // ── private helpers ───────────────────────────────────────

    private Inquiry findOrThrow(Long id) {
        return inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 문의입니다."));
    }

    private boolean canAccess(Inquiry inquiry, Long memberId, boolean isAdmin) {
        if (!inquiry.isPrivate() || isAdmin) return true;
        if (inquiry.getMember() != null && inquiry.getMember().getId().equals(memberId)) return true;
        return false;
    }
}
