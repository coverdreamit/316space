package com.space316.be.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank @Email
        String email,

        @NotBlank @Size(min = 8, max = 30)
        String password,

        @NotBlank @Size(max = 50)
        String name,

        @NotBlank @Pattern(regexp = "^010-\\d{4}-\\d{4}$", message = "전화번호 형식: 010-0000-0000")
        String phone
) {}
