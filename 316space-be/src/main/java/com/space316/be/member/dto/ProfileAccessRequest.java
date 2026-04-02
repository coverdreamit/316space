package com.space316.be.member.dto;

import jakarta.validation.constraints.NotBlank;

public record ProfileAccessRequest(@NotBlank String password) {}
