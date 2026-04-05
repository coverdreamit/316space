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
