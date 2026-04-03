import { useEffect, useRef, useState } from 'react'
import {
  createAdminScheduleBlock,
  updateAdminScheduleBlock,
  type ScheduleBlockUpsertBody,
} from '../../api/adminScheduleBlocks'
import {
  type ScheduleBlockDto,
  type ScheduleBlockType,
  SCHEDULE_BLOCK_TYPE_LABEL,
} from '../../api/bookingCalendar'

const BLOCK_TYPES = Object.keys(SCHEDULE_BLOCK_TYPE_LABEL) as ScheduleBlockType[]

function toDatetimeLocalValue(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return iso.length >= 16 ? iso.slice(0, 16) : iso
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toLocalDateTimeParam(value: string): string {
  if (!value) return value
  return value.length === 16 ? `${value}:00` : value
}

interface AdminScheduleBlockModalProps {
  block: ScheduleBlockDto | null
  onClose: () => void
  onSaved: () => void
}

export default function AdminScheduleBlockModal({ block, onClose, onSaved }: AdminScheduleBlockModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const isEdit = block != null
  const [hallId, setHallId] = useState(block?.hallId ?? '')
  const [startAt, setStartAt] = useState(() => (block ? toDatetimeLocalValue(block.startAt) : ''))
  const [endAt, setEndAt] = useState(() => (block ? toDatetimeLocalValue(block.endAt) : ''))
  const [blockType, setBlockType] = useState<ScheduleBlockType>(block?.blockType ?? 'CLEANING')
  const [title, setTitle] = useState(block?.title ?? '')
  const [note, setNote] = useState(block?.note ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    closeBtnRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const start = toLocalDateTimeParam(startAt)
    const end = toLocalDateTimeParam(endAt)
    if (!hallId.trim()) {
      setError('호실 코드를 입력해 주세요.')
      return
    }
    if (!start || !end) {
      setError('시작·종료 일시를 입력해 주세요.')
      return
    }
    if (new Date(end) <= new Date(start)) {
      setError('종료 일시는 시작 일시보다 늦어야 합니다.')
      return
    }

    const body: ScheduleBlockUpsertBody = {
      hallId: hallId.trim(),
      startAt: start,
      endAt: end,
      blockType,
      title: title.trim() === '' ? null : title.trim(),
      note: note.trim() === '' ? null : note.trim(),
    }

    setSaving(true)
    try {
      if (isEdit && block) {
        await updateAdminScheduleBlock(block.id, body)
      } else {
        await createAdminScheduleBlock(body)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-schedule-block-title"
    >
      <div className="modal">
        <div className="modal__header">
          <span className="modal__eyebrow">관리자</span>
          <h2 className="modal__title" id="admin-schedule-block-title">
            {isEdit ? '스케줄 블록 수정' : '스케줄 블록 추가'}
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
          {error && <p className="admin-banner admin-banner--error">{error}</p>}
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-block-hall">
              호실 코드 (hallId)
            </label>
            <input
              id="admin-block-hall"
              className="modal__input"
              value={hallId}
              onChange={e => setHallId(e.target.value)}
              placeholder="예: A"
              maxLength={30}
              required
            />
          </div>
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-block-type">
              구분
            </label>
            <select
              id="admin-block-type"
              className="modal__input admin-select--modal"
              value={blockType}
              onChange={e => setBlockType(e.target.value as ScheduleBlockType)}
            >
              {BLOCK_TYPES.map(t => (
                <option key={t} value={t}>
                  {SCHEDULE_BLOCK_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-block-start">
              시작 일시
            </label>
            <input
              id="admin-block-start"
              className="modal__input"
              type="datetime-local"
              value={startAt}
              onChange={e => setStartAt(e.target.value)}
              required
            />
          </div>
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-block-end">
              종료 일시
            </label>
            <input
              id="admin-block-end"
              className="modal__input"
              type="datetime-local"
              value={endAt}
              onChange={e => setEndAt(e.target.value)}
              required
            />
          </div>
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-block-title">
              제목 (선택)
            </label>
            <input
              id="admin-block-title"
              className="modal__input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="modal__field">
            <label className="modal__label" htmlFor="admin-block-note">
              메모 (선택)
            </label>
            <textarea
              id="admin-block-note"
              className="modal__input"
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={5000}
            />
          </div>
          <div className="admin-modal-actions">
            <button type="button" className="modal__cancel" onClick={onClose} disabled={saving}>
              취소
            </button>
            <button type="submit" className="modal__submit" disabled={saving}>
              {saving ? '저장 중…' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
