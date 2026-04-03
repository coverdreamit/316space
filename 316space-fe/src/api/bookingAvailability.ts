import { apiFetchJson } from './client'
import type { AvailabilityResponse } from './bookingCalendar'

export async function fetchBookingAvailability(params: {
  hallId: string
  from: string
  to: string
}): Promise<AvailabilityResponse> {
  const q = new URLSearchParams({
    hallId: params.hallId,
    from: params.from,
    to: params.to,
  })
  return apiFetchJson<AvailabilityResponse>(`/api/bookings/availability?${q}`)
}
