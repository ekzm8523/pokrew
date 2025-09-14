# Pokrew Server (Kotlin Spring Boot)

홀덤 포커 클럽을 위한 포인트(PP) 관리 시스템의 Kotlin Spring Boot 백엔드입니다.

## 🚀 시작하기

### 요구사항
- Java 17+
- Kotlin 1.9+
- Spring Boot 3.2+

### 실행 방법

```bash
# 프로젝트 빌드
./gradlew build

# 서버 실행
./gradlew bootRun
```

서버는 `http://localhost:5001`에서 실행됩니다.

## 🏗️ 프로젝트 구조

```
src/main/kotlin/com/pokrew/server/
├── config/               # Spring 설정 클래스들
├── controller/           # REST API 컨트롤러들
├── dto/                 # 데이터 전송 객체들
├── entity/              # JPA 엔티티들
├── exception/           # 커스텀 예외 클래스들
├── repository/          # Spring Data JPA 리포지토리들
├── security/            # Spring Security & JWT 관련 클래스들
└── service/             # 비즈니스 로직 서비스들
```

## 🔧 주요 기술 스택
