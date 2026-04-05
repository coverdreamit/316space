/**
 * 예약 캘린더·관리 화면용 타입 (백엔드 Booking / 향후 availability·블록·휴무 API 와 맞춤)
 */

/** com.space316.be.domain.booking.BookingStatus */
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: '요청',
  CONFIRMED: '확정',
  CANCELLED: '취소',
}

/** BookingResponse — 백엔드 record 필드명과 동일 (JSON 직렬화 camelCase 가정) */
export interface BookingDto {
  id: number
  bookingNo: string
  guestName: string
  guestPhone: string
  hallId: string
  startAt: string
  endAt: string
  headcount: number | null
  purpose: string | null
  note: string | null
  status: BookingStatus
  cancelledAt: string | null
  cancelReason: string | null
  createdAt: string
}

export interface HallDto {
  id: number
  hallId: string
  name: string
  sortOrder: number
  active: boolean
  createdAt: string
  updatedAt: string
}

/** schedule_block.block_type — 백엔드 enum 도입 시 동기화 */
export type ScheduleBlockType =
  | 'MAINTENANCE'
  | 'CLEANING'
  | 'INTERNAL'
  | 'OTHER'

export const SCHEDULE_BLOCK_TYPE_LABEL: Record<ScheduleBlockType, string> = {
  MAINTENANCE: '정검',
  CLEANING: '청소',
  INTERNAL: '내부 사용',
  OTHER: '기타',
}

export interface ScheduleBlockDto {
  id: number
  hallId: string
  startAt: string
  endAt: string
  blockType: ScheduleBlockType
  title: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

/** java.time.DayOfWeek name */
export type DayOfWeekName =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

export const DAY_OF_WEEK_LABEL: Record<DayOfWeekName, string> = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
}

/** openTime / closeTime — "HH:mm:ss" 또는 "HH:mm" 로컬 시각 문자열 */
export interface BusinessHoursDto {
  id: number
  hallId: string
  dayOfWeek: DayOfWeekName
  openTime: string
  closeTime: string
}

export interface HallClosureDto {
  id: number
  /** null 이면 전체 시설 */
  hallId: string | null
  closureDate: string
  allDay: boolean
  startAt: string | null
  endAt: string | null
  reason: string | null
  createdAt: string
  updatedAt: string
}

/** GET /api/bookings/availability 등 가용성 API용 (예정) */
export type AvailabilityKind = 'BOOKING' | 'BLOCK'

export interface AvailabilityBookingItem {
  kind: 'BOOKING'
  startAt: string
  endAt: string
  status: BookingStatus
  bookingNo: string
}

export interface AvailabilityBlockItem {
  kind: 'BLOCK'
  startAt: string
  endAt: string
  blockType: ScheduleBlockType
  title: string | null
}

export type AvailabilityItem = AvailabilityBookingItem | AvailabilityBlockItem

export interface AvailabilityResponse {
  hallId: string
  slotMinutes: number
  items: AvailabilityItem[]
}

/** UI 그리드 설정 (서버 검증과 함께 쓰기 좋음) */
export interface BookingSlotPolicy {
  slotMinutes: number
  minDurationMinutes: number
  maxAdvanceDays: number
}
