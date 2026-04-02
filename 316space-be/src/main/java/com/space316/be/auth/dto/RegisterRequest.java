package com.space316.be.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Optional;

public record RegisterRequest(
        @NotBlank
                @Size(min = 3, max = 30)
                @Pattern(
                        regexp = "^[a-zA-Z0-9._-]+$",
                        message = "아이디는 영문, 숫자, ., _, -만 사용할 수 있습니다.")
                String loginId,
        @NotBlank @Size(min = 8, max = 30) String password,
        @NotBlank @Size(max = 50) String name,
        Optional<@Size(max = 100) @Email(message = "올바른 이메일 형식이 아닙니다.") String> email,
        Optional<@Pattern(regexp = "^010-\\d{4}-\\d{4}$", message = "전화번호 형식: 010-0000-0000")
                        String> phone) {

    public RegisterRequest {
        email =
                (email == null ? Optional.<String>empty() : email)
                        .map(String::trim)
                        .filter(s -> !s.isEmpty());
        phone =
                (phone == null ? Optional.<String>empty() : phone)
                        .map(String::trim)
                        .filter(s -> !s.isEmpty());
    }
}
