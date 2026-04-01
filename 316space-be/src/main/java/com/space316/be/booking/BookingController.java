package com.space316.be.booking;

import com.space316.be.booking.dto.BookingResponse;
import com.space316.be.booking.dto.CancelRequest;
import com.space316.be.booking.dto.GuestBookingRequest;
import com.space316.be.booking.dto.MemberBookingRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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

    /** 전체 예약 목록 (페이징) */
    @GetMapping("/api/admin/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BookingResponse>> getAllBookings(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(bookingService.getAllBookings(pageable));
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
