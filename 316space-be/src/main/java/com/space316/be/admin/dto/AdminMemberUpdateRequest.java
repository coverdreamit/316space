package com.space316.be.admin.dto;

import com.space316.be.domain.member.MemberStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminMemberUpdateRequest(
        @NotBlank @Size(max = 50) String name,
        @Size(max = 100) String email,
        @Size(max = 20) String phone,
        @NotNull MemberStatus status) {}
