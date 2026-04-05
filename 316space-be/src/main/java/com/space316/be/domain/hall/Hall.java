package com.space316.be.domain.hall;

import com.space316.be.domain.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hall")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Hall extends BaseEntity {

    @Id
    @SequenceGenerator(name = "hall_seq", sequenceName = "hall_id_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hall_seq")
    private Long id;

    @Column(name = "hall_id", nullable = false, unique = true, length = 30)
    private String hallId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(nullable = false)
    private boolean active;

    @Builder
    private Hall(String hallId, String name, int sortOrder, boolean active) {
        this.hallId = hallId;
        this.name = name;
        this.sortOrder = sortOrder;
        this.active = active;
    }

    public void update(String name, int sortOrder, boolean active) {
        this.name = name;
        this.sortOrder = sortOrder;
        this.active = active;
    }
}
