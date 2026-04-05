package com.space316.be.inquiry.dto;

import com.space316.be.domain.inquiry.InquiryAnswer;
import java.time.LocalDateTime;

public record AnswerResponse(
        Long id,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static AnswerResponse from(InquiryAnswer a) {
        return new AnswerResponse(a.getId(), a.getContent(), a.getCreatedAt(), a.getUpdatedAt());
    }
}
