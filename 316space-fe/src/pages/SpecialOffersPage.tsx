import { useEffect } from 'react'

const offers = [
  {
    title: '1일 통임대',
    body: '하루 동안 공간 전체를 자유롭게 이용할 수 있는 상품입니다. 단체 연습, 촬영, 행사, 워크숍 등 긴 시간 여유 있게 사용하고 싶은 분들께 적합합니다.',
    imageSrc: '/offers/offer-1day.png',
    imageAlt: '스튜디오 음향 장비(믹싱 앰프)',
  },
  {
    title: '1달 정기권',
    body: '정기적으로 연습하거나 레슨을 운영하는 분들을 위한 월 이용 상품입니다. 반복 예약이 필요한 개인 및 팀에게 실용적인 선택입니다.',
    imageSrc: '/offers/offer-1month.png',
    imageAlt: '316 스페이스 1개월 정기권 티켓 이미지',
  },
  {
    title: '1년 정기권',
    body: '장기간 꾸준히 공간을 이용하는 분들을 위한 연간 이용 상품입니다. 팀 운영, 클래스 진행, 장기 프로젝트에 더욱 합리적으로 이용하실 수 있습니다.',
    imageSrc: '/offers/offer-1year.png',
    imageAlt: '316 스페이스 1년 월간회원권 티켓 이미지',
  },
] as const

export default function SpecialOffersPage() {
  useEffect(() => {
    document.title = 'Special Offers · 316 SPACE'
  }, [])

  return (
    <main className="page-document">
      <header className="page-document__hero">
        <h1 className="page-document__title">Special Offers</h1>
        <p className="page-document__lead">요금 안내</p>
        <p className="page-document__prose page-document__prose--tight">
          댄스, 보컬, 연습, 모임, 촬영 등 다양한 목적으로 이용할 수 있는 공간입니다. 이용 패턴에 맞춰 1일 통임대부터 월·연 정기권까지 선택해 보세요.
        </p>
      </header>

      <ul className="offer-list">
        {offers.map((o) => (
          <li key={o.title} className="offer-card">
            <div className="offer-card__media">
              <img
                className="offer-card__img"
                src={o.imageSrc}
                alt={o.imageAlt}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="offer-card__content">
              <h2 className="offer-card__title">{o.title}</h2>
              <p className="offer-card__body">{o.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
