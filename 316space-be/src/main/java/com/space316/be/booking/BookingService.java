package com.space316.be.booking;

import com.space316.be.booking.dto.AdminBookingCreateRequest;
import com.space316.be.booking.dto.BookingResponse;
import com.space316.be.booking.dto.CancelRequest;
import com.space316.be.booking.dto.GuestBookingRequest;
import com.space316.be.booking.dto.MemberBookingRequest;
import com.space316.be.domain.booking.Booking;
import com.space316.be.domain.booking.BookingRepository;
import com.space316.be.domain.booking.BookingSpecifications;
import com.space316.be.domain.booking.BookingStatus;
import com.space316.be.domain.hall.ScheduleBlockRepository;
import com.space316.be.domain.member.Member;
import com.space316.be.domain.member.MemberRepository;
import com.space316.be.domain.sms.SmsVerificationRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ScheduleBlockRepository scheduleBlockRepository;
    private final MemberRepository memberRepository;
    private final SmsVerificationRepository smsVerificationRepository;

    // 회원 예약
    @Transactional
    public BookingResponse bookAsMember(Long memberId, MemberBookingRequest req) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        String memberPhone = member.getPhone();
        if (memberPhone == null || memberPhone.isBlank()) {
            throw new IllegalStateException(
                    "예약하려면 마이페이지에서 휴대폰 번호를 먼저 등록해 주세요. 등록 후 다시 시도하면 됩니다.");
        }

        validateTime(req.startAt(), req.endAt());
        validateNoOverlap(req.hallId(), req.startAt(), req.endAt());

        Booking booking = Booking.builder()
                .bookingNo(generateBookingNo())
                .member(member)
                .guestName(member.getName())
                .guestPhone(memberPhone)
                .hallId(req.hallId())
                .startAt(req.startAt())
                .endAt(req.endAt())
                .headcount(req.headcount())
                .purpose(req.purpose())
                .note(req.note())
                .build();

        return BookingResponse.from(bookingRepository.save(booking));
    }

    // 비회원 예약 (SMS 인증 완료된 전화번호만 허용)
    @Transactional
    public BookingResponse bookAsGuest(GuestBookingRequest req) {
        boolean verified = smsVerificationRepository
                .existsByPhoneAndVerifiedTrueAndExpiresAtAfter(req.guestPhone(), LocalDateTime.now());
        if (!verified) {
            throw new IllegalStateException("SMS 인증이 필요합니다.");
        }

        validateTime(req.startAt(), req.endAt());
        validateNoOverlap(req.hallId(), req.startAt(), req.endAt());

        Booking booking = Booking.builder()
                .bookingNo(generateBookingNo())
                .member(null)
                .guestName(req.guestName())
                .guestPhone(req.guestPhone())
                .hallId(req.hallId())
                .startAt(req.startAt())
                .endAt(req.endAt())
                .headcount(req.headcount())
                .purpose(req.purpose())
                .note(req.note())
                .build();

        return BookingResponse.from(bookingRepository.save(booking));
    }

    // 예약 조회 (회원: memberId 일치 확인, 비회원: 전화번호 확인)
    @Transactional(readOnly = true)
    public BookingResponse getBooking(String bookingNo, Long memberId, String guestPhone) {
        Booking booking = findBookingOrThrow(bookingNo);

        if (memberId != null) {
            if (booking.getMember() == null || !booking.getMember().getId().equals(memberId)) {
                throw new IllegalStateException("본인의 예약이 아닙니다.");
            }
        } else {
            if (!booking.getGuestPhone().equals(guestPhone)) {
                throw new IllegalStateException("전화번호가 일치하지 않습니다.");
            }
        }

        return BookingResponse.from(booking);
    }

    // 회원 본인 예약 목록
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Long memberId) {
        return bookingRepository.findByMemberIdOrderByCreatedAtDesc(memberId)
                .stream()
                .map(BookingResponse::from)
                .toList();
    }

    // 예약 취소
    @Transactional
    public BookingResponse cancel(String bookingNo, Long memberId, String guestPhone, CancelRequest req) {
        Booking booking = findBookingOrThrow(bookingNo);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("이미 취소된 예약입니다.");
        }

        if (memberId != null) {
            if (booking.getMember() == null || !booking.getMember().getId().equals(memberId)) {
                throw new IllegalStateException("본인의 예약이 아닙니다.");
            }
        } else {
            if (!booking.getGuestPhone().equals(guestPhone)) {
                throw new IllegalStateException("전화번호가 일치하지 않습니다.");
            }
        }

        booking.cancel(req != null ? req.reason() : null);
        return BookingResponse.from(booking);
    }

    // ── 관리자 전용 ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<BookingResponse> searchAdminBookings(
            String hallId, BookingStatus status, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        Specification<Booking> spec =
                BookingSpecifications.forAdminSearch(blankToNull(hallId), status, from, to);
        return bookingRepository.findAll(spec, pageable).map(BookingResponse::from);
    }

    @Transactional
    public BookingResponse adminCreateBooking(AdminBookingCreateRequest req) {
        validateTime(req.startAt(), req.endAt());
        validateNoOverlap(req.hallId().trim(), req.startAt(), req.endAt());

        Booking booking = Booking.builder()
                .bookingNo(generateBookingNo())
                .member(null)
                .guestName(req.guestName().trim())
                .guestPhone(req.guestPhone().trim())
                .hallId(req.hallId().trim())
                .startAt(req.startAt())
                .endAt(req.endAt())
                .headcount(req.headcount())
                .purpose(req.purpose())
                .note(req.note())
                .build();

        return BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse adminConfirm(String bookingNo) {
        Booking booking = findBookingOrThrow(bookingNo);
        booking.confirm();
        return BookingResponse.from(booking);
    }

    @Transactional
    public BookingResponse adminCancel(String bookingNo, CancelRequest req) {
        Booking booking = findBookingOrThrow(bookingNo);
        booking.cancel(req != null ? req.reason() : null);
        return BookingResponse.from(booking);
    }

    // ── private helpers ──────────────────────────────────────

    private Booking findBookingOrThrow(String bookingNo) {
        return bookingRepository.findByBookingNo(bookingNo)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예약번호입니다."));
    }

    private void validateTime(LocalDateTime startAt, LocalDateTime endAt) {
        if (!endAt.isAfter(startAt)) {
            throw new IllegalArgumentException("종료 시각은 시작 시각보다 늦어야 합니다.");
        }
    }

    private void validateNoOverlap(String hallId, LocalDateTime startAt, LocalDateTime endAt) {
        if (bookingRepository.existsOverlap(hallId, startAt, endAt)) {
            throw new IllegalStateException("해당 시간대에 이미 예약이 존재합니다.");
        }
        if (scheduleBlockRepository.existsOverlap(hallId, startAt, endAt)) {
            throw new IllegalStateException("해당 시간대는 정검·청소 등으로 예약할 수 없습니다.");
        }
    }

    private String generateBookingNo() {
        String date = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String suffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "BK-" + date + "-" + suffix;
    }

    private static String blankToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }
}
