import { useEffect } from 'react'
import { facilityFeatures, spaceIntro } from '../data/halls'

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About · 316 SPACE'
  }, [])

  return (
    <main className="page-document">
      <header className="page-document__hero">
        <p className="page-document__eyebrow">316 SPACE</p>
        <h1 className="page-document__title">About</h1>
        <p className="page-document__lead">316 스페이스를 소개합니다.</p>
      </header>

      <p className="page-document__prose">{spaceIntro}</p>

      <section className="page-document__section" aria-labelledby="about-features-heading">
        <h2 id="about-features-heading" className="page-document__section-title">
          시설 특징
        </h2>
        <ul className="about-features">
          {facilityFeatures.map(({ title, imageSrc, alt }) => (
            <li key={title} className="about-feature-card">
              <div className="about-feature-card__media">
                <img
                  className="about-feature-card__photo"
                  src={imageSrc}
                  alt={alt}
                  width={1200}
                  height={750}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="about-feature-card__title">{title}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
