package com.space316.be.inquiry.dto;

import com.space316.be.domain.inquiry.Inquiry;
import com.space316.be.domain.inquiry.InquiryCategory;
import com.space316.be.domain.inquiry.InquiryStatus;
import java.time.LocalDateTime;

public record InquiryDetailResponse(
        Long id,
        InquiryCategory category,
        String title,
        String content,
        String authorName,
        boolean isPrivate,
        InquiryStatus status,
        AnswerResponse answer,
        LocalDateTime createdAt,
        boolean guestPost,
        boolean mine,
        boolean canEdit,
        boolean canDelete) {

    public static InquiryDetailResponse of(
            Inquiry inquiry,
            boolean guestPost,
            boolean mine,
            boolean canEdit,
            boolean canDelete) {
        AnswerResponse answerResponse = inquiry.getAnswer() != null
                ? AnswerResponse.from(inquiry.getAnswer())
                : null;

        return new InquiryDetailResponse(
                inquiry.getId(),
                inquiry.getCategory(),
                inquiry.getTitle(),
                inquiry.getContent(),
                inquiry.getAuthorName(),
                inquiry.isPrivate(),
                inquiry.getStatus(),
                answerResponse,
                inquiry.getCreatedAt(),
                guestPost,
                mine,
                canEdit,
                canDelete);
    }
}
