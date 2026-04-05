package com.space316.be.domain.hall;

import com.space316.be.domain.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hall_closure")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class HallClosure extends BaseEntity {

    @Id
    @SequenceGenerator(name = "hall_closure_seq", sequenceName = "hall_closure_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hall_closure_seq")
    private Long id;

    @Column(name = "hall_id", length = 30)
    private String hallId;

    @Column(name = "closure_date", nullable = false)
    private LocalDate closureDate;

    @Column(name = "all_day", nullable = false)
    private boolean allDay;

    @Column(name = "start_at")
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Column(length = 500)
    private String reason;
}
