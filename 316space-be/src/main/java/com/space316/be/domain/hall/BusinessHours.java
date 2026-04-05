package com.space316.be.domain.hall;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.time.DayOfWeek;
import java.time.LocalTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "business_hours")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BusinessHours {

    public BusinessHours(String hallId, DayOfWeek dayOfWeek, LocalTime openTime, LocalTime closeTime) {
        this.hallId = hallId;
        this.dayOfWeek = dayOfWeek;
        this.openTime = openTime;
        this.closeTime = closeTime;
    }

    @Id
    @SequenceGenerator(name = "business_hours_seq", sequenceName = "business_hours_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "business_hours_seq")
    private Long id;

    @Column(name = "hall_id", nullable = false, length = 30)
    private String hallId;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 10)
    private DayOfWeek dayOfWeek;

    @Column(name = "open_time", nullable = false)
    private LocalTime openTime;

    @Column(name = "close_time", nullable = false)
    private LocalTime closeTime;
}
