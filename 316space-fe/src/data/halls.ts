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
    photoSrc: '/studio/thumbs/s-1.webp',
  },
  {
    id: 's-2',
    name: 'S-2 HALL',
    slug: 's-2 hall',
    guests: 'Max 2 Guests / 1',
    price: '8000원/1시간',
    area: '1인~2인 연습이 가능한 5평 연습실',
    photoSrc: '/studio/thumbs/s-2.webp',
  },
  {
    id: 's-3',
    name: 'S-3 HALL',
    slug: 's-3 hall',
    guests: 'Max 3 Guests / 1',
    price: '8000원/1시간',
    area: '1인~3인 연습이 가능한 5평 연습실',
    photoSrc: '/studio/thumbs/s-3.webp',
  },
  {
    id: 's-4',
    name: 'S-4 HALL',
    slug: 's-4 hall',
    guests: 'Max 2 Guests / 1',
    price: '8000원/1시간',
    area: '1인~2인 연습이 가능한 5평 연습실',
    photoSrc: '/studio/thumbs/s-4.webp',
  },
  {
    id: 's-5',
    name: 'S-5 HALL',
    slug: 's-5 hall',
    guests: 'Max 8 Guests / 1',
    price: '16000원/1시간',
    area: '5인이상이 가능한 연습이 가능한 연습실',
    photoSrc: '/studio/thumbs/s-5.webp',
  },
]
