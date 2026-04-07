package com.space316.be.config;

import com.space316.be.domain.hall.Hall;
import com.space316.be.domain.hall.HallRepository;
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
    private final HallRepository hallRepository;
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
        } else {
            String email = adminEmail != null && !adminEmail.isBlank() ? adminEmail.trim() : null;
            if (email != null && memberRepository.existsByEmail(email)) {
                log.info("어드민 시드 생략: 이메일이 이미 사용 중");
            } else {
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

        seedHallsIfEmpty();
    }

    private void seedHallsIfEmpty() {
        if (hallRepository.count() > 0) {
            return;
        }
        hallRepository.save(Hall.builder().hallId("s-1").name("S-1 HALL").sortOrder(0).active(true).build());
        hallRepository.save(Hall.builder().hallId("s-2").name("S-2 HALL").sortOrder(1).active(true).build());
        hallRepository.save(Hall.builder().hallId("s-3").name("S-3 HALL").sortOrder(2).active(true).build());
        hallRepository.save(Hall.builder().hallId("s-4").name("S-4 HALL").sortOrder(3).active(true).build());
        hallRepository.save(Hall.builder().hallId("s-5").name("S-5 HALL").sortOrder(4).active(true).build());
        log.info("기본 홀(S-1 ~ S-5) 시드 완료");
    }
}
