import { useEffect } from 'react'

const offerPlaceholder =
  'List your offers, promos, or special membership privileges and perks here to entice people to book your property.'

const offers = [
  {
    title: '1일 통임대',
    body: offerPlaceholder,
    imageSrc: '/offers/offer-1day.png',
    imageAlt: '스튜디오 음향 장비(믹싱 앰프)',
  },
  {
    title: '1달 정기권',
    body: offerPlaceholder,
    imageSrc: '/offers/offer-1month.png',
    imageAlt: '316 스페이스 1개월 정기권 티켓 이미지',
  },
  {
    title: '1년 정기권',
    body: offerPlaceholder,
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
          댄스나 춤연습뿐만 아니라 모임등 원하는 목적으로 편하시게 이용하실수 있습니다.
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
