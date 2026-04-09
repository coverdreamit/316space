package com.space316.be.inquiry.dto;

import com.space316.be.domain.inquiry.Inquiry;
import com.space316.be.domain.inquiry.InquiryCategory;
import com.space316.be.domain.inquiry.InquiryStatus;
import java.time.LocalDateTime;

public record InquiryListItemResponse(
        Long id,
        InquiryCategory category,
        String title,
        String authorName,
        boolean isPrivate,
        boolean guestPost,
        InquiryStatus status,
        LocalDateTime createdAt
) {
    private static final String PRIVATE_TITLE = "비공개 문의입니다.";

    public static InquiryListItemResponse from(Inquiry inquiry, boolean canAccess, boolean isAdmin) {
        String author = isAdmin ? inquiry.getAuthorName() : maskName(inquiry.getAuthorName());
        return new InquiryListItemResponse(
                inquiry.getId(),
                inquiry.getCategory(),
                canAccess ? inquiry.getTitle() : PRIVATE_TITLE,
                author,
                inquiry.isPrivate(),
                inquiry.getMember() == null,
                inquiry.getStatus(),
                inquiry.getCreatedAt()
        );
    }

    /** 홍길동 → 홍** */
    private static String maskName(String name) {
        if (name == null || name.length() <= 1) return name;
        return name.charAt(0) + "*".repeat(name.length() - 1);
    }
}
