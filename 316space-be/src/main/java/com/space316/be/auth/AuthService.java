package com.space316.be.auth;

import com.space316.be.audit.ActivityAuditAction;
import com.space316.be.audit.AuditLogService;
import com.space316.be.auth.dto.LoginRequest;
import com.space316.be.auth.dto.RegisterRequest;
import com.space316.be.auth.dto.TokenResponse;
import com.space316.be.domain.member.Member;
import com.space316.be.domain.member.MemberRepository;
import com.space316.be.domain.member.MemberStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final AuditLogService auditLogService;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    @Transactional
    public void register(RegisterRequest req) {
        String loginId = req.loginId().trim();
        if (memberRepository.existsByLoginId(loginId)) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        String email = req.email().orElse(null);
        String phone = req.phone().orElse(null);

        Member member = Member.builder()
                .loginId(loginId)
                .email(email)
                .passwordHash(passwordEncoder.encode(req.password()))
                .name(req.name().trim())
                .phone(phone)
                .build();

        memberRepository.save(member);
        auditLogService.record(
                ActivityAuditAction.REGISTER,
                member.getId(),
                member.getLoginId(),
                "MEMBER",
                String.valueOf(member.getId()),
                null,
                null);
    }

    @Transactional
    public TokenResponse login(LoginRequest req) {
        String loginId = req.loginId().trim();
        Member member = memberRepository.findByLoginId(loginId).orElse(null);
        if (member == null) {
            auditLogService.recordInNewTransaction(
                    ActivityAuditAction.LOGIN_FAILURE,
                    null,
                    loginId,
                    null,
                    null,
                    null,
                    "존재하지 않는 아이디");
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        if (member.getStatus() == MemberStatus.WITHDRAWN) {
            auditLogService.recordInNewTransaction(
                    ActivityAuditAction.LOGIN_BLOCKED_WITHDRAWN,
                    member.getId(),
                    member.getLoginId(),
                    "MEMBER",
                    String.valueOf(member.getId()),
                    null,
                    null);
            throw new IllegalStateException("탈퇴한 계정입니다.");
        }
        if (member.getStatus() == MemberStatus.SUSPENDED) {
            auditLogService.recordInNewTransaction(
                    ActivityAuditAction.LOGIN_BLOCKED_SUSPENDED,
                    member.getId(),
                    member.getLoginId(),
                    "MEMBER",
                    String.valueOf(member.getId()),
                    null,
                    null);
            throw new IllegalStateException("정지된 계정입니다. 관리자에게 문의해 주세요.");
        }
        if (!passwordEncoder.matches(req.password(), member.getPasswordHash())) {
            auditLogService.recordInNewTransaction(
                    ActivityAuditAction.LOGIN_FAILURE,
                    member.getId(),
                    member.getLoginId(),
                    "MEMBER",
                    String.valueOf(member.getId()),
                    null,
                    "비밀번호 불일치");
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        String token = jwtProvider.generate(member.getId(), member.getRole().name());
        auditLogService.record(
                ActivityAuditAction.LOGIN_SUCCESS,
                member.getId(),
                member.getLoginId(),
                "MEMBER",
                String.valueOf(member.getId()),
                null,
                null);
        return TokenResponse.of(token, expirationMs, member.getRole().name());
    }
}
