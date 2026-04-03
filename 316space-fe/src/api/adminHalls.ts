import { apiFetchJson } from './client'

export interface HallAdminDto {
  id: number
  hallId: string
  name: string
  sortOrder: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export async function fetchAdminHalls(): Promise<HallAdminDto[]> {
  return apiFetchJson<HallAdminDto[]>('/api/admin/halls')
}

export async function createAdminHall(body: {
  hallId: string
  name: string
  sortOrder: number
  active: boolean
}): Promise<HallAdminDto> {
  return apiFetchJson<HallAdminDto>('/api/admin/halls', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function updateAdminHall(
  id: number,
  body: { name: string; sortOrder: number; active: boolean },
): Promise<HallAdminDto> {
  return apiFetchJson<HallAdminDto>(`/api/admin/halls/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}
