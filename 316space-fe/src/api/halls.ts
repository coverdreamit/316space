import { apiFetchJson } from './client'

export interface HallListItem {
  id: number
  hallId: string
  name: string
}

export async function fetchHalls(): Promise<HallListItem[]> {
  return apiFetchJson<HallListItem[]>('/api/halls')
}
