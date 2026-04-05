package com.space316.be.sms;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/sms")
@RequiredArgsConstructor
public class SmsController {

    private final SmsService smsService;

    @PostMapping("/send")
    public ResponseEntity<Void> send(@Valid @RequestBody SendRequest req) {
        smsService.sendCode(req.phone());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify")
    public ResponseEntity<Void> verify(@Valid @RequestBody VerifyRequest req) {
        smsService.verify(req.phone(), req.code());
        return ResponseEntity.ok().build();
    }

    record SendRequest(
            @NotBlank @Pattern(regexp = "^010-\\d{4}-\\d{4}$", message = "전화번호 형식: 010-0000-0000")
            String phone
    ) {}

    record VerifyRequest(
            @NotBlank @Pattern(regexp = "^010-\\d{4}-\\d{4}$")
            String phone,

            @NotBlank @Pattern(regexp = "^\\d{6}$", message = "6자리 숫자를 입력해 주세요.")
            String code
    ) {}
}
