package com.space316.be.booking.dto;

import java.util.List;

public record AvailabilityResponse(String hallId, int slotMinutes, List<AvailabilityItemResponse> items) {}
