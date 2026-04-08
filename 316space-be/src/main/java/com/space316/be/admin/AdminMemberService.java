package com.space316.be.admin;

import com.space316.be.admin.dto.AdminMemberResponse;
import com.space316.be.admin.dto.AdminMemberUpdateRequest;
import com.space316.be.domain.booking.BookingRepository;
import com.space316.be.domain.inquiry.InquiryAnswerRepository;
import com.space316.be.domain.inquiry.InquiryRepository;
import com.space316.be.domain.member.Member;
import com.space316.be.domain.member.MemberRepository;
import com.space316.be.domain.member.MemberRole;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminMemberService {

    private final MemberRepository memberRepository;
    private final BookingRepository bookingRepository;
    private final InquiryRepository inquiryRepository;
    private final InquiryAnswerRepository inquiryAnswerRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<AdminMemberResponse> listMembers(String q) {
        List<Member> members;
        if (q == null || q.isBlank()) {
            members = memberRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        } else {
            String term = q.trim();
            members =
                    memberRepository.findByLoginIdContainingIgnoreCaseOrNameContainingIgnoreCase(term, term);
        }
        return members.stream().map(AdminMemberResponse::from).toList();
    }

    @Transactional
    public AdminMemberResponse updateMember(Long id, AdminMemberUpdateRequest req) {
        Member member = memberRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 회원입니다."));
        String email = blankToNull(req.email());
        String phone = blankToNull(req.phone());
        member.updateProfile(req.name().trim(), email, phone);
        member.changeStatus(req.status());
        applyPasswordIfPresent(member, req.password());
        return AdminMemberResponse.from(member);
    }

    @Transactional
    public void deleteMember(Long id, Long actingAdminId) {
        if (id.equals(actingAdminId)) {
            throw new IllegalStateException("본인 계정은 삭제할 수 없습니다.");
        }
        Member member = memberRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 회원입니다."));
        if (member.getRole() == MemberRole.ADMIN) {
            if (memberRepository.countByRole(MemberRole.ADMIN) <= 1) {
                throw new IllegalStateException("마지막 관리자 계정은 삭제할 수 없습니다.");
            }
            if (inquiryAnswerRepository.countByAdmin_Id(id) > 0) {
                throw new IllegalStateException("문의 답변 이력이 있는 관리자는 삭제할 수 없습니다.");
            }
        }
        bookingRepository.detachMember(id);
        inquiryRepository.detachMember(id);
        memberRepository.delete(member);
    }

    private void applyPasswordIfPresent(Member member, String rawPassword) {
        if (rawPassword == null || rawPassword.isBlank()) {
            return;
        }
        String p = rawPassword.trim();
        if (p.isEmpty()) {
            return;
        }
        member.updatePasswordHash(passwordEncoder.encode(p));
    }

    private static String blankToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }
}
