package com.space316.be.admin.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record BusinessHoursReplaceRequest(@NotEmpty @Valid List<BusinessHoursRowRequest> rows) {}
