import { apiFetchJson } from './client'
import type { AnswerDto } from './inquiries'

export async function adminPostInquiryAnswer(inquiryId: number, content: string): Promise<AnswerDto> {
  return apiFetchJson<AnswerDto>(`/api/inquiries/${inquiryId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ content: content.trim() }),
  })
}

export async function adminPatchInquiryAnswer(inquiryId: number, content: string): Promise<AnswerDto> {
  return apiFetchJson<AnswerDto>(`/api/inquiries/${inquiryId}/answer`, {
    method: 'PATCH',
    body: JSON.stringify({ content: content.trim() }),
  })
}
