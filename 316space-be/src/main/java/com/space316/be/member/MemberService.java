package com.space316.be.member;

import com.space316.be.auth.JwtProvider;
import com.space316.be.domain.member.Member;
import com.space316.be.domain.member.MemberRepository;
import com.space316.be.member.dto.MemberProfileResponse;
import com.space316.be.member.dto.ProfileAccessResponse;
import com.space316.be.member.dto.UpdateMemberProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Transactional(readOnly = true)
    public MemberProfileResponse getProfile(Long memberId) {
        Member member = memberRepository
                .findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        return new MemberProfileResponse(
                member.getLoginId(), member.getName(), member.getEmail(), member.getPhone());
    }

    @Transactional(readOnly = true)
    public ProfileAccessResponse issueProfileAccess(Long memberId, String password) {
        Member member = memberRepository
                .findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        if (!passwordEncoder.matches(password, member.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "비밀번호가 올바르지 않습니다.");
        }
        String token = jwtProvider.generateProfileEditToken(memberId);
        return ProfileAccessResponse.of(token, jwtProvider.getProfileEditExpirationMs());
    }

    @Transactional
    public MemberProfileResponse updateProfile(Long memberId, UpdateMemberProfileRequest req) {
        jwtProvider.assertProfileEditToken(req.profileAccessToken(), memberId);
        Member member = memberRepository
                .findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        if (req.newPassword() != null) {
            if (req.newPassword().length() < 8 || req.newPassword().length() > 30) {
                throw new IllegalArgumentException("새 비밀번호는 8~30자여야 합니다.");
            }
            member.updatePasswordHash(passwordEncoder.encode(req.newPassword()));
        }
        member.updateProfile(req.name().trim(), req.email(), req.phone());
        return new MemberProfileResponse(
                member.getLoginId(), member.getName(), member.getEmail(), member.getPhone());
    }
}
