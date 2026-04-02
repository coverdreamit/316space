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

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Value("${admin.name}")
    private String adminName;

    @Value("${admin.phone}")
    private String adminPhone;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (memberRepository.existsByEmail(adminEmail)) {
            log.info("어드민 계정이 이미 존재합니다: {}", adminEmail);
            return;
        }

        Member admin = Member.builder()
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .name(adminName)
                .phone(adminPhone)
                .build();
        admin.promoteToAdmin();
        memberRepository.save(admin);

        log.info("어드민 계정 생성 완료: {}", adminEmail);
    }
}
