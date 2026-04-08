import { apiFetch, apiFetchJson, readErrorMessage } from './client'

export type MemberStatus = 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN'

export interface AdminMemberDto {
  id: number
  loginId: string
  name: string
  email: string | null
  phone: string | null
  status: MemberStatus
  createdAt: string
}

export async function fetchAdminMembers(q?: string): Promise<AdminMemberDto[]> {
  const params = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''
  return apiFetchJson<AdminMemberDto[]>(`/api/admin/members${params}`)
}

export async function patchAdminMember(
  id: number,
  body: {
    name: string
    email: string | null
    phone: string | null
    status: MemberStatus
    password?: string | null
  },
): Promise<AdminMemberDto> {
  return apiFetchJson<AdminMemberDto>(`/api/admin/members/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function deleteAdminMember(id: number): Promise<void> {
  const res = await apiFetch(`/api/admin/members/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await readErrorMessage(res))
}

export const MEMBER_STATUS_LABEL: Record<MemberStatus, string> = {
  ACTIVE: '활성',
  SUSPENDED: '정지',
  WITHDRAWN: '탈퇴',
}
