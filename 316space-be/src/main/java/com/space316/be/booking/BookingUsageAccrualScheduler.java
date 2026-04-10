package com.space316.be.booking;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingUsageAccrualScheduler {

    private final BookingUsageAccrualService bookingUsageAccrualService;

    /** 미적립 예약을 주기적으로 회원 누적 시간에 반영 (기본 5분). */
    @Scheduled(fixedDelayString = "${app.booking-usage-accrual.delay-ms:300000}")
    public void accrue() {
        try {
            bookingUsageAccrualService.applyPendingGlobally(LocalDateTime.now());
        } catch (Exception e) {
            log.warn("누적 이용 시간 적립 실패: {}", e.getMessage());
        }
    }
}
