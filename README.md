# 316space

프론트엔드(Vite + React)와 백엔드(Spring Boot)로 구성된 모노레포입니다.

**저장소:** [github.com/coverdreamit/316space](https://github.com/coverdreamit/316space)

## 구성

| 디렉터리 | 스택 | 개발 서버 |
|----------|------|-----------|
| `316space-fe` | React 19, TypeScript, Vite 8 | `http://localhost:7000` |
| `316space-be` | Spring Boot 3.4, Java 17 | `http://localhost:7001` |

개발 시 Vite가 `/api` 요청을 `http://localhost:7001`로 프록시합니다.

## 사전 요구 사항

- **프론트:** Node.js (권장 LTS), Yarn 또는 npm
- **백엔드:** JDK 17, Apache Maven

## 실행 방법

### 백엔드

```bash
cd 316space-be
mvn spring-boot:run
```

헬스 체크: `GET http://localhost:7001/api/health`

### 프론트엔드

```bash
cd 316space-fe
yarn install
yarn dev
```

브라우저에서 `http://localhost:7000` 을 엽니다.

### 빌드

```bash
# 프론트 프로덕션 빌드
cd 316space-fe
yarn build

# 백엔드 JAR
cd 316space-be
mvn -DskipTests package
```

## 버전 관리

```bash
git clone https://github.com/coverdreamit/316space.git
cd 316space
```
