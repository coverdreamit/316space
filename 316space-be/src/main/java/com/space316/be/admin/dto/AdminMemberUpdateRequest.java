package com.space316.be.admin.dto;

import com.space316.be.domain.member.MemberStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminMemberUpdateRequest(
        @NotBlank @Size(max = 50) String name,
        @Size(max = 100) String email,
        @Size(max = 20) String phone,
        @NotNull MemberStatus status,
        /** 비어 있거나 생략 시 변경 없음. 관리자 설정 시 일반 가입 비밀번호 규칙(길이 등)은 적용하지 않음. */
        String password) {}
