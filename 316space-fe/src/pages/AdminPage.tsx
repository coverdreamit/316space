import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const ADMIN_ROLE = 'ADMIN'

export default function AdminPage() {
  const { isAuthenticated, role } = useAuth()

  useEffect(() => {
    document.title = '관리자 · 316 SPACE'
  }, [])

  if (!isAuthenticated || role !== ADMIN_ROLE) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="page-document">
      <header className="page-document__hero">
        <h1 className="page-document__title">관리자</h1>
        <p className="page-document__lead">관리자 전용 영역입니다.</p>
      </header>

      <section className="contact-block" aria-labelledby="admin-placeholder-heading">
        <h2 id="admin-placeholder-heading" className="page-document__section-title">
          대시보드
        </h2>
        <p className="page-document__prose">
          예약·문의 등 관리 기능은 이후 이 페이지에 연결할 수 있습니다.
        </p>
      </section>
    </main>
  )
}
