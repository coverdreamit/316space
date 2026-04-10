package com.space316.be.booking;

import com.space316.be.booking.dto.AdminBookingCreateRequest;
import com.space316.be.booking.dto.AvailabilityResponse;
import com.space316.be.booking.dto.BookingResponse;
import com.space316.be.booking.dto.CancelRequest;
import com.space316.be.booking.dto.GuestBookingRequest;
import com.space316.be.booking.dto.MemberBookingRequest;
import com.space316.be.booking.dto.MemberBookingUsageResponse;
import com.space316.be.domain.booking.BookingStatus;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final BookingAvailabilityService bookingAvailabilityService;

    /** 홀·기간별 예약·블록 점유 (캘린더용, 비인증) */
    @GetMapping("/api/bookings/availability")
    public ResponseEntity<AvailabilityResponse> availability(
            @RequestParam String hallId,
            @RequestParam LocalDateTime from,
            @RequestParam LocalDateTime to) {
        return ResponseEntity.ok(bookingAvailabilityService.getAvailability(hallId, from, to));
    }

    // ── 회원 예약 ─────────────────────────────────────────────

    /** 회원 예약 생성 */
    @PostMapping("/api/bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> bookAsMember(
            @AuthenticationPrincipal Long memberId,
            @Valid @RequestBody MemberBookingRequest req) {
        return ResponseEntity.ok(bookingService.bookAsMember(memberId, req));
    }

    /** 비회원 예약 생성 (SMS 인증 필요) */
    @PostMapping("/api/bookings/guest")
    public ResponseEntity<BookingResponse> bookAsGuest(
            @Valid @RequestBody GuestBookingRequest req) {
        return ResponseEntity.ok(bookingService.bookAsGuest(req));
    }

    /** 예약 단건 조회
     *  - 회원: JWT 토큰으로 인증
     *  - 비회원: ?phone=010-0000-0000 쿼리 파라미터로 확인 */
    @GetMapping("/api/bookings/{bookingNo}")
    public ResponseEntity<BookingResponse> getBooking(
            @PathVariable String bookingNo,
            @AuthenticationPrincipal Long memberId,
            @RequestParam(required = false) String phone) {
        return ResponseEntity.ok(bookingService.getBooking(bookingNo, memberId, phone));
    }

    /** 회원 본인 예약 목록 */
    @GetMapping("/api/members/me/bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(bookingService.getMyBookings(memberId));
    }

    /** 회원 누적 이용 시간(분): 확정·이용 종료 후 예약만 합산 */
    @GetMapping("/api/members/me/booking-usage")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MemberBookingUsageResponse> getMyBookingUsage(
            @AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(
                new MemberBookingUsageResponse(bookingService.getMyTotalUsageMinutes(memberId)));
    }

    /** 예약 취소
     *  - 회원: JWT 토큰, 비회원: ?phone 파라미터 */
    @DeleteMapping("/api/bookings/{bookingNo}")
    public ResponseEntity<BookingResponse> cancel(
            @PathVariable String bookingNo,
            @AuthenticationPrincipal Long memberId,
            @RequestParam(required = false) String phone,
            @RequestBody(required = false) CancelRequest req) {
        return ResponseEntity.ok(bookingService.cancel(bookingNo, memberId, phone, req));
    }

    // ── 관리자 전용 ───────────────────────────────────────────

    /** 예약 목록 (필터·페이징) */
    @GetMapping("/api/admin/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BookingResponse>> adminSearchBookings(
            @RequestParam(required = false) String hallId,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(bookingService.searchAdminBookings(hallId, status, from, to, pageable));
    }

    /** 관리자 대리 예약 등록 */
    @PostMapping("/api/admin/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> adminCreateBooking(@Valid @RequestBody AdminBookingCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.adminCreateBooking(req));
    }

    /** 예약 확정 */
    @PatchMapping("/api/admin/bookings/{bookingNo}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> adminConfirm(@PathVariable String bookingNo) {
        return ResponseEntity.ok(bookingService.adminConfirm(bookingNo));
    }

    /** 예약 취소 (관리자) */
    @PatchMapping("/api/admin/bookings/{bookingNo}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> adminCancel(
            @PathVariable String bookingNo,
            @RequestBody(required = false) CancelRequest req) {
        return ResponseEntity.ok(bookingService.adminCancel(bookingNo, req));
    }
}
