import { useEffect } from "react";

type OfferVariant = "day" | "month" | "year";

type OfferCard = {
  variant: OfferVariant;
  title: string;
  description: string;
  imagePath: string;
  textTone: "light" | "dark";
  rows: { label: string; weekday: string; weekend: string }[];
};

const OFFERS: readonly OfferCard[] = [
  {
    variant: "day",
    title: "1일 대관",
    description:
      "하루 동안 전체를 자유롭게 이용할 수 있는 상품입니다. (단체 연습, 촬영, 행사, 워크숍 등)",
    imagePath: "/special-offers/KakaoTalk_20260417_104245185.png",
    textTone: "light",
    rows: [
      { label: "1~4홀", weekday: "70,000원", weekend: "80,000원" },
      { label: "5홀", weekday: "140,000원", weekend: "160,000원" },
    ],
  },
  {
    variant: "month",
    title: "1달 정기권",
    description:
      "정기적으로 연습하거나 레슨을 운영하는 분들을 위한 월 이용 상품입니다.",
    imagePath: "/special-offers/KakaoTalk_20260417_104245185_01.png",
    textTone: "dark",
    rows: [
      { label: "1~4홀", weekday: "55,000원", weekend: "65,000원" },
      { label: "5홀", weekday: "110,000원", weekend: "120,000원" },
    ],
  },
  {
    variant: "year",
    title: "1년 정기권",
    description:
      "장기간 꾸준히 공간을 이용하는 분들을 위한 연간 이용 상품입니다. (팀 운영, 클래스 진행, 장기 프로젝트 등)",
    imagePath: "/special-offers/KakaoTalk_20260417_104245185_02.png",
    textTone: "light",
    rows: [
      { label: "1~4홀", weekday: "750,000원", weekend: "850,000원" },
      { label: "5홀", weekday: "1,500,000원", weekend: "1,600,000원" },
    ],
  },
] as const;

export default function SpecialOffersPage() {
  useEffect(() => {
    document.title = "특별혜택 · 316 spacebox";
  }, []);

  return (
    <main
      className="page-document special-offers"
      aria-labelledby="special-offers-heading"
    >
      <header className="special-offers__hero">
        <h1 id="special-offers-heading" className="special-offers__title">
          특별혜택
        </h1>
        <p className="special-offers__subtitle">
          댄스, 보컬, 촬영까지 원하는 방식으로 자유롭게 이용하세요. 1일 대여부터
          월·연 정기권까지 선택 가능합니다.
        </p>
      </header>

      <div className="special-offers__grid" role="list">
        {OFFERS.map((o) => (
          <article
            key={o.title}
            className={`special-offers__card special-offers__card--${o.variant}`}
            role="listitem"
            tabIndex={0}
          >
            <div
              className={`special-offers__ticket special-offers__ticket--${o.textTone}`}
            >
              <img
                src={o.imagePath}
                alt=""
                className="special-offers__ticket-image"
                loading="lazy"
                aria-hidden
              />
              <div className="special-offers__card-face">
                <div className="special-offers__ticket-top">
                  <h2 className="special-offers__card-title">{o.title}</h2>
                  <div className="special-offers__card-detail" aria-hidden>
                    <p className="special-offers__detail-title">평일 주말</p>
                    <ul className="special-offers__price-list">
                      {o.rows.map((row) => (
                        <li key={row.label} className="special-offers__price-item">
                          <span className="special-offers__price-label">
                            {row.label}
                          </span>
                          <span className="special-offers__price-value">
                            {row.weekday}
                          </span>
                          <span className="special-offers__price-value">
                            {row.weekend}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="special-offers__ticket-bottom">
                  <p className="special-offers__card-desc">{o.description}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
