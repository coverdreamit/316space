package com.space316.be.booking;

import com.space316.be.domain.booking.Booking;
import com.space316.be.domain.booking.BookingRepository;
import com.space316.be.domain.booking.BookingStatus;
import com.space316.be.domain.member.Member;
import com.space316.be.domain.member.MemberRepository;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingUsageAccrualService {

    private final BookingRepository bookingRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public void applyPendingForMember(Long memberId, LocalDateTime now) {
        for (Long id : bookingRepository.findIdsPendingUsageForMember(memberId, now)) {
            applyOne(id, now);
        }
    }

    @Transactional
    public int applyPendingGlobally(LocalDateTime now) {
        int n = 0;
        for (Long id : bookingRepository.findIdsPendingUsage(now)) {
            if (applyOne(id, now)) {
                n++;
            }
        }
        return n;
    }

    /**
     * 조건부 UPDATE로 한 건만 적립(동시 실행 시 중복 적립 방지).
     *
     * @return 적립 처리한 경우 true
     */
    private boolean applyOne(Long bookingId, LocalDateTime now) {
        Booking b = bookingRepository.findById(bookingId).orElse(null);
        if (b == null
                || b.getStatus() != BookingStatus.CONFIRMED
                || b.getMember() == null
                || b.getEndAt().isAfter(now)) {
            return false;
        }
        long minutes = Math.max(0L, ChronoUnit.MINUTES.between(b.getStartAt(), b.getEndAt()));
        Long memberId = b.getMember().getId();
        int claimed = bookingRepository.markUsageApplied(bookingId);
        if (claimed != 1) {
            return false;
        }
        Member m = memberRepository
                .findById(memberId)
                .orElseThrow(() -> new IllegalStateException("예약에 연결된 회원을 찾을 수 없습니다."));
        m.addUsageMinutes(minutes);
        return true;
    }
}
