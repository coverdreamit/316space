import type { BookingDto, BookingStatus } from './bookingCalendar'
import { apiFetchJson } from './client'

export interface PageDto<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export async function fetchAdminBookings(params: {
  page?: number
  size?: number
  hallId?: string
  status?: BookingStatus
  from?: string
  to?: string
}): Promise<PageDto<BookingDto>> {
  const q = new URLSearchParams()
  if (params.page != null) q.set('page', String(params.page))
  if (params.size != null) q.set('size', String(params.size))
  if (params.hallId) q.set('hallId', params.hallId)
  if (params.status) q.set('status', params.status)
  if (params.from) q.set('from', params.from)
  if (params.to) q.set('to', params.to)
  const qs = q.toString()
  return apiFetchJson<PageDto<BookingDto>>(`/api/admin/bookings${qs ? `?${qs}` : ''}`)
}

export interface AdminBookingCreateBody {
  guestName: string
  guestPhone: string
  hallId: string
  startAt: string
  endAt: string
  headcount?: number | null
  purpose?: string | null
  note?: string | null
}

export async function createAdminBooking(body: AdminBookingCreateBody): Promise<BookingDto> {
  return apiFetchJson<BookingDto>('/api/admin/bookings', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function adminConfirmBooking(bookingNo: string): Promise<BookingDto> {
  return apiFetchJson<BookingDto>(`/api/admin/bookings/${encodeURIComponent(bookingNo)}/confirm`, {
    method: 'PATCH',
  })
}

export async function adminCancelBooking(bookingNo: string, reason?: string | null): Promise<BookingDto> {
  return apiFetchJson<BookingDto>(`/api/admin/bookings/${encodeURIComponent(bookingNo)}/cancel`, {
    method: 'PATCH',
    body: reason != null && reason !== '' ? JSON.stringify({ reason }) : undefined,
  })
}
