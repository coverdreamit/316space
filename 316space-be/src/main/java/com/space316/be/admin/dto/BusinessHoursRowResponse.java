package com.space316.be.admin.dto;

import com.space316.be.domain.hall.BusinessHours;
import java.time.DayOfWeek;
import java.time.LocalTime;

public record BusinessHoursRowResponse(
        Long id, String hallId, DayOfWeek dayOfWeek, LocalTime openTime, LocalTime closeTime) {

    public static BusinessHoursRowResponse from(BusinessHours b) {
        return new BusinessHoursRowResponse(
                b.getId(), b.getHallId(), b.getDayOfWeek(), b.getOpenTime(), b.getCloseTime());
    }
}
