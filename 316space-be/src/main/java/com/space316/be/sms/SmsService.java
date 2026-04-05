package com.space316.be.sms;

import com.space316.be.domain.sms.SmsVerification;
import com.space316.be.domain.sms.SmsVerificationRepository;
import java.time.LocalDateTime;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmsService {

    private static final int CODE_LENGTH = 6;
    private static final int EXPIRE_MINUTES = 5;

    private final SmsVerificationRepository smsVerificationRepository;

    @Transactional
    public void sendCode(String phone) {
        String code = generateCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(EXPIRE_MINUTES);

        SmsVerification verification = SmsVerification.builder()
                .phone(phone)
                .code(code)
                .expiresAt(expiresAt)
                .build();

        smsVerificationRepository.save(verification);

        // TODO: 실제 SMS 발송 연동 (알리고, 네이버 클라우드, CoolSMS 등)
        log.info("[SMS 발송] phone={} code={} expiresAt={}", phone, code, expiresAt);
    }

    @Transactional
    public void verify(String phone, String code) {
        SmsVerification verification = smsVerificationRepository
                .findTopByPhoneOrderByCreatedAtDesc(phone)
                .orElseThrow(() -> new IllegalArgumentException("인증 요청 내역이 없습니다."));

        if (verification.isExpired()) {
            throw new IllegalStateException("인증번호가 만료되었습니다. 다시 요청해 주세요.");
        }
        if (verification.isVerified()) {
            throw new IllegalStateException("이미 사용된 인증번호입니다.");
        }
        if (!verification.getCode().equals(code)) {
            throw new IllegalArgumentException("인증번호가 올바르지 않습니다.");
        }

        verification.verify();
    }

    private String generateCode() {
        return String.format("%0" + CODE_LENGTH + "d", new Random().nextInt((int) Math.pow(10, CODE_LENGTH)));
    }
}
