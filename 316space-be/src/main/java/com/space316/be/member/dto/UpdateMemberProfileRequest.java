package com.space316.be.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateMemberProfileRequest(
        @NotBlank @Size(max = 50) String name,
        @Size(max = 100) @Email(message = "올바른 이메일 형식이 아닙니다.") String email,
        @Pattern(regexp = "^$|^010-\\d{4}-\\d{4}$", message = "전화번호 형식: 010-0000-0000") String phone,
        String newPassword,
        @NotBlank String profileAccessToken) {

    public UpdateMemberProfileRequest {
        email = email != null && !email.isBlank() ? email.trim() : null;
        phone = phone != null && !phone.isBlank() ? phone.trim() : null;
        newPassword = newPassword != null && !newPassword.isBlank() ? newPassword : null;
        profileAccessToken = profileAccessToken != null ? profileAccessToken.trim() : null;
    }
}
