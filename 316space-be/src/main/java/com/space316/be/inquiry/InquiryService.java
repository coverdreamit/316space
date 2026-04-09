package com.space316.be.inquiry;

import com.space316.be.domain.inquiry.Inquiry;
import com.space316.be.domain.inquiry.InquiryAnswer;
import com.space316.be.domain.inquiry.InquiryStatus;
import com.space316.be.domain.inquiry.InquiryAnswerRepository;
import com.space316.be.domain.inquiry.InquiryRepository;
import com.space316.be.domain.member.Member;
import com.space316.be.domain.member.MemberRepository;
import com.space316.be.inquiry.dto.AnswerRequest;
import com.space316.be.inquiry.dto.AnswerResponse;
import com.space316.be.inquiry.dto.CreateInquiryRequest;
import com.space316.be.inquiry.dto.InquiryDetailResponse;
import com.space316.be.inquiry.dto.InquiryListItemResponse;
import com.space316.be.inquiry.dto.UpdateInquiryRequest;
import com.space316.be.slack.SlackIncomingWebhookNotifier;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final InquiryAnswerRepository inquiryAnswerRepository;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final SlackIncomingWebhookNotifier slackIncomingWebhookNotifier;

    @Transactional(readOnly = true)
    public Page<InquiryListItemResponse> getList(
            Long memberId, boolean isAdmin, Pageable pageable, InquiryStatus statusFilter) {
        Page<Inquiry> page = statusFilter == null
                ? inquiryRepository.findAllByOrderByCreatedAtDesc(pageable)
                : inquiryRepository.findByStatusOrderByCreatedAtDesc(statusFilter, pageable);
        return page.map(inquiry -> {
            boolean canAccess = canAccessForList(inquiry, memberId, isAdmin);
            return InquiryListItemResponse.from(inquiry, canAccess, isAdmin);
        });
    }

    @Transactional(readOnly = true)
    public InquiryDetailResponse getDetail(Long id, Long memberId, boolean isAdmin, String guestPassword) {
        Inquiry inquiry = findOrThrow(id);
        if (!canViewDetail(inquiry, memberId, isAdmin, guestPassword)) {
            if (inquiry.isPrivate() && inquiry.getMember() == null) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "비밀번호를 입력해 주세요.");
            }
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "비공개 문의입니다.");
        }
        return toDetailResponse(inquiry, memberId, guestPassword);
    }

    @Transactional
    public InquiryDetailResponse create(CreateInquiryRequest req, Long memberId) {
        Member member = memberId != null
                ? memberRepository.findById(memberId).orElse(null)
                : null;

        String authorName = (member != null) ? member.getName() : req.authorName();
        String authorPhone = (member != null) ? member.getPhone() : req.authorPhone();
        String authorEmail = req.authorEmail();

        String guestHash = null;
        String plainForDetail = null;
        if (member != null) {
            if (req.guestPassword() != null && !req.guestPassword().isBlank()) {
                throw new IllegalArgumentException("회원 문의에는 비밀번호를 넣을 수 없습니다.");
            }
        } else {
            if (req.guestPassword() == null || req.guestPassword().isBlank()) {
                throw new IllegalArgumentException("비회원은 문의 비밀번호(4자 이상)를 입력해 주세요.");
            }
            if (req.guestPassword().length() < 4) {
                throw new IllegalArgumentException("비밀번호는 4자 이상이어야 합니다.");
            }
            guestHash = passwordEncoder.encode(req.guestPassword());
            plainForDetail = req.guestPassword();
        }

        Inquiry inquiry = Inquiry.builder()
                .member(member)
                .authorName(authorName)
                .authorPhone(authorPhone)
                .authorEmail(authorEmail)
                .category(req.category())
                .title(req.title())
                .content(req.content())
                .isPrivate(req.isPrivate())
                .guestPasswordHash(guestHash)
                .build();

        Inquiry saved = inquiryRepository.save(inquiry);
        slackIncomingWebhookNotifier.notifyNewInquiry(saved);
        return toDetailResponse(saved, memberId, plainForDetail);
    }

    @Transactional
    public InquiryDetailResponse update(Long id, Long memberId, String guestPassword, UpdateInquiryRequest req) {
        Inquiry inquiry = findOrThrow(id);
        assertCanModify(inquiry, memberId, guestPassword);
        inquiry.updateInquiry(req.category(), req.title().trim(), req.content().trim(), req.isPrivate());
        return toDetailResponse(inquiryRepository.save(inquiry), memberId, guestPassword);
    }

    @Transactional
    public void delete(Long id, Long memberId, String guestPassword, boolean isAdmin) {
        Inquiry inquiry = findOrThrow(id);
        if (!isAdmin) {
            assertCanModify(inquiry, memberId, guestPassword);
        }
        inquiryAnswerRepository.findByInquiryId(id).ifPresent(inquiryAnswerRepository::delete);
        inquiryRepository.delete(inquiry);
    }

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

    @Transactional
    public AnswerResponse updateAnswer(Long inquiryId, AnswerRequest req) {
        InquiryAnswer answer = inquiryAnswerRepository.findByInquiryId(inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("답변이 존재하지 않습니다."));

        answer.updateContent(req.content());
        return AnswerResponse.from(answer);
    }

    private Inquiry findOrThrow(Long id) {
        return inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 문의입니다."));
    }

    /** 목록: 비공개는 본인(회원)·관리자만 실제 제목 */
    private boolean canAccessForList(Inquiry inquiry, Long memberId, boolean isAdmin) {
        if (!inquiry.isPrivate() || isAdmin) {
            return true;
        }
        if (inquiry.getMember() != null && memberId != null && inquiry.getMember().getId().equals(memberId)) {
            return true;
        }
        return false;
    }

    private boolean canViewDetail(Inquiry inquiry, Long memberId, boolean isAdmin, String guestPassword) {
        if (isAdmin) {
            return true;
        }
        if (!inquiry.isPrivate()) {
            return true;
        }
        if (inquiry.getMember() != null) {
            return memberId != null && inquiry.getMember().getId().equals(memberId);
        }
        if (inquiry.getGuestPasswordHash() == null) {
            return false;
        }
        return guestPassword != null && !guestPassword.isBlank()
                && passwordEncoder.matches(guestPassword, inquiry.getGuestPasswordHash());
    }

    private InquiryDetailResponse toDetailResponse(Inquiry inquiry, Long memberId, String guestPasswordUsed) {
        boolean guestPost = inquiry.getMember() == null;
        boolean mine = inquiry.getMember() != null && memberId != null
                && inquiry.getMember().getId().equals(memberId);
        boolean guestPwdMatches = false;
        if (guestPost && inquiry.getGuestPasswordHash() != null
                && guestPasswordUsed != null && !guestPasswordUsed.isBlank()) {
            guestPwdMatches = passwordEncoder.matches(guestPasswordUsed, inquiry.getGuestPasswordHash());
        }
        boolean canModify = inquiry.getStatus() == InquiryStatus.WAITING;
        boolean canEdit = canModify && (mine || guestPwdMatches);
        return InquiryDetailResponse.of(inquiry, guestPost, mine, canEdit, canEdit);
    }

    private void assertCanModify(Inquiry inquiry, Long memberId, String guestPassword) {
        if (inquiry.getStatus() == InquiryStatus.ANSWERED) {
            throw new IllegalStateException("답변이 완료된 문의는 수정·삭제할 수 없습니다.");
        }
        if (inquiry.getMember() != null) {
            if (memberId == null || !inquiry.getMember().getId().equals(memberId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 문의만 수정·삭제할 수 있습니다.");
            }
            return;
        }
        if (inquiry.getGuestPasswordHash() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "이 문의는 비밀번호로 보호되지 않아 수정·삭제할 수 없습니다.");
        }
        if (guestPassword == null || guestPassword.isBlank()
                || !passwordEncoder.matches(guestPassword, inquiry.getGuestPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "비밀번호가 일치하지 않습니다.");
        }
    }
}
