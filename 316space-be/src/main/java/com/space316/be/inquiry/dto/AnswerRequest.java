package com.space316.be.inquiry.dto;

import jakarta.validation.constraints.NotBlank;

public record AnswerRequest(@NotBlank String content) {}
