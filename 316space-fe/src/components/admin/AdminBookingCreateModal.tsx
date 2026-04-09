import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { createAdminBooking } from '../../api/adminBookings'
import { fetchBookingAvailability } from '../../api/bookingAvailability'
import type { AvailabilityItem } from '../../api/bookingCalendar'
import { type HallAdminDto } from '../../api/adminHalls'
import {
  busyIntervalsForDay,
  exclusiveEndLocalIso,
  FIRST_SLOT_HOUR,
  hourSlotFree,
  hourSlotPast,
  isHourRangeBookable,
  LAST_SLOT_HOUR,
  pad2,
  rangeFullyFree,
  selectionOverlapsBusy,
  ymd,
} from '../../booking/hourSlotCore'

interface AdminBookingCreateModalProps {
  halls: HallAdminDto[]
  onClose: () => void
  onCreated: () => void | Promise<void>
}

export default function AdminBookingCreateModal({ halls, onClose, onCreated }: AdminBookingCreateModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [hallId, setHallId] = useState('')
  const [dateYmd, setDateYmd] = useState(() => ymd(new Date()))
  const [startHour, setStartHour] = useState(FIRST_SLOT_HOUR)
  const [endHour, setEndHour] = useState(FIRST_SLOT_HOUR + 1)
  const [rangeFirst, setRangeFirst] = useState<number | null>(null)
  const [items, setItems] = useState<AvailabilityItem[]>([])
  const [avLoading, setAvLoading] = useState(false)
  const [slotClockTick, setSlotClockTick] = useState(0)
  const [headcount, setHeadcount] = useState('')
  const [purpose, setPurpose] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const todayYmd = ymd(new Date())

  useEffect(() => {
    closeBtnRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    if (halls.length === 0) return
    const ids = new Set(halls.map(h => h.hallId))
    setHallId(prev => (prev && ids.has(prev) ? prev : halls[0].hallId))
  }, [halls])

  useEffect(() => {
    if (!hallId || !dateYmd) return
    let cancelled = false
    setAvLoading(true)
    ;(async () => {
      try {
        const from = `${dateYmd}T00:00:00`
        const to = `${dateYmd}T23:59:59`
        const res = await fetchBookingAvailability({ hallId, from, to })
        if (!cancelled) setItems(res.items)
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setAvLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [hallId, dateYmd])

  useEffect(() => {
    setRangeFirst(null)
  }, [dateYmd, hallId])

  useEffect(() => {
    if (avLoading) return
    const busy = busyIntervalsForDay(items, dateYmd)
    const now = new Date()
    for (let s = FIRST_SLOT_HOUR; s <= LAST_SLOT_HOUR; s++) {
      if (rangeFullyFree(s, s + 1, dateYmd, busy, now)) {
        setStartHour(s)
        setEndHour(s + 1)
        return
      }
    }
    setStartHour(FIRST_SLOT_HOUR)
    setEndHour(FIRST_SLOT_HOUR + 1)
  }, [dateYmd, hallId, avLoading, items])

  useEffect(() => {
    if (dateYmd !== todayYmd) return
    const id = window.setInterval(() => setSlotClockTick(t => t + 1), 30_000)
    return () => window.clearInterval(id)
  }, [dateYmd, todayYmd])

  const busyForDetail = useMemo(
    () => busyIntervalsForDay(items, dateYmd),
    [items, dateYmd],
  )

  const freeByHour = useMemo(() => {
    const now = new Date()
    const m: Record<number, boolean> = {}
    for (let h = FIRST_SLOT_HOUR; h <= LAST_SLOT_HOUR; h++) {
      m[h] = hourSlotFree(h, dateYmd, busyForDetail, now)
    }
    return m
  }, [dateYmd, busyForDetail, slotClockTick])

  const selectionValid = useMemo(() => {
    const now = new Date()
    if (!dateYmd) return false
    if (dateYmd < todayYmd) return false
    if (startHour < FIRST_SLOT_HOUR || startHour > LAST_SLOT_HOUR) return false
    if (endHour <= startHour || endHour > 24) return false
    const selStart = new Date(`${dateYmd}T${pad2(startHour)}:00:00`)
    const selEnd = new Date(exclusiveEndLocalIso(dateYmd, endHour))
    if (selEnd <= selStart) return false
    if (dateYmd === todayYmd && (selStart <= now || selEnd <= now)) return false
    if (selectionOverlapsBusy(selStart, selEnd, busyForDetail)) return false
    return rangeFullyFree(startHour, endHour, dateYmd, busyForDetail, now)
  }, [
    dateYmd,
    todayYmd,
    startHour,
    endHour,
    busyForDetail,
    slotClockTick,
  ])

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
    if (!rangeFullyFree(from, to, dateYmd, busy, now)) return
    setStartHour(from)
    setEndHour(to)
    setRangeFirst(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectionValid) {
      window.alert('날짜·시간 구간을 다시 선택해 주세요. 과거·겹치는 시간은 선택할 수 없습니다.')
      return
    }
    setSubmitting(true)
    try {
      const fresh = await fetchBookingAvailability({
        hallId,
        from: `${dateYmd}T00:00:00`,
        to: `${dateYmd}T23:59:59`,
      })
      if (!isHourRangeBookable(dateYmd, startHour, endHour, fresh.items, new Date())) {
        setItems(fresh.items)
        window.alert(
          '해당 시간은 방금 다른 예약으로 채워졌습니다. 슬롯을 갱신했으니 비어 있는 구간을 다시 선택해 주세요.',
        )
        return
      }
      const startAt = `${dateYmd}T${pad2(startHour)}:00:00`
      const endAt = exclusiveEndLocalIso(dateYmd, endHour)
      const body: Parameters<typeof createAdminBooking>[0] = {
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        hallId,
        startAt,
        endAt,
        purpose: purpose.trim() || null,
        note: note.trim() || null,
      }
      const hc = headcount.trim()
      if (hc !== '') {
        const n = Number(hc)
        if (!Number.isFinite(n) || n < 1) {
          window.alert('인원은 1 이상의 숫자로 입력하거나 비워 두세요.')
          setSubmitting(false)
          return
        }
        body.headcount = n
      } else {
        body.headcount = null
      }
      await createAdminBooking(body)
      await Promise.resolve(onCreated())
      window.alert('예약이 등록되었습니다.')
      onClose()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const hourCells = useMemo(
    () => Array.from({ length: LAST_SLOT_HOUR - FIRST_SLOT_HOUR + 1 }, (_, i) => FIRST_SLOT_HOUR + i),
    [],
  )

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-booking-create-title"
      onClick={onClose}
    >
      <div className="modal modal--inquiry" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__eyebrow">관리자</span>
          <h2 className="modal__title" id="admin-booking-create-title">
            대리 예약 등록
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>
        <form className="modal__form" onSubmit={e => void handleSubmit(e)}>
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-create-name">
              예약자명
            </label>
            <input
              id="admin-create-name"
              className="modal__input"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              maxLength={50}
              required
              autoComplete="name"
            />
          </div>
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-create-phone">
              연락처
            </label>
            <input
              id="admin-create-phone"
              className="modal__input"
              type="tel"
              value={guestPhone}
              onChange={e => setGuestPhone(e.target.value)}
              maxLength={20}
              required
              autoComplete="tel"
            />
          </div>
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-create-hall">
              호실
            </label>
            <select
              id="admin-create-hall"
              className="admin-select admin-select--modal"
              value={hallId}
              onChange={e => setHallId(e.target.value)}
              required
              disabled={halls.length === 0}
            >
              {halls.length === 0 ? (
                <option value="">홀 데이터가 없습니다</option>
              ) : (
                halls.map(h => (
                  <option key={h.id} value={h.hallId}>
                    {h.name} ({h.hallId})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="modal__field admin-booking-modal__schedule">
            <label className="modal__label" htmlFor="admin-create-date">
              예약일 · 시간 (1시간 단위)
            </label>
            <input
              id="admin-create-date"
              className="modal__input"
              type="date"
              min={todayYmd}
              value={dateYmd}
              onChange={e => setDateYmd(e.target.value)}
              required
            />
            <p className="admin-booking-modal__slot-hint">
              녹색 칸을 눌러 시작 시각을 고른 뒤, 끝 시각 칸을 한 번 더 눌러 구간을 정합니다. 오늘은 이미 지난
              시간은 선택할 수 없습니다.
            </p>
            {avLoading && <p className="modal__hint">일정 불러오는 중…</p>}
            <div className="booking-slot-grid" role="list" aria-label="시간대">
              {hourCells.map(h => {
                const now = new Date()
                const isPast = hourSlotPast(h, dateYmd, now)
                const free = freeByHour[h]
                const inRange = h >= startHour && h < endHour
                const toneClass = isPast ? 'booking-slot--past' : free ? 'booking-slot--free' : 'booking-slot--busy'
                const pickedClass =
                  inRange && free
                    ? 'booking-slot--picked'
                    : inRange && isPast
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
                      {pad2(h)}:00 – {h < LAST_SLOT_HOUR ? `${pad2(h + 1)}:00` : '24:00'}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="admin-booking-modal__selection">
              선택:{' '}
              <strong>
                {dateYmd} {pad2(startHour)}:00 ~ {endHour === 24 ? '24:00' : `${pad2(endHour)}:00`}
              </strong>
              {rangeFirst !== null && (
                <span className="admin-booking-modal__selection-hint"> · 두 번째 칸을 눌러 종료 시각을 정하세요</span>
              )}
            </p>
            {!selectionValid && !avLoading && (
              <p className="modal__hint modal__hint--warn">
                선택한 구간을 쓸 수 없습니다. 과거·예약·블록과 겹치지 않는 녹색 구간만 잡아 주세요.
              </p>
            )}
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-create-headcount">
              인원 <span className="modal__optional">(선택)</span>
            </label>
            <input
              id="admin-create-headcount"
              className="modal__input"
              type="number"
              min={1}
              placeholder="비워 두면 미입력"
              value={headcount}
              onChange={e => setHeadcount(e.target.value)}
            />
          </div>
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-create-purpose">
              용도 <span className="modal__optional">(선택)</span>
            </label>
            <input
              id="admin-create-purpose"
              className="modal__input"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-create-note">
              비고 <span className="modal__optional">(선택)</span>
            </label>
            <input
              id="admin-create-note"
              className="modal__input"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
          <div className="admin-modal-actions">
            <div className="admin-modal-actions__end">
              <button type="button" className="modal__signup" onClick={onClose} disabled={submitting}>
                취소
              </button>
              <button
                type="submit"
                className="modal__submit"
                disabled={submitting || halls.length === 0 || !selectionValid}
              >
                {submitting ? '등록 중…' : '등록'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
