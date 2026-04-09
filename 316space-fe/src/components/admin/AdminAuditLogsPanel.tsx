import { useCallback, useEffect, useState } from 'react'
import {
  AUDIT_ACTION_OPTIONS,
  auditActionLabel,
  fetchAdminAuditLogs,
  type AuditLogDto,
} from '../../api/adminAuditLogs'
import type { PageDto } from '../../api/adminBookings'
import AdminGridPagination from './AdminGridPagination'
import { DEFAULT_ADMIN_GRID_PAGE_SIZE, type AdminGridPageSize } from './adminGridPageSize'

function formatDt(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    })
  } catch {
    return iso
  }
}

function actorDisplay(row: AuditLogDto): string {
  if (row.actorLabel) return row.actorLabel
  if (row.actorMemberId != null) return `#${row.actorMemberId}`
  return '—'
}

export default function AdminAuditLogsPanel() {
  const [logFrom, setLogFrom] = useState('')
  const [logTo, setLogTo] = useState('')
  const [logAction, setLogAction] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState<AdminGridPageSize>(DEFAULT_ADMIN_GRID_PAGE_SIZE)
  const [data, setData] = useState<PageDto<AuditLogDto> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const fromParam =
        logFrom.trim() === '' ? undefined : logFrom.length === 16 ? `${logFrom}:00` : logFrom
      const toParam = logTo.trim() === '' ? undefined : logTo.length === 16 ? `${logTo}:59` : logTo
      const pageData = await fetchAdminAuditLogs({
        page,
        size: pageSize,
        from: fromParam,
        to: toParam,
        action: logAction === '' ? undefined : logAction,
      })
      setData(pageData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그를 불러오지 못했습니다.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [logFrom, logTo, logAction, page, pageSize])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setPage(0)
  }, [logFrom, logTo, logAction, pageSize])

  const columns = [
    '로그 ID',
    '발생일시',
    '수행자',
    '액션',
    '대상 유형',
    '대상 ID',
    'IP',
    '상세',
  ] as const

  return (
    <div className="admin-module">
      <div className="admin-toolbar">
        <div className="admin-field">
          <label className="admin-label" htmlFor="admin-log-from">
            시작일시
          </label>
          <input
            id="admin-log-from"
            className="admin-input"
            type="datetime-local"
            name="logFrom"
            value={logFrom}
            onChange={e => setLogFrom(e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="admin-log-to">
            종료일시
          </label>
          <input
            id="admin-log-to"
            className="admin-input"
            type="datetime-local"
            name="logTo"
            value={logTo}
            onChange={e => setLogTo(e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="admin-log-action">
            액션
          </label>
          <select
            id="admin-log-action"
            className="admin-select"
            name="logAction"
            value={logAction}
            onChange={e => setLogAction(e.target.value)}
          >
            {AUDIT_ACTION_OPTIONS.map(o => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="admin-banner admin-banner--error">{error}</p>}
      {loading && <p className="admin-banner">불러오는 중…</p>}

      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col} scope="col">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading && data && data.content.length === 0 && (
              <tr>
                <td className="admin-table__empty" colSpan={columns.length}>
                  기록된 로그가 없습니다.
                </td>
              </tr>
            )}
            {data?.content.map(row => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{formatDt(row.occurredAt)}</td>
                <td>{actorDisplay(row)}</td>
                <td>{auditActionLabel(row.action)}</td>
                <td>{row.targetType ?? '—'}</td>
                <td>{row.targetId ?? '—'}</td>
                <td>{row.ipAddress ?? '—'}</td>
                <td title={row.detail ?? undefined}>
                  {row.detail && row.detail.length > 48 ? `${row.detail.slice(0, 48)}…` : (row.detail ?? '—')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 0 && (
        <AdminGridPagination
          selectId="admin-audit-log-page-size"
          page={page}
          totalPages={data.totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          totalElements={data.totalElements}
        />
      )}
    </div>
  )
}
