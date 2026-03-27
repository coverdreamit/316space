# 316space

[316tower 홈(Canva 사이트)](https://316tower.my.canva.site/home)를 **자체 호스팅 웹앱으로 대체**하기 위한 저장소입니다. 디자인·콘텐츠는 해당 사이트를 기준으로 옮기거나 재구현하고, 배포·도메인·API는 이 프로젝트에서 관리합니다.

**저장소:** [github.com/coverdreamit/316space](https://github.com/coverdreamit/316space)

## 목표

- Canva에 묶인 랜딩/소개 페이지를 **React 기반 프론트**로 이전
- 폼·동적 데이터·연동이 필요할 때를 대비한 **Spring Boot API**
- 버전 관리·CI·스테이징/프로덕션 환경을 코드로 일관되게 운영

## 구성

| 디렉터리 | 역할 | 자세한 설명 |
|----------|------|-------------|
| [`316space-fe`](316space-fe/README.md) | 공개 웹 UI (Vite + React) | [프론트 README](316space-fe/README.md) |
| [`316space-be`](316space-be/README.md) | REST API (Spring Boot) | [백엔드 README](316space-be/README.md) |

개발 시 프론트(`7000`)가 `/api` 요청을 백엔드(`7001`)로 프록시합니다.

## 빠른 시작

```bash
# 백엔드 (터미널 1)
cd 316space-be
mvn spring-boot:run

# 프론트 (터미널 2)
cd 316space-fe
pnpm install
pnpm dev
```

- 프론트: `http://localhost:7000`
- API 헬스: `GET http://localhost:7001/api/health`

## 사전 요구 사항

- Node.js (LTS 권장), pnpm (`corepack enable` 후 사용 권장)  
- JDK 17, Apache Maven  

## 버전 관리

```bash
git clone https://github.com/coverdreamit/316space.git
cd 316space
```

## 참고 링크

- 대체 대상(레퍼런스): [316tower.my.canva.site/home](https://316tower.my.canva.site/home)
