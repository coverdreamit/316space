import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchBookingAvailability } from '../api/bookingAvailability'
import {
  BOOKING_STATUS_LABEL,
  type AvailabilityItem,
  SCHEDULE_BLOCK_TYPE_LABEL,
} from '../api/bookingCalendar'
import { fetchHalls, type HallListItem } from '../api/halls'
import { createMemberBooking } from '../api/memberBookings'
import { useAuth } from '../auth/AuthContext'

/** 예약 UI 기본 영업 시간 (시작 시각 ~ 마지막 종료 시각) */
const OPEN_HOUR = 9
const CLOSE_HOUR = 22

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function formatRangeLabel(isoStart: string, isoEnd: string): string {
  try {
    const a = new Date(isoStart)
    const b = new Date(isoEnd)
    return `${a.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })} ~ ${b.toLocaleTimeString('ko-KR', { timeStyle: 'short' })}`
  } catch {
    return `${isoStart} ~ ${isoEnd}`
  }
}

function itemTouchesYmd(item: AvailabilityItem, dayYmd: string): boolean {
  const dayStart = new Date(`${dayYmd}T00:00:00`)
  const dayEnd = new Date(`${dayYmd}T23:59:59.999`)
  const a = new Date(item.startAt)
  const b = new Date(item.endAt)
  return a < dayEnd && b > dayStart
}

function busyIntervalsForDay(items: AvailabilityItem[], dayYmd: string): { start: Date; end: Date }[] {
  return items
    .filter(i => itemTouchesYmd(i, dayYmd))
    .map(i => ({ start: new Date(i.startAt), end: new Date(i.endAt) }))
}

/**
 * 오늘이면 해당 칸의 시작 정각이 이미 지난 경우 true (17:30이면 17~18칸은 잠금).
 * 1시간 단위 예약은 ‘이미 시작한 시간대’는 예약할 수 없다고 본다.
 */
function hourSlotPast(h: number, dayYmd: string, now: Date): boolean {
  if (h < OPEN_HOUR || h >= CLOSE_HOUR) return true
  if (dayYmd < ymd(now)) return true
  if (dayYmd > ymd(now)) return false
  const slotStart = new Date(`${dayYmd}T${pad2(h)}:00:00`)
  return now >= slotStart
}

function hourSlotBookedOrBlocked(
  h: number,
  dayYmd: string,
  busy: { start: Date; end: Date }[],
): boolean {
  if (h < OPEN_HOUR || h >= CLOSE_HOUR) return true
  const slotStart = new Date(`${dayYmd}T${pad2(h)}:00:00`)
  const slotEnd = new Date(`${dayYmd}T${pad2(h + 1)}:00:00`)
  return busy.some(b => slotStart < b.end && slotEnd > b.start)
}

/** [h, h+1) 구간이 영업·미과거·비어 있으면 true */
function hourSlotFree(
  h: number,
  dayYmd: string,
  busy: { start: Date; end: Date }[],
  now: Date,
): boolean {
  if (hourSlotPast(h, dayYmd, now)) return false
  return !hourSlotBookedOrBlocked(h, dayYmd, busy)
}

function dayHasAnyFreeSlot(dayYmd: string, items: AvailabilityItem[], now: Date): boolean {
  if (dayYmd < ymd(now)) return false
  const busy = busyIntervalsForDay(items, dayYmd)
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    if (hourSlotFree(h, dayYmd, busy, now)) return true
  }
  return false
}

function selectionOverlapsBusy(start: Date, end: Date, busy: { start: Date; end: Date }[]): boolean {
  return busy.some(b => start < b.end && end > b.start)
}

function describeItem(item: AvailabilityItem): string {
  if (item.kind === 'BOOKING') {
    return `예약 · ${BOOKING_STATUS_LABEL[item.status]} · ${formatRangeLabel(item.startAt, item.endAt)}`
  }
  const label = SCHEDULE_BLOCK_TYPE_LABEL[item.blockType]
  const title = item.title ? ` · ${item.title}` : ''
  return `${label}${title} · ${formatRangeLabel(item.startAt, item.endAt)}`
}

function lastDayOfMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate()
}

function buildMonthGrid(year: number, month0: number): (string | null)[] {
  const first = new Date(year, month0, 1)
  const pad = first.getDay()
  const dim = lastDayOfMonth(year, month0)
  const cells: (string | null)[] = []
  for (let i = 0; i < pad; i++) cells.push(null)
  for (let d = 1; d <= dim; d++) cells.push(`${year}-${pad2(month0 + 1)}-${pad2(d)}`)
  while (cells.length % 7 !== 0) cells.push(null)
  while (cells.length < 42) cells.push(null)
  return cells
}

