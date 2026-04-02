package com.space316.be.config;

import com.space316.be.domain.member.Member;
import com.space316.be.domain.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.login-id}")
    private String adminLoginId;

    @Value("${admin.email:}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Value("${admin.name}")
    private String adminName;

    @Value("${admin.phone:}")
    private String adminPhone;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (memberRepository.existsByLoginId(adminLoginId)) {
            log.info("어드민 계정이 이미 존재합니다: {}", adminLoginId);
            return;
        }

        String email = adminEmail != null && !adminEmail.isBlank() ? adminEmail.trim() : null;
        String phone = adminPhone != null && !adminPhone.isBlank() ? adminPhone.trim() : null;

        Member admin = Member.builder()
                .loginId(adminLoginId.trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .name(adminName)
                .phone(phone)
                .build();
        admin.promoteToAdmin();
        memberRepository.save(admin);

        log.info("어드민 계정 생성 완료: {}", adminLoginId);
    }
}
