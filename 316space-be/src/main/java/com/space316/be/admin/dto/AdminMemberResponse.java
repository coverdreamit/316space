package com.space316.be.admin.dto;

import com.space316.be.domain.member.Member;
import com.space316.be.domain.member.MemberStatus;
import java.time.LocalDateTime;

public record AdminMemberResponse(
        Long id,
        String loginId,
        String name,
        String email,
        String phone,
        MemberStatus status,
        LocalDateTime createdAt) {

    public static AdminMemberResponse from(Member m) {
        return new AdminMemberResponse(
                m.getId(),
                m.getLoginId(),
                m.getName(),
                m.getEmail(),
                m.getPhone(),
                m.getStatus(),
                m.getCreatedAt());
    }
}
