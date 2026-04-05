package com.space316.be.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank
                @Size(min = 3, max = 30)
                @Pattern(
                        regexp = "^[a-zA-Z0-9._-]+$",
                        message = "아이디는 영문, 숫자, ., _, -만 사용할 수 있습니다.")
                String loginId,
        @NotBlank String password) {}
