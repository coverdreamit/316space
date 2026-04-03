import type { DayOfWeekName } from './bookingCalendar'
import { apiFetchJson } from './client'

export interface BusinessHoursRowDto {
  id: number
  hallId: string
  dayOfWeek: DayOfWeekName
  openTime: string
  closeTime: string
}

export async function fetchBusinessHours(hallId: string): Promise<BusinessHoursRowDto[]> {
  return apiFetchJson<BusinessHoursRowDto[]>(
    `/api/admin/halls/${encodeURIComponent(hallId)}/business-hours`,
  )
}

export async function replaceBusinessHours(
  hallId: string,
  rows: { dayOfWeek: DayOfWeekName; openTime: string; closeTime: string }[],
): Promise<BusinessHoursRowDto[]> {
  return apiFetchJson<BusinessHoursRowDto[]>(
    `/api/admin/halls/${encodeURIComponent(hallId)}/business-hours`,
    {
      method: 'PUT',
      body: JSON.stringify({ rows }),
    },
  )
}
