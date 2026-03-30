export type Hall = {
  id: string
  name: string
  slug: string
  guests: string
  price: string
  area: string
  /** 공개 정적 경로, 예: `/studio/s-1.png` */
  photoSrc: string
}

export const halls: Hall[] = [
  {
    id: 's-1',
    name: 'S-1 HALL',
    slug: 's-1 hall',
    guests: 'Max 2 Guests / 1',
    price: '8000원/1시간',
    area: '1인~2인 연습이 가능한 5평 연습실',
    photoSrc: '/studio/s-1.png',
  },
  {
    id: 's-2',
    name: 'S-2 HALL',
    slug: 's-2 hall',
    guests: 'Max 2 Guests / 1',
    price: '8000원/1시간',
    area: '1인~2인 연습이 가능한 5평 연습실',
    photoSrc: '/studio/s-2.png',
  },
  {
    id: 's-3',
    name: 'S-3 HALL',
    slug: 's-3 hall',
    guests: 'Max 3 Guests / 1',
    price: '8000원/1시간',
    area: '1인~3인 연습이 가능한 5평 연습실',
    photoSrc: '/studio/s-3.png',
  },
  {
    id: 's-4',
    name: 'S-4 HALL',
    slug: 's-4 hall',
    guests: 'Max 2 Guests / 1',
    price: '8000원/1시간',
    area: '1인~2인 연습이 가능한 5평 연습실',
    photoSrc: '/studio/s-4.png',
  },
  {
    id: 's-5',
    name: 'S-5 HALL',
    slug: 's-5 hall',
    guests: 'Max 8 Guests / 1',
    price: '16000원/1시간',
    area: '5인이상이 가능한 연습이 가능한 연습실',
    photoSrc: '/studio/s-5.png',
  },
]

export const spaceIntro =
  '단순한 연습실을 넘어, 316 spacebox는 미디어 콘텐츠 제작과 안무 영상 촬영에 최적화된 캔버스입니다. 눈부시게 밝은 화이트 톤의 특수 바닥과 공간을 압도하는 조명은 스마트폰 카메라만으로도 스튜디오급의 수준 높은 영상 결과물을 만들어냅니다. 개인의 섬세한 안무부터 다인원의 에너지 넘치는 군무, 그리고 전문적인 촬영까지. 316 spacebox에서 당신만의 작업을 완성해 보세요.'

export const facilityBullets = [
  '24/7 연중무휴 24시간운영',
  '냉난방/발레바/요가매트등 최신식 시설구비',
  '최신 전자식 키보드 구비완료',
] as const
