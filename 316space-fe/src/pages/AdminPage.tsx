import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import AdminUsersPanel from '../components/admin/AdminUsersPanel'

const ADMIN_ROLE = 'ADMIN'

type TabId = 'users' | 'bookings' | 'inquiries' | 'logs'

const TAB_ORDER: TabId[] = ['users', 'bookings', 'inquiries', 'logs']

const TAB_LABELS: Record<TabId, string> = {
  users: '유저 관리',
  bookings: '예약 관리',
  inquiries: '문의 관리',
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
        <p className="page-document__lead">유저·예약·문의·로그를 한 곳에서 관리합니다.</p>
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

          {activeTab === 'bookings' && (
            <AdminDataSection
              columns={[
                '예약 ID',
                '예약자',
                '연락처',
                '호실',
                '시작일시',
                '종료일시',
                '상태',
                '등록일시',
              ]}
              filters={
                <>
                  <div className="admin-field">
                    <label className="admin-label" htmlFor="admin-booking-from">
                      시작일
                    </label>
                    <input
                      id="admin-booking-from"
                      className="admin-input"
                      type="date"
                      name="bookingFrom"
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
                      name="bookingTo"
                    />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label" htmlFor="admin-booking-status">
                      상태
                    </label>
                    <select
                      id="admin-booking-status"
                      className="admin-select"
                      name="bookingStatus"
                      defaultValue=""
                    >
                      <option value="">전체</option>
                      <option value="REQUESTED">요청</option>
                      <option value="CONFIRMED">확정</option>
                      <option value="CANCELLED">취소</option>
                      <option value="COMPLETED">이용완료</option>
                    </select>
                  </div>
                </>
              }
            />
          )}

          {activeTab === 'inquiries' && (
            <AdminDataSection
              columns={[
                '문의 ID',
                '제목',
                '문의자',
                '이메일',
                '전화',
                '상태',
                '접수일시',
                '답변일시',
              ]}
              filters={
                <>
                  <div className="admin-field">
                    <label className="admin-label" htmlFor="admin-inquiry-status">
                      상태
                    </label>
                    <select
                      id="admin-inquiry-status"
                      className="admin-select"
                      name="inquiryStatus"
                      defaultValue=""
                    >
                      <option value="">전체</option>
                      <option value="NEW">신규</option>
                      <option value="IN_PROGRESS">처리중</option>
                      <option value="RESOLVED">완료</option>
                    </select>
                  </div>
                  <div className="admin-field">
                    <label className="admin-label" htmlFor="admin-inquiry-from">
                      접수 시작
                    </label>
                    <input
                      id="admin-inquiry-from"
                      className="admin-input"
                      type="date"
                      name="inquiryFrom"
                    />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label" htmlFor="admin-inquiry-to">
                      접수 종료
                    </label>
                    <input
                      id="admin-inquiry-to"
                      className="admin-input"
                      type="date"
                      name="inquiryTo"
                    />
                  </div>
                </>
              }
            />
          )}

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
