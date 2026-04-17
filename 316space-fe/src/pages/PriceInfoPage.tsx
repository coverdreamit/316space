const priceRows = [
  { hall: '1~4홀', weekday: '8,000원', weekend: '9,000원' },
  { hall: '5홀(대형룸)', weekday: '16,000원', weekend: '17,000원' },
] as const

export default function PriceInfoPage() {
  return (
    <main className="page-document page-document--price-information">
      <section className="price-information" aria-labelledby="price-information-title">
        <h1 id="price-information-title" className="price-information__title">
          Price Information
        </h1>

        <div className="price-information__table-wrap">
          <table className="price-information__table" aria-label="홀별 이용 요금표">
            <caption className="sr-only">1시간 기준 가격표</caption>
            <colgroup>
              <col className="price-information__col--hall" />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr className="price-information__duration-row">
                <th colSpan={3} scope="colgroup">
                  1시간 기준
                </th>
              </tr>
              <tr className="price-information__header-row">
                <th scope="col">Hall</th>
                <th scope="col">평일(월~금)</th>
                <th scope="col">주말/공휴일(토,일)</th>
              </tr>
            </thead>
            <tbody>
              {priceRows.map(row => (
                <tr key={row.hall}>
                  <th scope="row">{row.hall}</th>
                  <td>{row.weekday}</td>
                  <td>{row.weekend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="price-information__note">
          최소 예약 시간 1시간 / 연장 시 동일 요금 적용 / 예약은 선착순으로 진행 / 시설 이용 후 정리 필수
        </p>
      </section>
    </main>
  )
}
