import { useEffect } from "react";
import { facilityBullets, halls, spaceIntro } from "../data/halls";

export default function StudioPage() {
  useEffect(() => {
    document.title = "연습실 소개 · 316 SPACE";
  }, []);

  return (
    <main className="page-document">
      <header className="page-document__hero">
        <p className="page-document__eyebrow">Rooms</p>
        <h1 className="page-document__title">연습실 소개</h1>
        <p className="page-document__lead">호실별 안내</p>
      </header>

      <p className="page-document__prose">{spaceIntro}</p>

      <ul className="page-document__bullets">
        {facilityBullets.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>

      <section
        className="page-document__section"
        aria-labelledby="studio-facilities-heading"
      >
        <h2
          id="studio-facilities-heading"
          className="page-document__section-title"
        >
          시설 및 현황
        </h2>
      </section>

      <section
        className="page-document__section"
        aria-labelledby="studio-status-heading"
      >
        <h2 id="studio-status-heading" className="page-document__section-title">
          연습실 현황
        </h2>
        <div className="room-grid room-grid--studio-halls">
          {halls.map((h) => (
            <article
              key={h.id}
              className={
                h.id === "s-5"
                  ? "room-card room-card--studio room-card--studio-wide"
                  : "room-card room-card--studio"
              }
            >
              <div className="room-card__media">
                <img
                  className="room-card__photo"
                  src={h.photoSrc}
                  alt={`${h.name} 연습실 내부`}
                  width={1024}
                  height={682}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="room-card__body">
                <p className="room-card__slug">{h.slug}</p>
                <h3 className="room-card__name">{h.name}</h3>
                <p className="room-card__guests">{h.guests}</p>
                <p className="room-card__price">{h.price}</p>
                <p className="room-card__area">{h.area}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
