import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchHalls, type HallListItem } from '../api/halls'
import {
  cancelMemberBooking,
  fetchMyBookingUsage,
  fetchMyBookings,
} from '../api/memberBookings'
import { apiFetchJson } from '../api/client'
import { BOOKING_STATUS_LABEL, type BookingDto } from '../api/bookingCalendar'

interface MemberProfile {
  loginId: string
  name: string
  email: string | null
  phone: string | null
}

function formatUsageMinutes(total: number): string {
  if (total <= 0) return '0분'
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}분`
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}

function formatRange(startIso: string, endIso: string): string {
  const s = new Date(startIso)
  const e = new Date(endIso)
  const dOpts: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }
  const tOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
  return `${s.toLocaleDateString('ko-KR', dOpts)} ${s.toLocaleTimeString('ko-KR', tOpts)} – ${e.toLocaleTimeString('ko-KR', tOpts)}`
}

function isActiveBooking(b: BookingDto): boolean {
  return b.status !== 'CANCELLED'
}

/** 지난 예약만 미리보기 한도(렌더·DOM 부담). 다가오는 일정은 취소 등을 위해 전부 표시(스크롤). */
const PAST_PREVIEW_LIMIT = 80

export interface AccountModalProps {
  onClose: () => void
  onRequestProfileEdit: () => void
}

export default function AccountModal({ onClose, onRequestProfileEdit }: AccountModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [bookings, setBookings] = useState<BookingDto[]>([])
  const [usageMinutes, setUsageMinutes] = useState(0)
  const [halls, setHalls] = useState<HallListItem[]>([])
  const [cancellingNo, setCancellingNo] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const [p, list, usage, hallList] = await Promise.all([
        apiFetchJson<MemberProfile>('/api/members/me'),
        fetchMyBookings(),
        fetchMyBookingUsage(),
        fetchHalls(),
      ])
      setProfile(p)
      setBookings(list)
      setUsageMinutes(usage.totalUsageMinutes ?? 0)
      setHalls(hallList)
    } catch (e) {
      setError(e instanceof Error ? e.message : '불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const hallNameById = useMemo(() => {
    const m = new Map<string, string>()
    for (const h of halls) m.set(h.hallId, h.name)
    return m
  }, [halls])

  const { upcoming, past } = useMemo(() => {
    const now = Date.now()
    const up: BookingDto[] = []
    const pa: BookingDto[] = []
    for (const b of bookings) {
      const end = new Date(b.endAt).getTime()
      if (isActiveBooking(b) && end >= now) up.push(b)
      else pa.push(b)
    }
    up.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    pa.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
    return { upcoming: up, past: pa }
  }, [bookings])

  const visiblePast =
    past.length <= PAST_PREVIEW_LIMIT ? past : past.slice(0, PAST_PREVIEW_LIMIT)
  const pastHiddenCount = past.length - visiblePast.length

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose()
  }

  const handleCancel = async (b: BookingDto) => {
    if (cancellingNo) return
    if (!window.confirm(`예약 ${b.bookingNo}을(를) 취소할까요?`)) return
    setCancellingNo(b.bookingNo)
    try {
      await cancelMemberBooking(b.bookingNo)
      await load()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '취소에 실패했습니다.')
    } finally {
      setCancellingNo(null)
    }
  }

  const canCancel = (b: BookingDto) => {
    if (!isActiveBooking(b)) return false
    return new Date(b.endAt).getTime() >= Date.now()
  }

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="내 정보"
    >
      <div className="modal modal--signup modal--account">
        <div className="modal__header">
          <span className="modal__eyebrow">316스페이스</span>
          <h2 className="modal__title">내 정보</h2>
        </div>

        {loading && <p className="modal__form">불러오는 중…</p>}
        {error && (
          <div className="modal__form">
            <p className="modal__error modal__error--banner">{error}</p>
            <button type="button" className="modal__submit modal__submit--secondary" onClick={() => void load()}>
              다시 시도
            </button>
          </div>
        )}

        {!loading && !error && profile && (
          <div className="account-modal__body">
            <section className="account-modal__section" aria-labelledby="account-profile-heading">
              <h3 id="account-profile-heading" className="account-modal__section-title">
                프로필
              </h3>
              <dl className="account-modal__dl">
                <div>
                  <dt>아이디</dt>
                  <dd>{profile.loginId}</dd>
                </div>
                <div>
                  <dt>이름</dt>
                  <dd>{profile.name}</dd>
                </div>
                <div>
                  <dt>이메일</dt>
                  <dd>{profile.email?.trim() ? profile.email : '—'}</dd>
                </div>
                <div>
                  <dt>휴대폰</dt>
                  <dd>{profile.phone?.trim() ? profile.phone : '—'}</dd>
                </div>
              </dl>
              <button type="button" className="modal__submit account-modal__profile-edit" onClick={onRequestProfileEdit}>
                개인정보 변경
              </button>
            </section>

            <section className="account-modal__section" aria-labelledby="account-usage-heading">
              <h3 id="account-usage-heading" className="account-modal__section-title">
                누적 이용 시간
              </h3>
              <p className="account-modal__usage-value">{formatUsageMinutes(usageMinutes)}</p>
              <p className="modal__hint account-modal__hint">
                관리자 확정 후, 이용 종료 시각이 지난 예약만 합산합니다.
              </p>
            </section>

            <section className="account-modal__section" aria-labelledby="account-upcoming-heading">
              <div className="account-modal__section-head">
                <h3 id="account-upcoming-heading" className="account-modal__section-title">
                  다가오는 일정
                </h3>
                <Link to="/booking" className="account-modal__text-link" onClick={onClose}>
                  새 예약
                </Link>
              </div>
              {upcoming.length === 0 ? (
                <p className="account-modal__empty">예정된 예약이 없습니다.</p>
              ) : (
                <>
                  <p className="account-modal__list-meta">총 {upcoming.length}건</p>
                  <div
                    className="account-modal__list-scroll"
                    role="region"
                    aria-label="다가오는 예약 목록"
                    tabIndex={0}
                  >
                    <ul className="account-modal__list">
                      {upcoming.map(b => (
                        <li key={b.bookingNo} className="account-modal__card">
                          <div className="account-modal__card-main">
                            <span className="account-modal__hall">
                              {hallNameById.get(b.hallId) ?? b.hallId}
                            </span>
                            <span className="account-modal__time">{formatRange(b.startAt, b.endAt)}</span>
                            <span className="account-modal__meta">
                              {BOOKING_STATUS_LABEL[b.status]} · {b.bookingNo}
                            </span>
                          </div>
                          <div className="account-modal__card-actions">
                            {canCancel(b) && (
                              <button
                                type="button"
                                className="account-modal__btn-danger"
                                disabled={cancellingNo === b.bookingNo}
                                onClick={() => void handleCancel(b)}
                              >
                                {cancellingNo === b.bookingNo ? '취소 중…' : '예약 취소'}
                              </button>
                            )}
                          </div>
                          <p className="modal__hint account-modal__change-hint">
                            일정 변경은 예약 취소 후 새로 예약해 주세요.
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </section>

            <section className="account-modal__section" aria-labelledby="account-past-heading">
              <h3 id="account-past-heading" className="account-modal__section-title">
                지난 예약
              </h3>
              {past.length === 0 ? (
                <p className="account-modal__empty">내역이 없습니다.</p>
              ) : (
                <>
                  <p className="account-modal__list-meta">
                    총 {past.length}건
                    {pastHiddenCount > 0
                      ? ` · 최근 ${visiblePast.length}건만 표시 · 오래된 예약 ${pastHiddenCount}건 생략`
                      : null}
                  </p>
                  <div
                    className="account-modal__list-scroll"
                    role="region"
                    aria-label="지난 예약 목록"
                    tabIndex={0}
                  >
                    <ul className="account-modal__list account-modal__list--compact">
                      {visiblePast.map(b => (
                        <li key={b.bookingNo} className="account-modal__card account-modal__card--muted">
                          <span className="account-modal__hall">{hallNameById.get(b.hallId) ?? b.hallId}</span>
                          <span className="account-modal__time">{formatRange(b.startAt, b.endAt)}</span>
                          <span className="account-modal__meta">
                            {BOOKING_STATUS_LABEL[b.status]} · {b.bookingNo}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        <button className="modal__close" type="button" onClick={onClose} aria-label="닫기">
          ✕
        </button>
      </div>
    </div>
  )
}
