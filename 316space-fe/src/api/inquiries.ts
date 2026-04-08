import { apiFetch, apiFetchJson, HttpError, readErrorMessage } from './client'

export const INQUIRY_GUEST_PASSWORD_HEADER = 'X-Inquiry-Guest-Password'

export type InquiryCategory = 'BOOKING' | 'FACILITY' | 'ETC'

export type InquiryStatus = 'WAITING' | 'ANSWERED'

export interface InquiryListItemDto {
  id: number
  category: InquiryCategory
  title: string
  authorName: string
  isPrivate: boolean
  /** 비회원 작성 여부 (구 API 호환: 없으면 false) */
  guestPost?: boolean
  status: InquiryStatus
  createdAt: string
}

export interface InquiryPageDto {
  content: InquiryListItemDto[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export async function fetchInquiries(page = 0, size = 10, status?: InquiryStatus): Promise<InquiryPageDto> {
  const q = new URLSearchParams({ page: String(page), size: String(size) })
  if (status) q.set('status', status)
  return apiFetchJson<InquiryPageDto>(`/api/inquiries?${q.toString()}`)
}

export interface AnswerDto {
  id: number
  content: string
  createdAt: string
  updatedAt: string
}

export interface InquiryDetailDto {
  id: number
  category: InquiryCategory
  title: string
  content: string
  authorName: string
  isPrivate: boolean
  status: InquiryStatus
  answer: AnswerDto | null
  createdAt: string
  guestPost: boolean
  mine: boolean
  canEdit: boolean
  canDelete: boolean
}

function guestPasswordHeaders(password: string | undefined): HeadersInit {
  if (password == null || password === '') return {}
  return { [INQUIRY_GUEST_PASSWORD_HEADER]: password }
}

export async function fetchInquiryDetail(id: number, guestPassword?: string): Promise<InquiryDetailDto> {
  return apiFetchJson<InquiryDetailDto>(`/api/inquiries/${id}`, {
    headers: guestPasswordHeaders(guestPassword),
  })
}

export interface CreateInquiryBody {
  authorName: string
  authorPhone?: string | null
  authorEmail?: string | null
  category: InquiryCategory
  title: string
  content: string
  isPrivate: boolean
  /** 비회원 필수 */
  guestPassword?: string | null
}

export async function createInquiry(body: CreateInquiryBody): Promise<InquiryDetailDto> {
  const payload: Record<string, unknown> = {
    authorName: body.authorName.trim(),
    category: body.category,
    title: body.title.trim(),
    content: body.content.trim(),
    isPrivate: body.isPrivate,
  }
  const phone = body.authorPhone?.trim()
  payload.authorPhone = phone && phone.length > 0 ? phone : null
  const email = body.authorEmail?.trim()
  payload.authorEmail = email && email.length > 0 ? email : null
  if (body.guestPassword != null && body.guestPassword !== '') {
    payload.guestPassword = body.guestPassword
  } else {
    payload.guestPassword = null
  }

  return apiFetchJson<InquiryDetailDto>('/api/inquiries', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export interface UpdateInquiryBody {
  category: InquiryCategory
  title: string
  content: string
  isPrivate: boolean
}

export async function updateInquiry(
  id: number,
  body: UpdateInquiryBody,
  guestPassword?: string,
): Promise<InquiryDetailDto> {
  return apiFetchJson<InquiryDetailDto>(`/api/inquiries/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...guestPasswordHeaders(guestPassword),
    },
    body: JSON.stringify(body),
  })
}

export async function deleteInquiry(id: number, guestPassword?: string): Promise<void> {
  const res = await apiFetch(`/api/inquiries/${id}`, {
    method: 'DELETE',
    headers: guestPasswordHeaders(guestPassword),
  })
  if (!res.ok) throw new HttpError(await readErrorMessage(res), res.status)
}
