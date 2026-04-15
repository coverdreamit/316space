import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import AdminAuditLogsPanel from '../components/admin/AdminAuditLogsPanel'
import AdminBookingsPanel from '../components/admin/AdminBookingsPanel'
import AdminInquiriesPanel from '../components/admin/AdminInquiriesPanel'
import AdminNotificationSettingsPanel from '../components/admin/AdminNotificationSettingsPanel'
import AdminUsersPanel from '../components/admin/AdminUsersPanel'

const ADMIN_ROLE = 'ADMIN'

type TabId = 'users' | 'bookings' | 'inquiries' | 'notifications' | 'logs'

const TAB_ORDER: TabId[] = ['users', 'bookings', 'inquiries', 'notifications', 'logs']

const TAB_LABELS: Record<TabId, string> = {
  users: '유저 관리',
  bookings: '예약 관리',
  inquiries: '문의 관리',
  notifications: '알림 · 연동',
  logs: '로그',
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
      if (
        e.key === 'ArrowDown' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowLeft'
      ) {
        e.preventDefault()
        const forward = e.key === 'ArrowDown' || e.key === 'ArrowRight'
        const next = forward
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
    return (
      <main className="page-document">
        <header className="page-document__hero">
          <h1 className="page-document__title">관리자 페이지</h1>
          <p className="page-document__lead">
            이 페이지는 관리자 계정으로 로그인한 경우에만 접근할 수 있습니다.
          </p>
        </header>
        <div className="contact-inquiry-toolbar">
          <Link to="/" className="contact-cta">
            홈으로 이동
          </Link>
          <Link to="/contact" className="contact-cta">
            문의하기
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="page-document">
      <header className="page-document__hero">
        <h1 className="page-document__title">관리자</h1>
        <p className="page-document__lead">
          유저·예약(스케줄 블록 포함)·문의·Slack 알림·로그를 한 곳에서 관리합니다.
        </p>
      </header>

      <div className="admin-tabs">
        <aside className="admin-sidebar">
          <div
            role="tablist"
            aria-label="관리 메뉴"
            aria-orientation="vertical"
            className="admin-tablist"
          >
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
        </aside>

        <div
          id="admin-panel"
          role="tabpanel"
          aria-labelledby={`admin-tab-${activeTab}`}
          tabIndex={0}
          className="admin-tabpanel"
        >
          {activeTab === 'users' && <AdminUsersPanel />}

          {activeTab === 'bookings' && <AdminBookingsPanel />}

          {activeTab === 'inquiries' && <AdminInquiriesPanel />}

          {activeTab === 'notifications' && <AdminNotificationSettingsPanel />}

          {activeTab === 'logs' && <AdminAuditLogsPanel />}
        </div>
      </div>
    </main>
  )
}
