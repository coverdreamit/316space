import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createAdminBooking } from '../../api/adminBookings'
import { type HallAdminDto } from '../../api/adminHalls'

function toIsoDateTime(local: string): string {
  if (!local) return ''
  return local.length === 16 ? `${local}:00` : local
}

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
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [headcount, setHeadcount] = useState('')
  const [purpose, setPurpose] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body: Parameters<typeof createAdminBooking>[0] = {
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        hallId,
        startAt: toIsoDateTime(start),
        endAt: toIsoDateTime(end),
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
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-create-start">
              시작
            </label>
            <input
              id="admin-create-start"
              className="modal__input"
              type="datetime-local"
              value={start}
              onChange={e => setStart(e.target.value)}
              required
            />
          </div>
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-create-end">
              종료
            </label>
            <input
              id="admin-create-end"
              className="modal__input"
              type="datetime-local"
              value={end}
              onChange={e => setEnd(e.target.value)}
              required
            />
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
              <button type="submit" className="modal__submit" disabled={submitting || halls.length === 0}>
                {submitting ? '등록 중…' : '등록'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
