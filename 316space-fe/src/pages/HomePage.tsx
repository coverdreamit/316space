import { useEffect } from 'react'

export default function HomePage() {
  useEffect(() => {
    document.title = 'Home · 316 SPACE'
  }, [])

  return (
    <>
      <main className="site-main">
        <div className="hero-visual" aria-hidden />
        <div className="hero-copy">
          <p className="eyebrow">316 SPACE</p>
          <h1 className="title">Luxury Space Rent</h1>
          <p className="location">Grand City</p>
          <p className="closing">316 SPACE.</p>
        </div>
      </main>
    </>
  )
}
