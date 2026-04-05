import type { ScheduleBlockDto, ScheduleBlockType } from './bookingCalendar'
import { apiFetch, apiFetchJson, readErrorMessage } from './client'

export interface ScheduleBlockUpsertBody {
  hallId: string
  startAt: string
  endAt: string
  blockType: ScheduleBlockType
  title?: string | null
  note?: string | null
}

export async function fetchAdminScheduleBlocks(params: {
  from: string
  to: string
  hallId?: string
}): Promise<ScheduleBlockDto[]> {
  const q = new URLSearchParams({ from: params.from, to: params.to })
  if (params.hallId) q.set('hallId', params.hallId)
  return apiFetchJson<ScheduleBlockDto[]>(`/api/admin/schedule-blocks?${q}`)
}

export async function createAdminScheduleBlock(body: ScheduleBlockUpsertBody): Promise<ScheduleBlockDto> {
  return apiFetchJson<ScheduleBlockDto>('/api/admin/schedule-blocks', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function updateAdminScheduleBlock(
  id: number,
  body: ScheduleBlockUpsertBody,
): Promise<ScheduleBlockDto> {
  return apiFetchJson<ScheduleBlockDto>(`/api/admin/schedule-blocks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function deleteAdminScheduleBlock(id: number): Promise<void> {
  const res = await apiFetch(`/api/admin/schedule-blocks/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await readErrorMessage(res))
}
