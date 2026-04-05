package com.space316.be.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record HallUpdateRequest(
        @NotBlank @Size(max = 100) String name,
        int sortOrder,
        boolean active) {}
