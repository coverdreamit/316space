# 316space-be

[316tower 홈(Canva)](https://316tower.my.canva.site/home)를 대체하는 **316space** 프로젝트의 백엔드 API입니다. 프론트에서 필요한 데이터·폼 처리·연동 로직을 여기서 제공합니다.

## 스택

- Spring Boot 3.4  
- Java 17  
- Maven  
- HTTP 포트: **7001** (`application.yml`의 `server.port`)

## API 베이스 경로

컨트롤러는 `/api` 아래에 둡니다.

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 서비스 상태 확인 |

추가 엔드포인트는 `com.space316.be.api` 패키지 등에 확장하면 됩니다.

## 실행

```bash
mvn spring-boot:run
```

헬스 확인:

```bash
curl http://localhost:7001/api/health
```

## 빌드

```bash
mvn -DskipTests package
```

실행 JAR은 `target/`에 생성됩니다.

```bash
java -jar target/space-be-0.0.1-SNAPSHOT.jar
```

(아티팩트 버전은 `pom.xml`의 `<version>`과 동일합니다.)

## 프론트엔드와 함께 개발할 때

로컬에서 `316space-fe`를 켜 두면, Vite가 `/api`를 이 서버(`7001`)로 넘깁니다. CORS는 개발 프록시로 우회되므로, 별도 CORS 설정 없이도 로컬 연동이 가능합니다. 프로덕션에서 도메인이 나뉘면 CORS 또는 동일 출처 배치 전략을 맞춰야 합니다.

## 모노레포 위치

저장소 루트의 `316space-be` 디렉터리입니다. 저장소 전체 설명은 [상위 README](../README.md)를 참고하세요.

## 레퍼런스

- 대체 대상(콘텐츠·구조 참고): [316tower.my.canva.site/home](https://316tower.my.canva.site/home)
