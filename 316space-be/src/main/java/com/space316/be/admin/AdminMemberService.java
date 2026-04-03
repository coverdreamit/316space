package com.space316.be.admin;

import com.space316.be.admin.dto.AdminMemberResponse;
import com.space316.be.admin.dto.AdminMemberUpdateRequest;
import com.space316.be.domain.member.Member;
import com.space316.be.domain.member.MemberRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminMemberService {

    private final MemberRepository memberRepository;

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
        return AdminMemberResponse.from(member);
    }

    private static String blankToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }
}
