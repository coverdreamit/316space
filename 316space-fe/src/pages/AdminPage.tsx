import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import AdminBookingsPanel from '../components/admin/AdminBookingsPanel'
import AdminInquiriesPanel from '../components/admin/AdminInquiriesPanel'
import AdminScheduleBlocksPanel from '../components/admin/AdminScheduleBlocksPanel'
import AdminNotificationSettingsPanel from '../components/admin/AdminNotificationSettingsPanel'
import AdminUsersPanel from '../components/admin/AdminUsersPanel'

const ADMIN_ROLE = 'ADMIN'

type TabId = 'users' | 'bookings' | 'blocks' | 'inquiries' | 'notifications' | 'logs'

const TAB_ORDER: TabId[] = ['users', 'bookings', 'blocks', 'inquiries', 'notifications', 'logs']

const TAB_LABELS: Record<TabId, string> = {
  users: '유저 관리',
  bookings: '예약 관리',
  blocks: '스케줄 블록',
  inquiries: '문의 관리',
  notifications: '알림 · 연동',
  logs: '로그',
}

type AdminDataSectionProps = {
  filters: ReactNode
  columns: readonly string[]
}

function AdminDataSection({ filters, columns }: AdminDataSectionProps) {
  return (
    <div className="admin-module">
      <div className="admin-toolbar">{filters}</div>
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
            <tr>
              <td className="admin-table__empty" colSpan={columns.length}>
                데이터 연동 예정
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { isAuthenticated, role } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('users')

  useEffect(() => {
    document.title = '관리자 · 316 SPACE'
  }, [])

  const focusTab = useCallback((id: TabId) => {
    setActiveTab(id)
    requestAnimationFrame(() => {
      document.getElementById(`admin-tab-${id}`)?.focus()
    })
  }, [])

  const onTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, id: TabId) => {
      const i = TAB_ORDER.indexOf(id)
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const next =
          e.key === 'ArrowRight'
            ? TAB_ORDER[(i + 1) % TAB_ORDER.length]
            : TAB_ORDER[(i - 1 + TAB_ORDER.length) % TAB_ORDER.length]
        focusTab(next)
      } else if (e.key === 'Home') {
        e.preventDefault()
        focusTab(TAB_ORDER[0])
      } else if (e.key === 'End') {
        e.preventDefault()
        focusTab(TAB_ORDER[TAB_ORDER.length - 1])
      }
    },
    [focusTab],
  )

  if (!isAuthenticated || role !== ADMIN_ROLE) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="page-document">
      <header className="page-document__hero">
        <h1 className="page-document__title">관리자</h1>
        <p className="page-document__lead">
          유저·예약·스케줄 블록·문의·Slack 알림·로그를 한 곳에서 관리합니다.
        </p>
      </header>

      <div className="admin-tabs">
        <div role="tablist" aria-label="관리 메뉴" className="admin-tablist">
          {TAB_ORDER.map(id => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`admin-tab-${id}`}
              className="admin-tab"
              aria-selected={activeTab === id}
              aria-controls="admin-panel"
              tabIndex={activeTab === id ? 0 : -1}
              onClick={() => setActiveTab(id)}
              onKeyDown={e => onTabKeyDown(e, id)}
            >
              {TAB_LABELS[id]}
            </button>
          ))}
        </div>

        <div
          id="admin-panel"
          role="tabpanel"
          aria-labelledby={`admin-tab-${activeTab}`}
          tabIndex={0}
          className="admin-tabpanel"
        >
          {activeTab === 'users' && <AdminUsersPanel />}

          {activeTab === 'blocks' && <AdminScheduleBlocksPanel />}

          {activeTab === 'bookings' && <AdminBookingsPanel />}

          {activeTab === 'inquiries' && <AdminInquiriesPanel />}

          {activeTab === 'notifications' && <AdminNotificationSettingsPanel />}

          {activeTab === 'logs' && (
            <AdminDataSection
              columns={[
                '로그 ID',
                '발생일시',
                '수행자',
                '액션',
                '대상 유형',
                '대상 ID',
                'IP',
                '상세',
              ]}
              filters={
                <>
                  <div className="admin-field">
                    <label className="admin-label" htmlFor="admin-log-from">
                      시작일시
                    </label>
                    <input
                      id="admin-log-from"
                      className="admin-input"
                      type="datetime-local"
                      name="logFrom"
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
                      defaultValue=""
                    >
                      <option value="">전체</option>
                      <option value="LOGIN">로그인</option>
                      <option value="USER_UPDATE">회원 수정</option>
                      <option value="BOOKING_UPDATE">예약 수정</option>
                      <option value="INQUIRY_REPLY">문의 답변</option>
                    </select>
                  </div>
                </>
              }
            />
          )}
        </div>
      </div>
    </main>
  )
}
