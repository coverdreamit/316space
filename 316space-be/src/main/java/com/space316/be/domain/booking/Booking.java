package com.space316.be.domain.booking;

import com.space316.be.domain.common.BaseEntity;
import com.space316.be.domain.member.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "booking")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Booking extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String bookingNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(nullable = false, length = 50)
    private String guestName;

    @Column(nullable = false, length = 20)
    private String guestPhone;

    @Column(nullable = false, length = 30)
    private String hallId;

    @Column(nullable = false)
    private LocalDateTime startAt;

    @Column(nullable = false)
    private LocalDateTime endAt;

    @Column
    private Integer headcount;

    @Column(length = 100)
    private String purpose;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status;

    @Column
    private LocalDateTime cancelledAt;

    @Column(length = 255)
    private String cancelReason;

    @Builder
    private Booking(String bookingNo, Member member, String guestName, String guestPhone,
            String hallId, LocalDateTime startAt, LocalDateTime endAt,
            Integer headcount, String purpose, String note) {
        this.bookingNo = bookingNo;
        this.member = member;
        this.guestName = guestName;
        this.guestPhone = guestPhone;
        this.hallId = hallId;
        this.startAt = startAt;
        this.endAt = endAt;
        this.headcount = headcount;
        this.purpose = purpose;
        this.note = note;
        this.status = BookingStatus.PENDING;
    }

    public void confirm() {
        this.status = BookingStatus.CONFIRMED;
    }

    public void cancel(String reason) {
        this.status = BookingStatus.CANCELLED;
        this.cancelledAt = LocalDateTime.now();
        this.cancelReason = reason;
    }
}
