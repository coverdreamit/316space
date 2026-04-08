package com.space316.be.inquiry.dto;

import com.space316.be.domain.inquiry.InquiryCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateInquiryRequest(
        @NotNull InquiryCategory category,
        @NotBlank @Size(max = 200) String title,
        @NotBlank String content,
        boolean isPrivate) {}
