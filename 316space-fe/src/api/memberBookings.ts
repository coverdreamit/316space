import { apiFetchJson } from './client'
import type { BookingDto } from './bookingCalendar'

export interface MemberBookingBody {
  hallId: string
  startAt: string
  endAt: string
  headcount?: number | null
  purpose?: string | null
  note?: string | null
}

export async function createMemberBooking(body: MemberBookingBody): Promise<BookingDto> {
  return apiFetchJson<BookingDto>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function fetchMyBookings(): Promise<BookingDto[]> {
  return apiFetchJson<BookingDto[]>('/api/members/me/bookings')
}

export async function fetchMyBookingUsage(): Promise<{ totalUsageMinutes: number }> {
  return apiFetchJson<{ totalUsageMinutes: number }>('/api/members/me/booking-usage')
}

export async function cancelMemberBooking(
  bookingNo: string,
  reason?: string | null,
): Promise<BookingDto> {
  const body =
    reason != null && reason.trim() !== '' ? JSON.stringify({ reason: reason.trim() }) : undefined
  return apiFetchJson<BookingDto>(`/api/bookings/${encodeURIComponent(bookingNo)}`, {
    method: 'DELETE',
    body,
  })
}
