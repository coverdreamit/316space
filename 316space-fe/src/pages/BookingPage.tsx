import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function BookingPage() {
  useEffect(() => {
    document.title = '예약 · 316 SPACE'
  }, [])

  return (
    <main className="page-document">
      <header className="page-document__hero">
        <p className="page-document__eyebrow">Reservation</p>
        <h1 className="page-document__title">예약</h1>
        <p className="page-document__lead">온라인 예약 기능을 준비 중입니다.</p>
      </header>

      <p className="page-document__prose">
        곧 이 페이지에서 시간대 선택과 결제까지 이어지는 예약 플로우를 제공할 예정입니다. 급하신 분은{' '}
        <Link to="/contact">Contact</Link> 페이지의 연락처로 문의해 주세요.
      </p>
    </main>
  )
}
