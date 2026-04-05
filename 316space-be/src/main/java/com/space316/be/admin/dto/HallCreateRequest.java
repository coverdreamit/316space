package com.space316.be.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record HallCreateRequest(
        @NotBlank @Size(max = 30) String hallId,
        @NotBlank @Size(max = 100) String name,
        int sortOrder,
        boolean active) {}
