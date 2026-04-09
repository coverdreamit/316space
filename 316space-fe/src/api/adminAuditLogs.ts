import type { PageDto } from './adminBookings'
import { apiFetchJson } from './client'

export type AuditLogDto = {
  id: number
  occurredAt: string
  actorMemberId: number | null
  actorLabel: string | null
  action: string
  targetType: string | null
  targetId: string | null
  ipAddress: string | null
  detail: string | null
}

/** 액션 필터·표시용 (백엔드 ActivityAuditAction 과 동일) */
export const AUDIT_ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'REGISTER', label: '회원가입' },
  { value: 'SMS_VERIFICATION_SEND', label: 'SMS 인증 요청' },
  { value: 'SMS_VERIFICATION_SUCCESS', label: 'SMS 인증 성공' },
  { value: 'LOGIN_SUCCESS', label: '로그인 성공' },
  { value: 'LOGIN_FAILURE', label: '로그인 실패' },
  { value: 'LOGIN_BLOCKED_WITHDRAWN', label: '로그인 차단(탈퇴)' },
  { value: 'LOGIN_BLOCKED_SUSPENDED', label: '로그인 차단(정지)' },
  { value: 'PROFILE_ACCESS_ISSUED', label: '프로필 수정 인증' },
  { value: 'PROFILE_UPDATE', label: '프로필·비밀번호 변경' },
  { value: 'BOOKING_CREATE_MEMBER', label: '예약(회원)' },
  { value: 'BOOKING_CREATE_GUEST', label: '예약(비회원)' },
  { value: 'BOOKING_CANCEL_MEMBER', label: '예약 취소(회원)' },
  { value: 'BOOKING_CANCEL_GUEST', label: '예약 취소(비회원)' },
  { value: 'BOOKING_ADMIN_CREATE', label: '예약 등록(관리자)' },
  { value: 'BOOKING_ADMIN_CONFIRM', label: '예약 확정(관리자)' },
  { value: 'BOOKING_ADMIN_CANCEL', label: '예약 취소(관리자)' },
  { value: 'INQUIRY_CREATE', label: '문의 작성' },
  { value: 'INQUIRY_UPDATE', label: '문의 수정' },
  { value: 'INQUIRY_DELETE', label: '문의 삭제' },
  { value: 'INQUIRY_ANSWER_CREATE', label: '문의 답변 등록' },
  { value: 'INQUIRY_ANSWER_UPDATE', label: '문의 답변 수정' },
  { value: 'ADMIN_MEMBER_UPDATE', label: '회원 수정(관리자)' },
  { value: 'ADMIN_MEMBER_DELETE', label: '회원 삭제(관리자)' },
  { value: 'ADMIN_HALL_CREATE', label: '홀 등록' },
  { value: 'ADMIN_HALL_UPDATE', label: '홀 수정' },
  { value: 'ADMIN_SCHEDULE_BLOCK_CREATE', label: '스케줄 블록 등록' },
  { value: 'ADMIN_SCHEDULE_BLOCK_UPDATE', label: '스케줄 블록 수정' },
  { value: 'ADMIN_SCHEDULE_BLOCK_DELETE', label: '스케줄 블록 삭제' },
  { value: 'ADMIN_BUSINESS_HOURS_REPLACE', label: '영업시간 일괄 반영' },
  { value: 'ADMIN_NOTIFICATION_SETTINGS_UPDATE', label: '알림 설정 변경' },
  { value: 'ADMIN_NOTIFICATION_TEST', label: 'Slack 테스트' },
]

const ACTION_LABEL_MAP = Object.fromEntries(
  AUDIT_ACTION_OPTIONS.filter(o => o.value).map(o => [o.value, o.label]),
) as Record<string, string>

export function auditActionLabel(code: string): string {
  return ACTION_LABEL_MAP[code] ?? code
}

export async function fetchAdminAuditLogs(params: {
  page?: number
  size?: number
  from?: string
  to?: string
  action?: string
}): Promise<PageDto<AuditLogDto>> {
  const q = new URLSearchParams()
  if (params.page != null) q.set('page', String(params.page))
  if (params.size != null) q.set('size', String(params.size))
  if (params.from) q.set('from', params.from)
  if (params.to) q.set('to', params.to)
  if (params.action) q.set('action', params.action)
  const qs = q.toString()
  return apiFetchJson<PageDto<AuditLogDto>>(`/api/admin/audit-logs${qs ? `?${qs}` : ''}`)
}
