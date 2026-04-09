import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  adminCancelBooking,
  adminConfirmBooking,
  createAdminBooking,
  fetchAdminBookings,
  type PageDto,
} from '../../api/adminBookings'
import { fetchAdminHalls, type HallAdminDto } from '../../api/adminHalls'
import { BOOKING_STATUS_LABEL, type BookingDto, type BookingStatus } from '../../api/bookingCalendar'
import AdminGridPagination from './AdminGridPagination'
import AdminScheduleBlocksPanel from './AdminScheduleBlocksPanel'
import { DEFAULT_ADMIN_GRID_PAGE_SIZE, type AdminGridPageSize } from './adminGridPageSize'

function ymd(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function defaultBookingRange(): { from: string; to: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return { from: ymd(start), to: ymd(end) }
}

function formatRange(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function toIsoDateTime(local: string): string {
  if (!local) return ''
  return local.length === 16 ? `${local}:00` : local
}

export default function AdminBookingsPanel() {
  const [halls, setHalls] = useState<HallAdminDto[]>([])
  const [hallsLoading, setHallsLoading] = useState(true)
  const [hallsError, setHallsError] = useState<string | null>(null)

  const [{ from: bookingFrom, to: bookingTo }, setBookingRange] = useState(defaultBookingRange)
  const [bookingHallFilter, setBookingHallFilter] = useState('')
  const [bookingStatus, setBookingStatus] = useState<BookingStatus | ''>('')
  const [bookingPage, setBookingPage] = useState(0)
  const [bookingPageSize, setBookingPageSize] = useState<AdminGridPageSize>(DEFAULT_ADMIN_GRID_PAGE_SIZE)
  const [bookingData, setBookingData] = useState<PageDto<BookingDto> | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)

  const [createGuestName, setCreateGuestName] = useState('')
  const [createGuestPhone, setCreateGuestPhone] = useState('')
  const [createHallId, setCreateHallId] = useState('')
  const [createStart, setCreateStart] = useState('')
  const [createEnd, setCreateEnd] = useState('')
  const [createHeadcount, setCreateHeadcount] = useState('')
  const [createPurpose, setCreatePurpose] = useState('')
  const [createNote, setCreateNote] = useState('')
  const [createSubmitting, setCreateSubmitting] = useState(false)

  const loadHalls = useCallback(async () => {
    setHallsLoading(true)
    setHallsError(null)
    try {
      const list = await fetchAdminHalls()
      setHalls(list)
    } catch (err) {
      setHallsError(err instanceof Error ? err.message : '홀 목록을 불러오지 못했습니다.')
      setHalls([])
    } finally {
      setHallsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadHalls()
  }, [loadHalls])

  useEffect(() => {
    if (halls.length === 0) return
    const ids = new Set(halls.map(h => h.hallId))
    if (!createHallId || !ids.has(createHallId)) {
      setCreateHallId(halls[0].hallId)
    }
  }, [halls, createHallId])

  const loadBookings = useCallback(async () => {
    setBookingLoading(true)
    setBookingError(null)
    if (bookingFrom > bookingTo) {
      setBookingError('시작일은 종료일보다 빠르거나 같아야 합니다.')
      setBookingData(null)
      setBookingLoading(false)
      return
    }
    const fromDt = `${bookingFrom}T00:00:00`
    const toDt = `${bookingTo}T23:59:59`
    try {
      const page = await fetchAdminBookings({
        page: bookingPage,
        size: bookingPageSize,
        hallId: bookingHallFilter.trim() === '' ? undefined : bookingHallFilter.trim(),
        status: bookingStatus === '' ? undefined : bookingStatus,
        from: fromDt,
        to: toDt,
      })
      setBookingData(page)
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : '예약 목록을 불러오지 못했습니다.')
      setBookingData(null)
    } finally {
      setBookingLoading(false)
    }
  }, [bookingFrom, bookingTo, bookingHallFilter, bookingStatus, bookingPage, bookingPageSize])

  useEffect(() => {
    void loadBookings()
  }, [loadBookings])

  const submitCreateBooking = async (e: FormEvent) => {
    e.preventDefault()
    setCreateSubmitting(true)
    try {
      const body: Parameters<typeof createAdminBooking>[0] = {
        guestName: createGuestName.trim(),
        guestPhone: createGuestPhone.trim(),
        hallId: createHallId,
        startAt: toIsoDateTime(createStart),
        endAt: toIsoDateTime(createEnd),
        purpose: createPurpose.trim() || null,
        note: createNote.trim() || null,
      }
      const hc = createHeadcount.trim()
      if (hc !== '') {
        const n = Number(hc)
        if (!Number.isFinite(n) || n < 1) {
          window.alert('인원은 1 이상의 숫자로 입력하거나 비워 두세요.')
          setCreateSubmitting(false)
          return
        }
        body.headcount = n
      } else {
        body.headcount = null
      }
      await createAdminBooking(body)
      setCreateGuestName('')
      setCreateGuestPhone('')
      setCreateHeadcount('')
      setCreatePurpose('')
      setCreateNote('')
      setBookingPage(0)
      await loadBookings()
      window.alert('예약이 등록되었습니다.')
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '등록에 실패했습니다.')
    } finally {
      setCreateSubmitting(false)
    }
  }

  const onConfirmBooking = async (b: BookingDto) => {
    try {
      await adminConfirmBooking(b.bookingNo)
      await loadBookings()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '확정에 실패했습니다.')
    }
  }

  const onCancelBooking = async (b: BookingDto) => {
    const reason = window.prompt('취소 사유(선택)') ?? ''
    try {
      await adminCancelBooking(b.bookingNo, reason.trim() === '' ? undefined : reason.trim())
      await loadBookings()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '취소에 실패했습니다.')
    }
  }

  const bookings = bookingData?.content ?? []
  const totalPages = bookingData?.totalPages ?? 0
  const totalBookingElements = bookingData?.totalElements

  return (
    <>
      <div className="admin-module">
        <h3 className="admin-panel-section-title">예약 목록</h3>
        <div className="admin-toolbar">
          <div className="admin-field">
            <label className="admin-label" htmlFor="admin-booking-from">
              시작일
            </label>
            <input
              id="admin-booking-from"
              className="admin-input"
              type="date"
              value={bookingFrom}
              onChange={e => {
                setBookingPage(0)
                setBookingRange(r => ({ ...r, from: e.target.value }))
              }}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="admin-booking-to">
              종료일
            </label>
            <input
              id="admin-booking-to"
              className="admin-input"
              type="date"
              value={bookingTo}
              onChange={e => {
                setBookingPage(0)
                setBookingRange(r => ({ ...r, to: e.target.value }))
              }}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="admin-booking-hall">
              호실
            </label>
            <select
              id="admin-booking-hall"
              className="admin-select"
              value={bookingHallFilter}
              onChange={e => {
                setBookingPage(0)
                setBookingHallFilter(e.target.value)
              }}
            >
              <option value="">전체</option>
              {halls.map(h => (
                <option key={h.id} value={h.hallId}>
                  {h.name} ({h.hallId})
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="admin-booking-status">
              상태
            </label>
            <select
              id="admin-booking-status"
              className="admin-select"
              value={bookingStatus}
              onChange={e => {
                setBookingPage(0)
                setBookingStatus(e.target.value as BookingStatus | '')
              }}
            >
              <option value="">전체</option>
              <option value="PENDING">{BOOKING_STATUS_LABEL.PENDING}</option>
              <option value="CONFIRMED">{BOOKING_STATUS_LABEL.CONFIRMED}</option>
              <option value="CANCELLED">{BOOKING_STATUS_LABEL.CANCELLED}</option>
            </select>
          </div>
          <button type="button" className="admin-btn-table" onClick={() => void loadBookings()} disabled={bookingLoading}>
            새로고침
          </button>
          <button type="button" className="admin-btn-table" onClick={() => void loadHalls()} disabled={hallsLoading}>
            홀 목록 갱신
          </button>
        </div>
        {hallsError && <p className="admin-banner admin-banner--error">{hallsError}</p>}
        {bookingError && <p className="admin-banner admin-banner--error">{bookingError}</p>}
        {bookingLoading && <p className="admin-banner">불러오는 중…</p>}
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">예약번호</th>
                <th scope="col">예약자</th>
                <th scope="col">연락처</th>
                <th scope="col">호실</th>
                <th scope="col">시작</th>
                <th scope="col">종료</th>
                <th scope="col">상태</th>
                <th scope="col">등록</th>
                <th scope="col">작업</th>
              </tr>
            </thead>
            <tbody>
              {!bookingLoading && bookings.length === 0 && (
                <tr>
                  <td className="admin-table__empty" colSpan={9}>
                    {bookingError ? '데이터를 표시할 수 없습니다.' : '조건에 맞는 예약이 없습니다.'}
                  </td>
                </tr>
              )}
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>{b.bookingNo}</td>
                  <td>{b.guestName}</td>
                  <td>{b.guestPhone}</td>
                  <td>{b.hallId}</td>
                  <td>{formatRange(b.startAt)}</td>
                  <td>{formatRange(b.endAt)}</td>
                  <td>{BOOKING_STATUS_LABEL[b.status]}</td>
                  <td>{formatRange(b.createdAt)}</td>
                  <td>
                    {b.status === 'PENDING' && (
                      <button type="button" className="admin-btn-table" onClick={() => void onConfirmBooking(b)}>
                        확정
                      </button>
                    )}{' '}
                    {b.status !== 'CANCELLED' && (
                      <button type="button" className="admin-btn-table" onClick={() => void onCancelBooking(b)}>
                        취소
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AdminGridPagination
          selectId="admin-bookings-page-size"
          page={bookingPage}
          totalPages={totalPages}
          pageSize={bookingPageSize}
          onPageChange={setBookingPage}
          onPageSizeChange={size => {
            setBookingPage(0)
            setBookingPageSize(size)
          }}
          disabled={bookingLoading}
          totalElements={totalBookingElements}
          hidden={bookingLoading || bookingData == null}
        />
      </div>

      <div className="admin-module">
        <h3 className="admin-panel-section-title">대리 예약 등록</h3>
        <form onSubmit={e => void submitCreateBooking(e)} className="admin-toolbar" style={{ alignItems: 'flex-start' }}>
          <div className="admin-field">
            <label className="admin-label" htmlFor="admin-create-name">
              예약자명
            </label>
            <input
              id="admin-create-name"
              className="admin-input"
              value={createGuestName}
              onChange={e => setCreateGuestName(e.target.value)}
              maxLength={50}
              required
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="admin-create-phone">
              연락처
            </label>
            <input
              id="admin-create-phone"
              className="admin-input"
              value={createGuestPhone}
              onChange={e => setCreateGuestPhone(e.target.value)}
              maxLength={20}
              required
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="admin-create-hall">
              호실
            </label>
            <select
              id="admin-create-hall"
              className="admin-select"
              value={createHallId}
              onChange={e => setCreateHallId(e.target.value)}
              required
              disabled={halls.length === 0}
            >
              {halls.length === 0 ? (
                <option value="">hall 테이블에 데이터가 없습니다</option>
              ) : (
                halls.map(h => (
                  <option key={h.id} value={h.hallId}>
                    {h.name} ({h.hallId})
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="admin-create-start">
              시작
            </label>
            <input
              id="admin-create-start"
              className="admin-input"
              type="datetime-local"
              value={createStart}
              onChange={e => setCreateStart(e.target.value)}
              required
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="admin-create-end">
              종료
            </label>
            <input
              id="admin-create-end"
              className="admin-input"
              type="datetime-local"
              value={createEnd}
              onChange={e => setCreateEnd(e.target.value)}
              required
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="admin-create-headcount">
              인원
            </label>
            <input
              id="admin-create-headcount"
              className="admin-input"
              type="number"
              min={1}
              placeholder="선택"
              value={createHeadcount}
              onChange={e => setCreateHeadcount(e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="admin-create-purpose">
              용도
            </label>
            <input
              id="admin-create-purpose"
              className="admin-input"
              value={createPurpose}
              onChange={e => setCreatePurpose(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="admin-field" style={{ minWidth: 'min(100%, 14rem)' }}>
            <label className="admin-label" htmlFor="admin-create-note">
              비고
            </label>
            <input
              id="admin-create-note"
              className="admin-input"
              value={createNote}
              onChange={e => setCreateNote(e.target.value)}
            />
          </div>
          <button type="submit" className="admin-btn-table" disabled={createSubmitting || halls.length === 0}>
            등록
          </button>
        </form>
      </div>

      <AdminScheduleBlocksPanel />
    </>
  )
}
