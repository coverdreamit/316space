package com.space316.be.hall.dto;

import com.space316.be.domain.hall.Hall;

public record HallResponse(Long id, String hallId, String name) {

    public static HallResponse from(Hall h) {
        return new HallResponse(h.getId(), h.getHallId(), h.getName());
    }
}
