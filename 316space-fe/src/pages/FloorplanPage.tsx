import { useEffect } from 'react'
import { halls } from '../data/halls'

export default function FloorplanPage() {
  useEffect(() => {
    document.title = '평면도 · 316 SPACE'
  }, [])

  return (
    <main className="page-document">
      <header className="page-document__hero">
        <h1 className="page-document__title">평면도 및 비상탈출로</h1>
        <p className="page-document__lead">
          평면도 이미지는 준비되는 대로 이 영역에 배치하면 됩니다.
        </p>
      </header>

      <div className="floorplan-placeholder" role="img" aria-label="평면도 자리">
        <span>Floor plan</span>
      </div>

      <section className="page-document__section" aria-labelledby="floorplan-rooms-heading">
        <h2 id="floorplan-rooms-heading" className="page-document__section-title">
          Rooms
        </h2>
        <div className="room-grid room-grid--compact">
          {halls.map((h) => (
            <article key={h.id} className="room-card room-card--compact">
              <p className="room-card__slug">{h.slug}</p>
              <h3 className="room-card__name">{h.name}</h3>
              <p className="room-card__guests">{h.guests}</p>
              <p className="room-card__price">{h.price}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
