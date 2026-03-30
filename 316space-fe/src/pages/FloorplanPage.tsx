import { useEffect } from 'react'

export default function FloorplanPage() {
  useEffect(() => {
    document.title = '평면도 · 316 SPACE'
  }, [])

  return (
    <main className="page-document">
      <header className="page-document__hero">
        <h1 className="page-document__title">평면도 및 비상탈출로</h1>
        <p className="page-document__lead">
          층 전체 배치, 승강기·계단, 비상탈출 동선을 한눈에 확인할 수 있습니다.
        </p>
      </header>

      <figure className="floorplan-figure">
        <img
          className="floorplan-image"
          src="/floorplan.png"
          alt="316 SPACE 층 평면도. 중앙 코어에 승강기와 계단, 좌우 개방 공간, MDF실·기계실 등이 표시되어 있으며 비상탈출로가 안내됩니다."
          width={1024}
          height={575}
          loading="lazy"
          decoding="async"
        />
      </figure>
    </main>
  )
}