function rangeFullyFree(fromH: number, toH: number, dayYmd: string, busy: { start: Date; end: Date }[], now: Date) {
  const lo = Math.min(fromH, toH)
  const hi = Math.max(fromH, toH)
  for (let h = lo; h < hi; h++) {
    if (!hourSlotFree(h, dayYmd, busy, now)) return false
  }
  return true
}

export default function BookingPage() {
  const { isAuthenticated } = useAuth()
  const [halls, setHalls] = useState<HallListItem[]>([])
  const [hallId, setHallId] = useState<string>('')

  const [phase, setPhase] = useState<'month' | 'day'>('month')
  const [detailYmd, setDetailYmd] = useState<string>('')

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const [itemsByHall, setItemsByHall] = useState<Record<string, AvailabilityItem[]>>({})
  const [slotMinutes, setSlotMinutes] = useState(60)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadingHalls, setLoadingHalls] = useState(true)
  const [loadingMonth, setLoadingMonth] = useState(false)

  const [startHour, setStartHour] = useState(OPEN_HOUR)
  const [endHour, setEndHour] = useState(OPEN_HOUR + 1)
  /** 시간 칸 두 번 클릭으로 구간 잡기: 첫 클릭 시각 */
  const [rangeFirst, setRangeFirst] = useState<number | null>(null)
  /** 일간 뷰에서 현재 시각이 지나면 슬롯 색·선택 가능 여부를 갱신 */
  const [slotClockTick, setSlotClockTick] = useState(0)

  const [headcount, setHeadcount] = useState(1)
  const [purpose, setPurpose] = useState('')
  const [note, setNote] = useState('')

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successBookingNo, setSuccessBookingNo] = useState<string | null>(null)

  const todayYmd = ymd(new Date())

  const calendarCells = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth])

  const dayItems = useMemo(
    () => (itemsByHall[hallId] ?? []).filter(i => itemTouchesYmd(i, detailYmd)),
    [itemsByHall, hallId, detailYmd],
  )

  const busyForDetail = useMemo(
    () => busyIntervalsForDay(itemsByHall[hallId] ?? [], detailYmd),
    [itemsByHall, hallId, detailYmd],
  )

  const freeByHour = useMemo(() => {
    const now = new Date()
    const m: Record<number, boolean> = {}
    for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
      m[h] = hourSlotFree(h, detailYmd, busyForDetail, now)
    }
    return m
  }, [detailYmd, busyForDetail, slotClockTick])

  const pastByHour = useMemo(() => {
    const now = new Date()
    const m: Record<number, boolean> = {}
    for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
      m[h] = hourSlotPast(h, detailYmd, now)
    }
    return m
  }, [detailYmd, slotClockTick])

  const selectionValid = useMemo(() => {
    const now = new Date()
    if (phase !== 'day' || !detailYmd) return false
    if (detailYmd < todayYmd) return false
    if (endHour <= startHour) return false
    const selStart = new Date(`${detailYmd}T${pad2(startHour)}:00:00`)
    const selEnd = new Date(`${detailYmd}T${pad2(endHour)}:00:00`)
    if (selEnd <= selStart || selStart <= now || selEnd <= now) return false
    if (startHour < OPEN_HOUR || endHour > CLOSE_HOUR) return false
    if (selectionOverlapsBusy(selStart, selEnd, busyForDetail)) return false
    return rangeFullyFree(startHour, endHour, detailYmd, busyForDetail, now)
  }, [phase, detailYmd, todayYmd, startHour, endHour, busyForDetail, slotClockTick])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadingHalls(true)
      setLoadError(null)
      try {
        const list = await fetchHalls()
        if (cancelled) return
        setHalls(list)
        if (list.length > 0) {
          setHallId(prev =>
            prev && list.some(h => h.hallId === prev) ? prev : list[0].hallId,
          )
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : '홀 목록을 불러오지 못했습니다.')
          setHalls([])
        }
      } finally {
        if (!cancelled) setLoadingHalls(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const loadMonthAllHalls = useCallback(async () => {
    if (halls.length === 0) {
      setItemsByHall({})
      return
    }
    setLoadingMonth(true)
    setLoadError(null)
    setItemsByHall({})
    setSuccessBookingNo(null)
    try {
      const dim = lastDayOfMonth(viewYear, viewMonth)
      const from = `${viewYear}-${pad2(viewMonth + 1)}-01T00:00:00`
      const to = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(dim)}T23:59:59`
      const results = await Promise.all(
        halls.map(h => fetchBookingAvailability({ hallId: h.hallId, from, to })),
      )
      const next: Record<string, AvailabilityItem[]> = {}
      halls.forEach((h, i) => {
        next[h.hallId] = results[i].items
      })
      setItemsByHall(next)
      setSlotMinutes(results[0]?.slotMinutes ?? 60)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : '일정을 불러오지 못했습니다.')
    } finally {
      setLoadingMonth(false)
    }
  }, [halls, viewYear, viewMonth])

  useEffect(() => {
    if (halls.length === 0) return
    void loadMonthAllHalls()
  }, [halls, loadMonthAllHalls])

  useEffect(() => {
    if (phase !== 'day') return
    const id = window.setInterval(() => setSlotClockTick(t => t + 1), 30_000)
    return () => window.clearInterval(id)
  }, [phase])

  useEffect(() => {
    setRangeFirst(null)
    if (phase !== 'day' || !detailYmd) return
    const now = new Date()
    const busy = busyIntervalsForDay(itemsByHall[hallId] ?? [], detailYmd)
    let found = false
    for (let s = OPEN_HOUR; s < CLOSE_HOUR; s++) {
      if (rangeFullyFree(s, s + 1, detailYmd, busy, now)) {
        setStartHour(s)
        setEndHour(s + 1)
        found = true
        break
      }
    }
    if (!found) {
      setStartHour(OPEN_HOUR)
      setEndHour(OPEN_HOUR + 1)
    }
  }, [hallId, detailYmd, phase, itemsByHall, slotClockTick])

  const goPrevMonth = () => {
    setViewMonth(m => {
      if (m === 0) {
        setViewYear(y => y - 1)
        return 11
      }
      return m - 1
    })
  }

  const goNextMonth = () => {
    setViewMonth(m => {
      if (m === 11) {
        setViewYear(y => y + 1)
        return 0
      }
      return m + 1
    })
  }

  const monthTitle = useMemo(
    () =>
      new Date(viewYear, viewMonth, 1).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
      }),
    [viewYear, viewMonth],
  )

  const detailTitle = useMemo(() => {
    if (!detailYmd) return ''
    const [y, m, d] = detailYmd.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('ko-KR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [detailYmd])

  const openDay = (cellYmd: string) => {
    setDetailYmd(cellYmd)
    setPhase('day')
    setSubmitError(null)
    setSuccessBookingNo(null)
    setRangeFirst(null)
  }

  const onHourSlotClick = (h: number) => {
    if (!freeByHour[h]) return
    const busy = busyForDetail
    const now = new Date()
    if (rangeFirst === null) {
      setRangeFirst(h)
      setStartHour(h)
      setEndHour(h + 1)
      return
    }
    const from = Math.min(rangeFirst, h)
    const to = Math.max(rangeFirst, h) + 1
    if (!rangeFullyFree(from, to, detailYmd, busy, now)) return
    setStartHour(from)
    setEndHour(to)
    setRangeFirst(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!isAuthenticated) {
      setSubmitError('로그인 후 예약할 수 있습니다.')
      return
    }
    if (!selectionValid) {
      setSubmitError('선택한 시간이 비어 있지 않거나, 과거 시간이거나, 영업 시간 밖입니다.')
      return
    }
    const startAt = `${detailYmd}T${pad2(startHour)}:00:00`
    const endAt = `${detailYmd}T${pad2(endHour)}:00:00`
    setSubmitting(true)
    try {
      const res = await createMemberBooking({
        hallId,
        startAt,
        endAt,
        headcount: headcount >= 1 ? headcount : 1,
        purpose: purpose.trim() === '' ? null : purpose.trim(),
        note: note.trim() === '' ? null : note.trim(),
      })
      setSuccessBookingNo(res.bookingNo)
      void loadMonthAllHalls()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '예약에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    document.title = '예약 · 316 SPACE'
  }, [])

  const hallMarksForDay = (cellYmd: string) => {
    const past = cellYmd < todayYmd
    const now = new Date()
    return halls.map(h => {
      const items = itemsByHall[h.hallId] ?? []
      const free = !past && dayHasAnyFreeSlot(cellYmd, items, now)
      return (
        <span
          key={h.hallId}
          className={[
            'booking-cal__hall-mark',
            past ? 'booking-cal__hall-mark--past' : free ? 'booking-cal__hall-mark--free' : 'booking-cal__hall-mark--busy',
          ].join(' ')}
          title={`${h.name}: ${past ? '지난 날' : free ? '예약 가능 시간 있음' : '해당일 영업시간 내 예약 불가'}`}
          aria-hidden
        />
      )
    })
  }

  return (
    <main className="page-document">
      <header className="page-document__hero">
        <h1 className="page-document__title">예약</h1>
        <p className="page-document__lead">
          달력에서 날짜를 누르면 그날의 시간대를 칸별로 확인할 수 있습니다. 녹색은 예약 가능, 주황은 불가입니다.
        </p>
      </header>

      <section className="booking-panel" aria-labelledby="booking-form-heading">
        <h2 id="booking-form-heading" className="page-document__section-title">
          예약하기
        </h2>

        {loadError && <p className="booking-banner booking-banner--error">{loadError}</p>}
        {successBookingNo && (
          <p className="booking-banner booking-banner--ok">
            예약이 접수되었습니다. 예약 번호 <strong>{successBookingNo}</strong>
          </p>
        )}

        {phase === 'month' && (
          <>
            <div className="booking-legend booking-legend--month">
              <span className="booking-legend__item">
                <span className="booking-cal__hall-mark booking-cal__hall-mark--free" aria-hidden /> 날짜 칸: 홀마다
                예약 가능 시간이 있으면 녹색, 없으면 주황
              </span>
            </div>

            <div className="booking-cal booking-cal--wide" aria-label="예약 달력">
              <div className="booking-cal__head">
                <button type="button" className="booking-cal__nav" onClick={goPrevMonth} aria-label="이전 달">
                  ‹
                </button>
                <span className="booking-cal__title">{monthTitle}</span>
                <button type="button" className="booking-cal__nav" onClick={goNextMonth} aria-label="다음 달">
                  ›
                </button>
              </div>
              <div className="booking-cal__weekdays" role="row">
                {WEEKDAY_LABELS.map(w => (
                  <div key={w} className="booking-cal__weekday" role="columnheader">
                    {w}
                  </div>
                ))}
              </div>
              <div
                className={`booking-cal__grid booking-cal__grid--large ${loadingMonth ? 'booking-cal__grid--loading' : ''}`}
                role="grid"
                aria-busy={loadingMonth}
              >
                {calendarCells.map((cellYmd, i) => {
                  if (cellYmd == null) {
                    return <div key={`e-${i}`} className="booking-cal__cell booking-cal__cell--empty" />
                  }
                  const past = cellYmd < todayYmd
                  return (
                    <button
                      key={cellYmd}
                      type="button"
                      role="gridcell"
                      disabled={past || loadingMonth}
                      className={[
                        'booking-cal__cell',
                        'booking-cal__day',
                        'booking-cal__day--monthcell',
                        past ? 'booking-cal__day--past' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => {
                        if (!past) openDay(cellYmd)
                      }}
                      aria-label={`${cellYmd} 상세 시간 선택`}
                    >
                      <span className="booking-cal__day-num">{Number(cellYmd.slice(-2))}</span>
                      <div className="booking-cal__halls">{hallMarksForDay(cellYmd)}</div>
                    </button>
                  )
                })}
              </div>
              <p className="booking-cal__sublegend">
                홀 개수만큼 작은 사각형이 표시됩니다. 날짜를 누르면 그날의 시간표로 이동합니다.
              </p>
            </div>
          </>
        )}

        {phase === 'day' && (
          <div className="booking-day-view">
            <div className="booking-day-view__top">
              <button
                type="button"
                className="booking-back"
                onClick={() => {
                  setPhase('month')
                  setRangeFirst(null)
                }}
              >
                ← 달력으로
              </button>
              <h3 className="booking-day-view__title">{detailTitle}</h3>
            </div>

            <div className="booking-field booking-field--hall booking-field--day">
              <label className="booking-label" htmlFor="booking-hall-day">
                예약 홀
              </label>
              <select
                id="booking-hall-day"
                className="booking-input"
                value={hallId}
                onChange={e => setHallId(e.target.value)}
                disabled={loadingHalls || halls.length === 0}
              >
                {halls.map(h => (
                  <option key={h.id} value={h.hallId}>
                    {h.name} ({h.hallId})
                  </option>
                ))}
              </select>
            </div>

            <div className="booking-legend booking-legend--day">
              <span className="booking-legend__item">
                <span className="booking-slot-legend booking-slot-legend--free" /> 예약 가능
              </span>
              <span className="booking-legend__item">
                <span className="booking-slot-legend booking-slot-legend--past" /> 지난 시간
              </span>
              <span className="booking-legend__item">
                <span className="booking-slot-legend booking-slot-legend--busy" /> 예약·블록으로 불가
              </span>
              <span className="booking-legend__item">
                <span className="booking-slot-legend booking-slot-legend--picked" /> 선택한 구간
              </span>
            </div>

            <p className="booking-hint">
              {OPEN_HOUR}시~{CLOSE_HOUR}시, 한 칸은 1시간입니다. 가능한 칸을 눌러 시작·다음 칸으로 끝을 정합니다 (두 번째
              클릭). · {slotMinutes}분 단위 정책과 동일하게 맞춰 두었습니다.
            </p>

            <div className="booking-slot-grid" role="list" aria-label="시간대">
              {Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i).map(h => {
                const past = pastByHour[h]
                const free = freeByHour[h]
                const inRange = h >= startHour && h < endHour
                const toneClass = past ? 'booking-slot--past' : free ? 'booking-slot--free' : 'booking-slot--busy'
                const pickedClass =
                  inRange && free
                    ? 'booking-slot--picked'
                    : inRange && past
                      ? 'booking-slot--picked-past'
                      : ''
                return (
                  <button
                    key={h}
                    type="button"
                    role="listitem"
                    disabled={!free}
                    className={['booking-slot', toneClass, pickedClass].filter(Boolean).join(' ')}
                    onClick={() => onHourSlotClick(h)}
                  >
                    <span className="booking-slot__time">
                      {pad2(h)}:00 – {pad2(h + 1)}:00
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="booking-busy booking-busy--compact">
              <h4 className="booking-busy__title">이날 예약·블록</h4>
              {dayItems.length === 0 ? (
                <p className="booking-hint">등록된 항목이 없습니다.</p>
              ) : (
                <ul className="booking-busy__list">
                  {dayItems.map((item, idx) => (
                    <li key={`${item.kind}-${item.startAt}-${idx}`}>{describeItem(item)}</li>
                  ))}
                </ul>
              )}
            </div>

            <form className="booking-form" onSubmit={e => void handleSubmit(e)}>
              <p className="booking-selection-summary">
                선택 시간:{' '}
                <strong>
                  {pad2(startHour)}:00 ~ {pad2(endHour)}:00
                </strong>{' '}
                ({endHour - startHour}시간)
                {rangeFirst !== null && (
                  <span className="booking-selection-summary__hint"> · 두 번째 칸을 눌러 종료 시각을 정하세요</span>
                )}
              </p>

              <div className="booking-grid">
                <div className="booking-field">
                  <label className="booking-label" htmlFor="booking-headcount">
                    인원
                  </label>
                  <input
                    id="booking-headcount"
                    className="booking-input"
                    type="number"
                    min={1}
                    max={99}
                    value={headcount}
                    onChange={e => setHeadcount(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="booking-field booking-field--full">
                <label className="booking-label" htmlFor="booking-purpose">
                  용도 (선택)
                </label>
                <input
                  id="booking-purpose"
                  className="booking-input"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="booking-field booking-field--full">
                <label className="booking-label" htmlFor="booking-note">
                  메모 (선택)
                </label>
                <textarea
                  id="booking-note"
                  className="booking-input booking-textarea"
                  rows={2}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>

              {!selectionValid && (
                <p className="booking-hint booking-hint--warn">
                  선택한 구간이 비어 있지 않거나, 과거이거나, 영업 시간을 벗어났습니다. 녹색 칸만 눌러 구간을 잡아 주세요.
                </p>
              )}

              {submitError && <p className="booking-banner booking-banner--error">{submitError}</p>}

              {!isAuthenticated ? (
                <p className="page-document__prose">
                  예약 제출은 로그인이 필요합니다. 상단에서 로그인한 뒤 다시 시도해 주세요. 비회원·문의는{' '}
                  <Link to="/contact">Contact</Link>를 이용해 주세요.
                </p>
              ) : (
                <button type="submit" className="booking-submit" disabled={!selectionValid || submitting}>
                  {submitting ? '제출 중…' : '예약 요청하기'}
                </button>
              )}
            </form>
          </div>
        )}
      </section>
    </main>
  )
}
