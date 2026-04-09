import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  adminCancelBooking,
  adminConfirmBooking,
  fetchAdminBookings,
  type PageDto,
} from '../../api/adminBookings'
import { fetchAdminHalls, type HallAdminDto } from '../../api/adminHalls'
import { BOOKING_STATUS_LABEL, type BookingDto, type BookingStatus } from '../../api/bookingCalendar'
import AdminBookingCreateModal from './AdminBookingCreateModal'
import AdminGridPagination from './AdminGridPagination'
import AdminScheduleBlocksPanel from './AdminScheduleBlocksPanel'
import { DEFAULT_ADMIN_GRID_PAGE_SIZE, type AdminGridPageSize } from './adminGridPageSize'

function ymd(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function defaultBookingRange(): { from: string; to: string } {
  const start = new Date()
  const end = new Date()
  end.setDate(end.getDate() + 7)
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
  const [createModalOpen, setCreateModalOpen] = useState(false)

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
          <button
            type="button"
            className="admin-btn-table"
            onClick={() => setCreateModalOpen(true)}
            disabled={hallsLoading || halls.length === 0}
          >
            예약 추가
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

      {createModalOpen &&
        createPortal(
          <AdminBookingCreateModal
            halls={halls}
            onClose={() => setCreateModalOpen(false)}
            onCreated={async () => {
              setBookingPage(0)
              await loadBookings()
            }}
          />,
          document.body,
        )}

      <AdminScheduleBlocksPanel />
    </>
  )
}
