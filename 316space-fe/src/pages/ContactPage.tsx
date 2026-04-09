import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { apiFetchJson, HttpError } from '../api/client'
import {
  createInquiry,
  deleteInquiry,
  fetchInquiries,
  fetchInquiryDetail,
  updateInquiry,
  type InquiryCategory,
  type InquiryDetailDto,
  type InquiryListItemDto,
} from '../api/inquiries'
import { useAuth } from '../auth/AuthContext'

function toInquiryPhone(input: string): string | null {
  const d = input.replace(/\D/g, '')
  if (d.length === 11 && d.startsWith('010')) {
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`
  }
  return null
}

const CATEGORY_OPTIONS: { value: InquiryCategory; label: string }[] = [
  { value: 'BOOKING', label: '예약' },
  { value: 'FACILITY', label: '시설' },
  { value: 'ETC', label: '기타' },
]

const CATEGORY_LABEL: Record<InquiryCategory, string> = {
  BOOKING: '예약',
  FACILITY: '시설',
  ETC: '기타',
}

const PAGE_SIZE = 10

interface MemberProfile {
  loginId: string
  name: string
  email: string | null
  phone: string | null
}

function formatListDateYmd(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return iso
  }
}

function isGuestPost(row: InquiryListItemDto): boolean {
  return row.guestPost === true
}

export default function ContactPage() {
  const inquiryOverlayRef = useRef<HTMLDivElement>(null)
  const detailOverlayRef = useRef<HTMLDivElement>(null)
  const inquiryCategoryRef = useRef<HTMLSelectElement>(null)
  const { isAuthenticated, loginId } = useAuth()

  const [authorName, setAuthorName] = useState('')
  const [authorPhone, setAuthorPhone] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [category, setCategory] = useState<InquiryCategory>(() => CATEGORY_OPTIONS[0].value)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [guestPw, setGuestPw] = useState('')

  const [showWriteForm, setShowWriteForm] = useState(false)
  const [listPage, setListPage] = useState(0)
  const [items, setItems] = useState<InquiryListItemDto[]>([])
  const [listTotalPages, setListTotalPages] = useState(0)
  const [listTotalElements, setListTotalElements] = useState(0)
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [guestPwByInquiryId, setGuestPwByInquiryId] = useState<Record<number, string>>({})

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailRow, setDetailRow] = useState<InquiryListItemDto | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailData, setDetailData] = useState<InquiryDetailDto | null>(null)
  const [detailNeedUnlock, setDetailNeedUnlock] = useState(false)
  const [detailUnlockPw, setDetailUnlockPw] = useState('')
  const [detailEditMode, setDetailEditMode] = useState(false)
  const [editCategory, setEditCategory] = useState<InquiryCategory>('ETC')
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editPrivate, setEditPrivate] = useState(false)
  const [editGuestPw, setEditGuestPw] = useState('')
  const [detailActionLoading, setDetailActionLoading] = useState(false)
  const [detailActionError, setDetailActionError] = useState<string | null>(null)

  const loadList = useCallback(async (page: number) => {
    setListLoading(true)
    setListError(null)
    try {
      const data = await fetchInquiries(page, PAGE_SIZE)
      setItems(data.content ?? [])
      setListTotalPages(data.totalPages ?? 0)
      setListTotalElements(data.totalElements ?? 0)
      setListPage(data.number ?? page)
    } catch (e) {
      setListError(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.')
      setItems([])
      setListTotalPages(0)
      setListTotalElements(0)
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    document.title = 'Contact · 316 SPACE'
  }, [])

  useEffect(() => {
    void loadList(0)
  }, [loadList])

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthorName('')
      setAuthorEmail('')
      setAuthorPhone('')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const data = await apiFetchJson<MemberProfile>('/api/members/me')
        if (cancelled) return
        setAuthorName(data.name ?? '')
        setAuthorEmail(data.email ?? '')
        setAuthorPhone(data.phone?.replace(/\D/g, '') ?? '')
      } catch {
        if (cancelled) return
        // 이전 세션·다른 계정 값이 남지 않게 함 (프로필 조회 실패 시)
        setAuthorName('')
        setAuthorEmail('')
        setAuthorPhone('')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, loginId])

  const closeDetail = useCallback(() => {
    setDetailOpen(false)
    setDetailRow(null)
    setDetailData(null)
    setDetailError(null)
    setDetailNeedUnlock(false)
    setDetailUnlockPw('')
    setDetailEditMode(false)
    setEditGuestPw('')
    setDetailActionError(null)
  }, [])

  const loadDetailForRow = useCallback(
    async (row: InquiryListItemDto, password?: string) => {
      setDetailLoading(true)
      setDetailError(null)
      setDetailNeedUnlock(false)
      setDetailData(null)
      try {
        const needGuestPw = row.isPrivate && isGuestPost(row)
        const stored = password ?? guestPwByInquiryId[row.id]
        const d = await fetchInquiryDetail(row.id, needGuestPw ? stored : undefined)
        setDetailData(d)
        if (needGuestPw && stored) {
          setGuestPwByInquiryId(prev => ({ ...prev, [row.id]: stored }))
        }
      } catch (e) {
        if (e instanceof HttpError && e.status === 403) {
          if (row.isPrivate && isGuestPost(row)) {
            setDetailNeedUnlock(true)
            setDetailError(e.message)
          } else if (row.isPrivate) {
            setDetailError('로그인한 계정으로 본인 글만 볼 수 있습니다.')
          } else {
            setDetailError(e.message)
          }
        } else {
          setDetailError(e instanceof Error ? e.message : '불러오지 못했습니다.')
        }
      } finally {
        setDetailLoading(false)
      }
    },
    [guestPwByInquiryId],
  )

  const openDetail = useCallback(
    (row: InquiryListItemDto) => {
      setDetailOpen(true)
      setDetailRow(row)
      setDetailUnlockPw('')
      setDetailEditMode(false)
      setDetailActionError(null)
      void loadDetailForRow(row)
    },
    [loadDetailForRow],
  )

  const confirmDetailUnlock = useCallback(() => {
    if (!detailRow || !detailUnlockPw) return
    void loadDetailForRow(detailRow, detailUnlockPw)
  }, [detailRow, detailUnlockPw, loadDetailForRow])

  const startEdit = useCallback(() => {
    if (!detailData) return
    setDetailEditMode(true)
    setEditCategory(detailData.category)
    setEditTitle(detailData.title)
    setEditContent(detailData.content)
    setEditPrivate(detailData.isPrivate)
    setEditGuestPw('')
    setDetailActionError(null)
  }, [detailData])

  const cancelEdit = useCallback(() => {
    setDetailEditMode(false)
    setEditGuestPw('')
    setDetailActionError(null)
  }, [])

  const saveEdit = useCallback(async () => {
    if (!detailData || !detailRow) return
    const t = editTitle.trim()
    const c = editContent.trim()
    if (!t || !c) {
      setDetailActionError('제목과 내용을 입력해 주세요.')
      return
    }
    const guestHeader =
      detailData.guestPost ? (guestPwByInquiryId[detailRow.id] ?? editGuestPw) : undefined
    if (detailData.guestPost && (!guestHeader || guestHeader === '')) {
      setDetailActionError('수정하려면 비밀번호를 입력해 주세요.')
      return
    }
    setDetailActionLoading(true)
    setDetailActionError(null)
    try {
      const updated = await updateInquiry(
        detailRow.id,
        { category: editCategory, title: t, content: c, isPrivate: editPrivate },
        detailData.guestPost ? guestHeader : undefined,
      )
      setDetailData(updated)
      if (detailData.guestPost && editGuestPw) {
        setGuestPwByInquiryId(prev => ({ ...prev, [detailRow.id]: editGuestPw }))
      }
      setDetailEditMode(false)
      await loadList(listPage)
    } catch (e) {
      setDetailActionError(e instanceof Error ? e.message : '저장에 실패했습니다.')
    } finally {
      setDetailActionLoading(false)
    }
  }, [
    detailData,
    detailRow,
    editTitle,
    editContent,
    editCategory,
    editPrivate,
    editGuestPw,
    guestPwByInquiryId,
    loadList,
    listPage,
  ])

  const confirmDelete = useCallback(async () => {
    if (!detailData || !detailRow) return
    if (!window.confirm('이 문의를 삭제할까요?')) return
    const guestHeader =
      detailData.guestPost ? (guestPwByInquiryId[detailRow.id] ?? editGuestPw) : undefined
    if (detailData.guestPost && (!guestHeader || guestHeader === '')) {
      setDetailActionError('삭제하려면 비밀번호를 입력해 주세요.')
      return
    }
    setDetailActionLoading(true)
    setDetailActionError(null)
    try {
      await deleteInquiry(detailRow.id, detailData.guestPost ? guestHeader : undefined)
      setGuestPwByInquiryId(prev => {
        const next = { ...prev }
        delete next[detailRow.id]
        return next
      })
      closeDetail()
      await loadList(listPage)
    } catch (e) {
      setDetailActionError(e instanceof Error ? e.message : '삭제에 실패했습니다.')
    } finally {
      setDetailActionLoading(false)
    }
  }, [detailData, detailRow, editGuestPw, guestPwByInquiryId, closeDetail, loadList, listPage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const nameT = authorName.trim()
    const titleT = title.trim()
    const contentT = content.trim()
    if (!nameT || !titleT || !contentT) {
      setSubmitError('이름, 제목, 문의 내용을 모두 입력해 주세요.')
      return
    }

    if (!isAuthenticated) {
      if (guestPw.length < 4) {
        setSubmitError('비회원 문의 비밀번호는 4자 이상 입력해 주세요.')
        return
      }
      if (guestPw.length > 72) {
        setSubmitError('비밀번호는 72자 이하여야 합니다.')
        return
      }
    }

    const phoneDigits = authorPhone.replace(/\D/g, '')
    let phonePayload: string | null = null
    if (phoneDigits.length > 0) {
      const formatted = toInquiryPhone(authorPhone)
      if (!formatted) {
        setSubmitError('휴대전화는 010으로 시작하는 11자리 숫자로 입력해 주세요.')
        return
      }
      phonePayload = formatted
    }

    const emailT = authorEmail.trim()
    if (emailT && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailT)) {
      setSubmitError('이메일 형식을 확인해 주세요.')
      return
    }

    const guestPwToStore = guestPw
    setSubmitting(true)
    try {
      const res = await createInquiry({
        authorName: nameT,
        authorPhone: phonePayload,
        authorEmail: emailT || null,
        category,
        title: titleT,
        content: contentT,
        isPrivate,
        guestPassword: isAuthenticated ? null : guestPwToStore,
      })
      setCategory(CATEGORY_OPTIONS[0].value)
      setTitle('')
      setContent('')
      setIsPrivate(false)
      setGuestPw('')
      setShowWriteForm(false)
      if (!isAuthenticated && res.guestPost) {
        setGuestPwByInquiryId(prev => ({ ...prev, [res.id]: guestPwToStore }))
      }
      await loadList(0)
      setListPage(0)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '전송에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const openWriteForm = useCallback(() => {
    setShowWriteForm(true)
    setSubmitError(null)
  }, [])

  const closeWriteForm = useCallback(() => {
    setShowWriteForm(false)
    setSubmitError(null)
  }, [])

  const modalOpen = showWriteForm || detailOpen

  useEffect(() => {
    if (!modalOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (detailOpen) closeDetail()
        else closeWriteForm()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [modalOpen, showWriteForm, detailOpen, closeWriteForm, closeDetail])

  useEffect(() => {
    if (!showWriteForm) return
    const t = window.setTimeout(() => inquiryCategoryRef.current?.focus(), 0)
    return () => window.clearTimeout(t)
  }, [showWriteForm])

  const handleInquiryOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === inquiryOverlayRef.current) closeWriteForm()
  }

  const handleDetailOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === detailOverlayRef.current) closeDetail()
  }

  const inquiryModal =
    showWriteForm &&
    createPortal(
      <div
        ref={inquiryOverlayRef}
        className="modal-overlay"
        role="presentation"
        onMouseDown={handleInquiryOverlayMouseDown}
      >
        <div
          className="modal modal--inquiry"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inquiry-modal-title"
          onMouseDown={e => e.stopPropagation()}
        >
          <button type="button" className="modal__close" onClick={closeWriteForm} aria-label="닫기">
            ×
          </button>
          <header className="modal__header contact-inquiry-modal__header">
            <h2 id="inquiry-modal-title" className="modal__title contact-inquiry-modal__title">
              문의 작성
            </h2>
          </header>

          <form
            className="contact-inquiry-modal__form contact-inquiry-modal__form--stacked"
            onSubmit={e => void handleSubmit(e)}
          >
            {submitError && <p className="booking-banner booking-banner--error">{submitError}</p>}

            {!isAuthenticated && (
              <p className="contact-inquiry-modal__hint">
                비회원은 비밀번호가 필요합니다. 비공개 글 조회·수정·삭제 시 사용합니다.
              </p>
            )}

            <div className="booking-field contact-inquiry-modal__field-narrow">
              <label className="booking-label" htmlFor="inquiry-modal-category">
                분류
              </label>
              <select
                ref={inquiryCategoryRef}
                id="inquiry-modal-category"
                className="booking-input"
                value={category}
                onChange={e => setCategory(e.target.value as InquiryCategory)}
              >
                {CATEGORY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="booking-field contact-inquiry-modal__field-narrow">
              <label className="booking-label" htmlFor="inquiry-modal-name">
                이름
              </label>
              <input
                id="inquiry-modal-name"
                className="booking-input"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                maxLength={50}
                autoComplete="off"
                required
              />
            </div>

            {!isAuthenticated && (
              <div className="booking-field contact-inquiry-modal__field-narrow">
                <label className="booking-label" htmlFor="inquiry-modal-guest-pw">
                  비밀번호
                </label>
                <input
                  id="inquiry-modal-guest-pw"
                  className="booking-input"
                  type="password"
                  autoComplete="new-password"
                  value={guestPw}
                  onChange={e => setGuestPw(e.target.value)}
                  minLength={4}
                  maxLength={72}
                  required
                />
              </div>
            )}

            <div className="booking-field contact-inquiry-modal__field-narrow">
              <label className="booking-label" htmlFor="inquiry-modal-phone">
                휴대전화 (선택)
              </label>
              <input
                id="inquiry-modal-phone"
                className="booking-input"
                inputMode="numeric"
                placeholder="01012345678"
                value={authorPhone}
                onChange={e => setAuthorPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>

            <div className="booking-field contact-inquiry-modal__field-narrow">
              <label className="booking-label" htmlFor="inquiry-modal-email">
                이메일 (선택)
              </label>
              <input
                id="inquiry-modal-email"
                className="booking-input"
                type="email"
                value={authorEmail}
                onChange={e => setAuthorEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="booking-field booking-field--full">
              <label className="booking-label" htmlFor="inquiry-modal-title-input">
                제목
              </label>
              <input
                id="inquiry-modal-title-input"
                className="booking-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={200}
                required
              />
            </div>

            <div className="booking-field booking-field--full">
              <label className="booking-label" htmlFor="inquiry-modal-content">
                문의 내용
              </label>
              <textarea
                id="inquiry-modal-content"
                className="booking-input booking-textarea"
                rows={5}
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
            </div>

            <div className="booking-field booking-field--full">
              <label className="contact-checkbox">
                <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
                <span>비공개 문의 (목록에서는 제목이 마스킹됩니다)</span>
              </label>
            </div>

            <div className="contact-inquiry-modal__actions">
              <button type="button" className="contact-inquiry-modal__cancel" onClick={closeWriteForm}>
                취소
              </button>
              <button type="submit" className="booking-submit contact-inquiry-modal__submit" disabled={submitting}>
                {submitting ? '전송 중…' : '문의 보내기'}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body,
    )

  const detailModal =
    detailOpen &&
    detailRow &&
    createPortal(
      <div
        ref={detailOverlayRef}
        className="modal-overlay"
        role="presentation"
        onMouseDown={handleDetailOverlayMouseDown}
      >
        <div
          className="modal modal--inquiry modal--inquiry-detail"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inquiry-detail-title"
          onMouseDown={e => e.stopPropagation()}
        >
          <button type="button" className="modal__close" onClick={closeDetail} aria-label="닫기">
            ×
          </button>
          <header className="modal__header contact-inquiry-modal__header">
            <h2 id="inquiry-detail-title" className="modal__title contact-inquiry-modal__title">
              문의 상세
            </h2>
          </header>

          <div className="contact-inquiry-detail__body">
            {detailLoading && <p className="contact-inquiry-board__loading">불러오는 중…</p>}

            {!detailLoading && detailNeedUnlock && !detailData && (
              <div className="contact-inquiry-detail__unlock">
                <p className="booking-banner booking-banner--error">{detailError}</p>
                <div className="booking-field">
                  <label className="booking-label" htmlFor="inquiry-detail-unlock-pw">
                    비밀번호
                  </label>
                  <input
                    id="inquiry-detail-unlock-pw"
                    className="booking-input"
                    type="password"
                    autoComplete="current-password"
                    value={detailUnlockPw}
                    onChange={e => setDetailUnlockPw(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        confirmDetailUnlock()
                      }
                    }}
                  />
                </div>
                <div className="contact-inquiry-modal__actions">
                  <button type="button" className="contact-inquiry-modal__cancel" onClick={closeDetail}>
                    닫기
                  </button>
                  <button type="button" className="booking-submit contact-inquiry-modal__submit" onClick={confirmDetailUnlock}>
                    확인
                  </button>
                </div>
              </div>
            )}

            {!detailLoading && detailError && !detailNeedUnlock && (
              <p className="booking-banner booking-banner--error">{detailError}</p>
            )}

            {!detailLoading && detailData && !detailEditMode && (
              <div className="contact-inquiry-detail__view">
                <p className="contact-inquiry-detail__meta">
                  [{CATEGORY_LABEL[detailData.category]}] · {detailData.authorName} ·{' '}
                  {formatListDateYmd(detailData.createdAt)}
                  {detailData.isPrivate && ' · 비공개'}
                </p>
                <div className="contact-inquiry-detail__subject-row">
                  <h3 className="contact-inquiry-detail__subject">{detailData.title}</h3>
                  {detailData.status === 'ANSWERED' && (
                    <span className="contact-inquiry-board__status-tag contact-inquiry-board__status-tag--answered">
                      답변완료
                    </span>
                  )}
                </div>
                <div className="contact-inquiry-detail__content">{detailData.content}</div>
                {detailData.answer && (
                  <div className="contact-inquiry-detail__answer">
                    <strong>답변</strong>
                    <p>{detailData.answer.content}</p>
                  </div>
                )}
                {detailActionError && <p className="booking-banner booking-banner--error">{detailActionError}</p>}
                {detailData.canEdit && (
                  <div className="contact-inquiry-detail__toolbar">
                    {detailData.guestPost && (
                      <div className="booking-field booking-field--full">
                        <label className="booking-label" htmlFor="inquiry-detail-action-pw">
                          비밀번호
                        </label>
                        <input
                          id="inquiry-detail-action-pw"
                          className="booking-input"
                          type="password"
                          autoComplete="current-password"
                          value={editGuestPw}
                          onChange={e => setEditGuestPw(e.target.value)}
                          placeholder={
                            guestPwByInquiryId[detailRow.id] ? '저장된 값이 있으면 비워도 됩니다' : '비밀번호'
                          }
                        />
                      </div>
                    )}
                    <div className="contact-inquiry-modal__actions">
                      <button
                        type="button"
                        className="contact-inquiry-modal__cancel"
                        onClick={() => void confirmDelete()}
                        disabled={detailActionLoading}
                      >
                        삭제
                      </button>
                      <button
                        type="button"
                        className="booking-submit contact-inquiry-modal__submit"
                        onClick={startEdit}
                        disabled={detailActionLoading}
                      >
                        수정
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!detailLoading && detailData && detailEditMode && (
              <form
                className="contact-inquiry-modal__form"
                onSubmit={e => {
                  e.preventDefault()
                  void saveEdit()
                }}
              >
                {detailActionError && <p className="booking-banner booking-banner--error">{detailActionError}</p>}
                <div className="booking-field">
                  <label className="booking-label" htmlFor="inquiry-edit-category">
                    분류
                  </label>
                  <select
                    id="inquiry-edit-category"
                    className="booking-input"
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value as InquiryCategory)}
                  >
                    {CATEGORY_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="booking-field booking-field--full">
                  <label className="booking-label" htmlFor="inquiry-edit-title">
                    제목
                  </label>
                  <input
                    id="inquiry-edit-title"
                    className="booking-input"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    maxLength={200}
                    required
                  />
                </div>
                <div className="booking-field booking-field--full">
                  <label className="booking-label" htmlFor="inquiry-edit-content">
                    내용
                  </label>
                  <textarea
                    id="inquiry-edit-content"
                    className="booking-input booking-textarea"
                    rows={5}
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    required
                  />
                </div>
                <div className="booking-field booking-field--full">
                  <label className="contact-checkbox">
                    <input type="checkbox" checked={editPrivate} onChange={e => setEditPrivate(e.target.checked)} />
                    <span>비공개</span>
                  </label>
                </div>
                {detailData.guestPost && (
                  <div className="booking-field booking-field--full">
                    <label className="booking-label" htmlFor="inquiry-edit-pw">
                      비밀번호
                    </label>
                    <input
                      id="inquiry-edit-pw"
                      className="booking-input"
                      type="password"
                      value={editGuestPw}
                      onChange={e => setEditGuestPw(e.target.value)}
                      placeholder={
                        guestPwByInquiryId[detailRow.id] ? '저장된 값이 있으면 비워도 됩니다' : '비밀번호'
                      }
                    />
                  </div>
                )}
                <div className="contact-inquiry-modal__actions">
                  <button type="button" className="contact-inquiry-modal__cancel" onClick={cancelEdit} disabled={detailActionLoading}>
                    취소
                  </button>
                  <button type="submit" className="booking-submit contact-inquiry-modal__submit" disabled={detailActionLoading}>
                    {detailActionLoading ? '저장 중…' : '저장'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>,
      document.body,
    )

  return (
    <main className="page-document">
      <header className="page-document__hero">
        <h1 className="page-document__title">Contact</h1>
        <p className="page-document__lead">운영 정보 · 연락처</p>
      </header>

      <section className="contact-block" aria-labelledby="hours-heading">
        <h2 id="hours-heading" className="page-document__section-title">
          운영 시간
        </h2>
        <p className="page-document__prose">
          24시간 연중무휴(시설 기준). 세부 휴무·점검 일정은 추후 이곳에 반영해 주세요.
        </p>
      </section>

      <section className="contact-block" aria-labelledby="reach-heading">
        <h2 id="reach-heading" className="page-document__section-title">
          연락처
        </h2>
        <ul className="page-document__bullets">
          <li>전화: 010-5746-8376</li>
          <li>카카오채널 / 인스타그램: (실제 계정으로 교체)</li>
          <li className="contact-address-item">
            <div className="contact-address-item__inner">
              <span className="contact-address-item__label">주소 :</span>
              <div className="contact-address-item__lines">
                <div className="contact-address-item__row">
                  <span className="contact-address-tag">도로명</span>
                  <span className="contact-address-item__addr">
                    서울 서초구 서초중앙로24길 10 지하2층
                  </span>
                </div>
                <div className="contact-address-item__row">
                  <span className="contact-address-tag">지번</span>
                  <span className="contact-address-item__addr">서울 서초구 서초동 1692-3</span>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <section className="contact-block" aria-labelledby="inquiry-heading">
        <h2 id="inquiry-heading" className="page-document__section-title">
          문의
        </h2>

        {listLoading ? (
          <p className="contact-inquiry-board__loading">목록을 불러오는 중…</p>
        ) : listError ? (
          <p className="contact-inquiry-board__error">{listError}</p>
        ) : (
          <div className="contact-inquiry-board-wrap">
            <table className="contact-inquiry-board" aria-label="문의 게시판">
              <thead>
                <tr>
                  <th scope="col" className="contact-inquiry-board__th contact-inquiry-board__th--num">
                    번호
                  </th>
                  <th scope="col" className="contact-inquiry-board__th contact-inquiry-board__th--title">
                    제목
                  </th>
                  <th scope="col" className="contact-inquiry-board__th contact-inquiry-board__th--author">
                    글쓴이
                  </th>
                  <th scope="col" className="contact-inquiry-board__th contact-inquiry-board__th--date">
                    작성일
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="contact-inquiry-board__empty">
                      등록된 문의가 없습니다.
                    </td>
                  </tr>
                ) : (
                  items.map((row, idx) => {
                    const no =
                      listTotalElements > 0
                        ? listTotalElements - listPage * PAGE_SIZE - idx
                        : idx + 1
                    return (
                      <tr key={row.id}>
                        <td className="contact-inquiry-board__td contact-inquiry-board__td--num">{no}</td>
                        <td className="contact-inquiry-board__td contact-inquiry-board__td--title">
                          <div className="contact-inquiry-board__title-cell">
                            <button
                              type="button"
                              className="contact-inquiry-board__title-trigger"
                              onClick={() => openDetail(row)}
                              aria-label={`${row.title} 내용 보기`}
                            >
                              <span className="contact-inquiry-board__title-main">
                                <span className="contact-inquiry-board__prefix">[{CATEGORY_LABEL[row.category]}]</span>
                                {row.isPrivate && (
                                  <span className="contact-inquiry-board__lock" title="비공개" aria-hidden>
                                    🔒
                                  </span>
                                )}
                                <span className="contact-inquiry-board__title-text">{row.title}</span>
                              </span>
                            </button>
                            {row.status === 'ANSWERED' && (
                              <span className="contact-inquiry-board__status-tag contact-inquiry-board__status-tag--answered">
                                답변완료
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="contact-inquiry-board__td contact-inquiry-board__td--author">{row.authorName}</td>
                        <td className="contact-inquiry-board__td contact-inquiry-board__td--date">
                          {formatListDateYmd(row.createdAt)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {!listLoading && !listError && listTotalPages > 1 && (
          <div className="contact-inquiry-pager contact-inquiry-pager--center">
            <button
              type="button"
              disabled={listPage <= 0}
              onClick={() => {
                const p = Math.max(0, listPage - 1)
                void loadList(p)
              }}
            >
              이전
            </button>
            <span>
              {listPage + 1} / {listTotalPages}
            </span>
            <button
              type="button"
              disabled={listPage >= listTotalPages - 1}
              onClick={() => {
                const p = Math.min(listTotalPages - 1, listPage + 1)
                void loadList(p)
              }}
            >
              다음
            </button>
          </div>
        )}

        <div className="contact-inquiry-toolbar contact-inquiry-toolbar--end">
          <button type="button" className="contact-inquiry-write-btn" onClick={openWriteForm}>
            글쓰기
          </button>
        </div>

        {inquiryModal}
        {detailModal}
      </section>
    </main>
  )
}
