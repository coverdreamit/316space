# 316space-fe

**316스페이스** 홈페이지의 프론트엔드입니다. Vite + React로 공개 페이지·랜딩·내부 링크를 구성합니다.

*(초기 UI·문구는 기존 [316tower Canva 사이트](https://316tower.my.canva.site/home)를 참고해 구현했습니다.)*

## 스택

- React 19, TypeScript  
- Vite 8  
- 개발 서버 포트: **3000** (`pnpm preview`는 `--port 3000 --host`로 동일 포트·도커 Nginx에서 접근 가능)

## 백엔드와의 연동

`vite.config.ts`에서 `/api`를 `http://localhost:8080`로 프록시합니다. API 호출 시 브라우저에서는 상대 경로만 사용하면 됩니다.

```ts
// 예: fetch('/api/health')
```

백엔드를 먼저 띄우지 않으면 API 요청은 실패할 수 있습니다. 정적 UI만 볼 때는 프론트만 실행해도 됩니다.

## 실행

```bash
pnpm install
pnpm dev
```

브라우저: `http://localhost:3000`

## 스크립트

| 명령 | 설명 |
|------|------|
| `pnpm dev` | 개발 서버 (HMR) |
| `pnpm build` | 프로덕션 빌드 (`dist/`) |
| `pnpm preview` | 빌드 결과 미리보기 |
| `pnpm lint` | ESLint |

## 빌드 산출물

`pnpm build` 후 `dist/`가 생성됩니다. 정적 호스팅(Nginx, S3+CDN 등) 또는 백엔드 정적 리소스로 배포할 수 있습니다.

## 모노레포 위치

저장소 루트의 `316space-fe` 디렉터리입니다. 전체 목적·실행 순서는 [상위 README](../README.md)를 참고하세요.

## 참고

- 이전 공개 페이지(참고용): [316tower.my.canva.site/home](https://316tower.my.canva.site/home)
