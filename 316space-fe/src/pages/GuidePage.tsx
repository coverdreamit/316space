import { useEffect } from 'react'

const guideCards = [
  {
    title: '입구 및 신발장',
    body: ['춤출 준비 되셨나요? 316의 소중한 바닥을 위해', '실외 신발은 신발장에 잠시 양보해 주세요.', '(연습용 실내화 착용 필수!)'],
    tone: 'filled',
  },
  {
    title: '거울 셀카 존',
    body: ['리뷰 쓰고 무료 이용권 받자!', '사진 리뷰 작성 후 인증해 주시면 다음 예약 때', '사용 가능한 쿠폰을 드려요!'],
    tone: 'outline',
  },
  {
    title: '정수기 및 분리수거',
    body: ['깔끔한 뒷정리는 다음 댄서를 위한 멋진 매너!', '남은 음료는 비우고 쓰레기는 분리수거함에', '쏙~ 넣어주세요!'],
    tone: 'outline',
  },
  {
    title: '퇴실 전 체크리스트(전등/에어컨 옆)',
    body: ['에어컨/난방기 OFF', '모든 전등 OFF', '사용하신 소품 및 의자 원위치', '문 꼭 닫혔는지 확인!'],
    tone: 'filled',
  },
] as const

const refundLeft = [
  '이용 7일 전 - 총 금액의 100% 환불',
  '이용 6일 전 - 총 금액의 100% 환불',
  '이용 5일 전 - 총 금액의 70% 환불',
  '이용 4일 전 - 총 금액의 50% 환불',
] as const

const refundRight = [
  '이용 3일 전 - 환불 불가',
  '이용 2일 전 - 환불 불가',
  '이용 전날 - 환불 불가',
  '이용 당일 - 환불 불가',
] as const

export default function GuidePage() {
  useEffect(() => {
    document.title = 'Guidelines · 316 spacebox'
  }, [])

  return (
    <main className="page-document guide-page" aria-labelledby="guide-page-title">
      <section className="guide-page__intro">
        <h1 id="guide-page-title" className="guide-page__title">
          Guidelines
        </h1>

        <div className="guide-page__cards" role="list" aria-label="이용 가이드">
          {guideCards.map(card => (
            <article
              key={card.title}
              className={`guide-card guide-card--${card.tone}`}
              role="listitem"
            >
              <h2 className="guide-card__title">{card.title}</h2>
              <p className="guide-card__body">
                {card.body.map(line => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-page__notice" aria-labelledby="guide-notice-title">
        <h2 id="guide-notice-title" className="guide-page__section-title">
          꼭 확인해주세요!
        </h2>

        <ol className="guide-page__rules">
          <li>
            연습실 내에서는 <span className="guide-page__highlight">외부화 착용 금지, 개인 연습화 착용</span>
            <br />
            <span className="guide-page__highlight">( + 흡연, 음주, 음란행위 등 피해가 되는 행위 금지!!)</span>
          </li>
          <li>
            <span className="guide-page__highlight">음료 외 모든 음식물 금지!</span> 적발 시, 환불 없이 강제 퇴실합니다.
          </li>
          <li>연습실 CCTV 24시간 촬영 중 입니다.</li>
          <li>연습실 비품 훼손 시 손해배상 청구합니다.</li>
          <li>퇴실 시 에어컨, 조명 등 모든 전원 OFF !!</li>
          <li>다음 사용자를 위해 깔끔히 사용 및 정리 후 퇴실 부탁드립니다.</li>
          <li>외부화 및 개인물품을 꼭 잘 챙겨주세요! 분실 시 책임 X</li>
        </ol>
      </section>

      <section className="guide-page__refund" aria-labelledby="guide-refund-title">
        <h2 id="guide-refund-title" className="guide-page__section-title">
          Refund Policy
        </h2>

        <div className="guide-page__refund-grid">
          <ul className="guide-page__refund-list">
            {refundLeft.map(line => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <ul className="guide-page__refund-list">
            {refundRight.map(line => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <p className="guide-page__refund-note">
          결제 후 2시간 이내에는 100% 환불이 가능합니다.(단, 이용시간 전까지만 가능)
        </p>
      </section>
    </main>
  )
}
