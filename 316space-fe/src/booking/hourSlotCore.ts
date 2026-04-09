import type { AvailabilityItem } from '../api/bookingCalendar'

/** 하루 24시간: 칸 [h, h+1), h = 0..23 */
export const FIRST_SLOT_HOUR = 0
export const LAST_SLOT_HOUR = 23

export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export type BusyInterval = { start: Date; end: Date }

export function itemTouchesYmd(item: AvailabilityItem, dayYmd: string): boolean {
  const dayStart = new Date(`${dayYmd}T00:00:00`)
  const dayEnd = new Date(`${dayYmd}T23:59:59.999`)
  const a = new Date(item.startAt)
  const b = new Date(item.endAt)
  return a < dayEnd && b > dayStart
}

export function busyIntervalsForDay(items: AvailabilityItem[], dayYmd: string): BusyInterval[] {
  return items
    .filter(i => itemTouchesYmd(i, dayYmd))
    .map(i => ({ start: new Date(i.startAt), end: new Date(i.endAt) }))
}

export function hourSlotBounds(dayYmd: string, h: number): { start: Date; end: Date } {
  const start = new Date(`${dayYmd}T${pad2(h)}:00:00`)
  return { start, end: new Date(start.getTime() + 60 * 60 * 1000) }
}

/** 선택 종료 시각(배타적 upper). endHour === 24 → 익일 00:00 */
export function exclusiveEndLocalIso(dayYmd: string, endHour: number): string {
  if (endHour < 24) return `${dayYmd}T${pad2(endHour)}:00:00`
  const d = new Date(`${dayYmd}T00:00:00`)
  d.setDate(d.getDate() + 1)
  return `${ymd(d)}T00:00:00`
}

export function hourSlotPast(h: number, dayYmd: string, now: Date): boolean {
  if (dayYmd < ymd(now)) return true
  if (dayYmd > ymd(now)) return false
  const { start: slotStart } = hourSlotBounds(dayYmd, h)
  return now >= slotStart
}

export function hourSlotBookedOrBlocked(h: number, dayYmd: string, busy: BusyInterval[]): boolean {
  const { start: slotStart, end: slotEnd } = hourSlotBounds(dayYmd, h)
  return busy.some(b => slotStart < b.end && slotEnd > b.start)
}

export function hourSlotFree(h: number, dayYmd: string, busy: BusyInterval[], now: Date): boolean {
  if (hourSlotPast(h, dayYmd, now)) return false
  return !hourSlotBookedOrBlocked(h, dayYmd, busy)
}

export function rangeFullyFree(
  fromH: number,
  toH: number,
  dayYmd: string,
  busy: BusyInterval[],
  now: Date,
): boolean {
  const lo = Math.min(fromH, toH)
  const hi = Math.max(fromH, toH)
  for (let h = lo; h < hi; h++) {
    if (!hourSlotFree(h, dayYmd, busy, now)) return false
  }
  return true
}

export function selectionOverlapsBusy(start: Date, end: Date, busy: BusyInterval[]): boolean {
  return busy.some(b => start < b.end && end > b.start)
}

/** 월 단위 캐시에서 특정 일 데이터만 최신 조회분으로 갈아끼움 */
export function mergeAvailabilityItemsForDay(
  prevItems: AvailabilityItem[],
  dayYmd: string,
  freshForRange: AvailabilityItem[],
): AvailabilityItem[] {
  const rest = prevItems.filter(i => !itemTouchesYmd(i, dayYmd))
  return [...rest, ...freshForRange]
}

/**
 * 제출 직전 등: 서버에서 방금 받은 점유 목록으로 구간 예약 가능 여부 (과거·겹침·부분 점유).
 */
export function isHourRangeBookable(
  dayYmd: string,
  startHour: number,
  endHour: number,
  items: AvailabilityItem[],
  now: Date,
): boolean {
  if (dayYmd < ymd(now)) return false
  if (startHour < FIRST_SLOT_HOUR || startHour > LAST_SLOT_HOUR) return false
  if (endHour <= startHour || endHour > 24) return false
  const busy = busyIntervalsForDay(items, dayYmd)
  const selStart = new Date(`${dayYmd}T${pad2(startHour)}:00:00`)
  const selEnd = new Date(exclusiveEndLocalIso(dayYmd, endHour))
  if (selEnd <= selStart) return false
  if (dayYmd === ymd(now) && (selStart <= now || selEnd <= now)) return false
  if (selectionOverlapsBusy(selStart, selEnd, busy)) return false
  return rangeFullyFree(startHour, endHour, dayYmd, busy, now)
}
