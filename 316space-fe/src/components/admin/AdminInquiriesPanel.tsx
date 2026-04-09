import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  deleteInquiry,
  fetchInquiries,
  type InquiryCategory,
  type InquiryListItemDto,
  type InquiryStatus,
} from '../../api/inquiries'
import AdminGridPagination from './AdminGridPagination'
import AdminInquiryAnswerModal from './AdminInquiryAnswerModal'
import { DEFAULT_ADMIN_GRID_PAGE_SIZE, type AdminGridPageSize } from './adminGridPageSize'

const CATEGORY_LABEL: Record<InquiryCategory, string> = {
  BOOKING: '예약',
  FACILITY: '시설',
  ETC: '기타',
}

const STATUS_LABEL: Record<InquiryStatus, string> = {
  WAITING: '답변 대기',
  ANSWERED: '답변 완료',
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

export default function AdminInquiriesPanel() {
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | ''>('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState<AdminGridPageSize>(DEFAULT_ADMIN_GRID_PAGE_SIZE)

  const [items, setItems] = useState<InquiryListItemDto[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [answerInquiryId, setAnswerInquiryId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchInquiries(page, pageSize, statusFilter === '' ? undefined : statusFilter)
      setItems(data.content ?? [])
      setTotalPages(data.totalPages ?? 0)
      setTotalElements(data.totalElements ?? 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.')
      setItems([])
      setTotalPages(0)
      setTotalElements(0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, statusFilter])

  useEffect(() => {
    void load()
  }, [load])

  const onFilterChange = (next: InquiryStatus | '') => {
    setStatusFilter(next)
    setPage(0)
  }

  const handleDelete = async (row: InquiryListItemDto) => {
    if (
      !window.confirm(
        `문의 #${row.id}「${row.title}」을(를) 삭제할까요? 삭제 후에는 복구할 수 없습니다.`,
      )
    ) {
      return
    }
    setDeletingId(row.id)
    try {
      await deleteInquiry(row.id)
      if (answerInquiryId === row.id) setAnswerInquiryId(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : '삭제하지 못했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="admin-module">
      <h3 className="admin-panel-section-title">문의 목록 · 답변</h3>
      <div className="admin-toolbar">
        <div className="admin-field">
          <label className="admin-label" htmlFor="admin-inq-status">
            상태
          </label>
          <select
            id="admin-inq-status"
            className="admin-select"
            value={statusFilter}
            onChange={e => onFilterChange(e.target.value === '' ? '' : (e.target.value as InquiryStatus))}
          >
            <option value="">전체</option>
            <option value="WAITING">답변 대기</option>
            <option value="ANSWERED">답변 완료</option>
          </select>
        </div>
        <button type="button" className="admin-btn-table" onClick={() => void load()} disabled={loading}>
          새로고침
        </button>
      </div>

      {error && <p className="admin-banner admin-banner--error">{error}</p>}

      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">제목</th>
              <th scope="col">분류</th>
              <th scope="col">문의자</th>
              <th scope="col">유형</th>
              <th scope="col">비공개</th>
              <th scope="col">상태</th>
              <th scope="col">접수일시</th>
              <th scope="col">답변</th>
              <th scope="col">삭제</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="admin-table__empty">
                  불러오는 중…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={10} className="admin-table__empty">
                  문의가 없습니다.
                </td>
              </tr>
            ) : (
              items.map(row => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td className="admin-table__cell-clip">{row.title}</td>
                  <td>{CATEGORY_LABEL[row.category]}</td>
                  <td>{row.authorName}</td>
                  <td>{row.guestPost ? '비회원' : '회원'}</td>
                  <td>{row.isPrivate ? '예' : '—'}</td>
                  <td>{STATUS_LABEL[row.status]}</td>
                  <td>{formatDt(row.createdAt)}</td>
                  <td>
                    <button type="button" className="admin-btn-table" onClick={() => setAnswerInquiryId(row.id)}>
                      {row.status === 'ANSWERED' ? '답변 수정' : '답변 작성'}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn-table admin-btn-table--danger"
                      onClick={() => void handleDelete(row)}
                      disabled={loading || deletingId != null}
                    >
                      {deletingId === row.id ? '삭제 중…' : '삭제'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminGridPagination
        selectId="admin-inquiries-page-size"
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={size => {
          setPage(0)
          setPageSize(size)
        }}
        disabled={loading}
        totalElements={totalElements}
        hidden={loading}
      />

      {answerInquiryId != null &&
        createPortal(
          <AdminInquiryAnswerModal
            inquiryId={answerInquiryId}
            onClose={() => setAnswerInquiryId(null)}
            onSaved={() => void load()}
          />,
          document.body,
        )}
    </div>
  )
}
