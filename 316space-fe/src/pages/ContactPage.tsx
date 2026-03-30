import { useEffect } from 'react'

export default function ContactPage() {
  useEffect(() => {
    document.title = 'Contact · 316 SPACE'
  }, [])

  return (
    <main className="page-document">
      <header className="page-document__hero">
        <h1 className="page-document__title">Contact</h1>
        <p className="page-document__lead">운영 정보 · 연락처</p>
      </header>

      <section className="contact-block" aria-labelledby="hours-heading">
        <h2 id="hours-heading" className="page-document__section-title">
          운영 시간
        </h2>
        <p className="page-document__prose">
          24시간 연중무휴(시설 기준). 세부 휴무·점검 일정은 추후 이곳에 반영해 주세요.
        </p>
      </section>

      <section className="contact-block" aria-labelledby="reach-heading">
        <h2 id="reach-heading" className="page-document__section-title">
          연락처
        </h2>
        <ul className="page-document__bullets">
          <li>전화: (실제 번호로 교체)</li>
          <li>카카오채널 / 인스타그램: (실제 계정으로 교체)</li>
          <li>주소: (실제 주소로 교체)</li>
        </ul>
      </section>

      <section className="contact-block" aria-labelledby="inquiry-heading">
        <h2 id="inquiry-heading" className="page-document__section-title">
          문의
        </h2>
        <p className="page-document__prose">
          폼·채팅 등 문의 기능은 추가 예정입니다. 현재는 위 연락처로 부탁드립니다.
        </p>
      </section>
    </main>
  )
}
