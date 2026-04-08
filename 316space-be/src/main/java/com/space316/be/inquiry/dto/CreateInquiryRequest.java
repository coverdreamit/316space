package com.space316.be.inquiry.dto;

import com.space316.be.domain.inquiry.InquiryCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateInquiryRequest(

        @NotBlank @Size(max = 50)
        String authorName,

        @Pattern(regexp = "^010-\\d{4}-\\d{4}$", message = "전화번호 형식: 010-0000-0000")
        String authorPhone,

        @Pattern(regexp = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", message = "올바른 이메일 형식이 아닙니다.")
        String authorEmail,

        @NotNull
        InquiryCategory category,

        @NotBlank @Size(max = 200)
        String title,

        @NotBlank
        String content,

        boolean isPrivate,

        /** 비회원 필수(4~72자). 회원 작성 시 null 또는 생략 */
        @Size(min = 4, max = 72)
        String guestPassword
) {}
