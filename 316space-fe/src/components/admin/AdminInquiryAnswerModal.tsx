import { useEffect, useRef, useState } from 'react'
import { adminPatchInquiryAnswer, adminPostInquiryAnswer } from '../../api/adminInquiries'
import { fetchInquiryDetail, type InquiryCategory, type InquiryDetailDto } from '../../api/inquiries'

const CATEGORY_LABEL: Record<InquiryCategory, string> = {
  BOOKING: '예약',
  FACILITY: '시설',
  ETC: '기타',
}

function formatDt(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

interface AdminInquiryAnswerModalProps {
  inquiryId: number
  onClose: () => void
  onSaved: () => void
}

export default function AdminInquiryAnswerModal({ inquiryId, onClose, onSaved }: AdminInquiryAnswerModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const [detail, setDetail] = useState<InquiryDetailDto | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [answerText, setAnswerText] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const d = await fetchInquiryDetail(inquiryId)
        if (cancelled) return
        setDetail(d)
        setAnswerText(d.answer?.content ?? '')
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : '불러오지 못했습니다.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [inquiryId])

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
    const t = answerText.trim()
    if (!t) {
      setSubmitError('답변 내용을 입력해 주세요.')
      return
    }
    setSubmitError(null)
    setSubmitting(true)
    try {
      if (detail?.answer) {
        await adminPatchInquiryAnswer(inquiryId, t)
      } else {
        await adminPostInquiryAnswer(inquiryId, t)
      }
      onSaved()
      onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-inquiry-answer-title">
      <div className="modal modal--inquiry modal--inquiry-detail">
        <button ref={closeBtnRef} type="button" className="modal__close" onClick={onClose} aria-label="닫기">
          ×
        </button>
        <div className="modal__header contact-inquiry-modal__header">
          <span className="modal__eyebrow">문의 관리</span>
          <h2 className="modal__title contact-inquiry-modal__title" id="admin-inquiry-answer-title">
            답변 {detail?.answer ? '수정' : '작성'}
          </h2>
        </div>

        {loading && <p className="contact-inquiry-board__loading">불러오는 중…</p>}
        {loadError && <p className="booking-banner booking-banner--error">{loadError}</p>}

        {!loading && detail && (
          <form className="contact-inquiry-modal__form" onSubmit={e => void handleSubmit(e)}>
            <p className="contact-inquiry-detail__meta" style={{ marginBottom: '0.75rem' }}>
              #{detail.id} · [{CATEGORY_LABEL[detail.category]}] · {detail.authorName}
              {detail.guestPost ? ' · 비회원' : ' · 회원'}
              {detail.isPrivate ? ' · 비공개' : ''} · 접수 {formatDt(detail.createdAt)}
            </p>
            <h3 className="contact-inquiry-detail__subject" style={{ marginBottom: '0.5rem' }}>
              {detail.title}
            </h3>
            <div className="contact-inquiry-detail__content" style={{ marginBottom: '1rem' }}>
              {detail.content}
            </div>

            <div className="booking-field booking-field--full">
              <label className="booking-label" htmlFor="admin-inquiry-answer-body">
                관리자 답변
              </label>
              <textarea
                id="admin-inquiry-answer-body"
                className="booking-input booking-textarea"
                rows={6}
                value={answerText}
                onChange={e => setAnswerText(e.target.value)}
                required
              />
            </div>

            {submitError && <p className="booking-banner booking-banner--error">{submitError}</p>}

            <div className="admin-modal-actions">
              <button type="button" className="contact-inquiry-modal__cancel" onClick={onClose}>
                닫기
              </button>
              <button type="submit" className="modal__submit" disabled={submitting}>
                {submitting ? '저장 중…' : detail.answer ? '답변 수정' : '답변 등록'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
