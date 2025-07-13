# Pokrew PP 관리 시스템 백엔드

홀덤 동호회 PP(포인트) 관리 시스템의 백엔드 API 서버입니다.

## 기술 스택

- Node.js
- Express.js
- SQLite3
- JWT (인증)
- bcryptjs (비밀번호 암호화)

## 설치 및 실행

1. 의존성 설치:
```bash
cd server
npm install
```

2. 서버 실행:
```bash
# 개발 모드 (nodemon 사용)
npm run dev

# 프로덕션 모드
npm start
```

서버는 기본적으로 포트 5000에서 실행됩니다.

## 기본 계정

- **관리자**: admin@test.com / 1234
- **일반회원**: user@test.com / 1234

## API 엔드포인트

### 인증 (Auth)

- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 사용자 정보 조회
- `POST /api/auth/register` - 회원가입 (관리자만)

### 상품 관리 (Products)

- `GET /api/products` - 활성화된 상품 목록 조회
- `GET /api/products/admin` - 모든 상품 목록 조회 (관리자)
- `POST /api/products` - 상품 생성 (관리자)
- `PUT /api/products/:id` - 상품 수정 (관리자)
- `DELETE /api/products/:id` - 상품 삭제 (관리자)
- `PATCH /api/products/:id/toggle` - 상품 활성화/비활성화 (관리자)

### 요청 관리 (Requests)

- `GET /api/requests/my` - 내 요청 목록 조회
- `GET /api/requests/admin` - 모든 요청 목록 조회 (관리자)
- `POST /api/requests` - 새로운 요청 생성
- `PATCH /api/requests/:id/approve` - 요청 승인 (관리자)
- `PATCH /api/requests/:id/reject` - 요청 거부 (관리자)

### 사용자 관리 (Users)

- `GET /api/users` - 모든 사용자 목록 조회 (관리자)
- `GET /api/users/:id` - 특정 사용자 정보 조회 (관리자)
- `PATCH /api/users/:id/points` - 사용자 포인트 조정 (관리자)
- `GET /api/users/:id/history` - 사용자 포인트 내역 조회
- `DELETE /api/users/:id` - 사용자 삭제 (관리자)

### 대시보드 (Dashboard)

- `GET /api/dashboard/admin` - 관리자 대시보드 통계
- `GET /api/dashboard/user` - 사용자 대시보드 통계
- `GET /api/dashboard/stats` - 전체 통계 (관리자)

## 데이터베이스 스키마

### users 테이블
- id (PRIMARY KEY)
- name (사용자 이름)
- email (이메일, UNIQUE)
- password (암호화된 비밀번호)
- points (보유 PP)
- isAdmin (관리자 여부)
- createdAt (생성일시)

### products 테이블
- id (PRIMARY KEY)
- name (상품명)
- price (가격)
- description (설명)
- link (링크)
- isActive (활성화 여부)
- createdAt (생성일시)

### requests 테이블
- id (PRIMARY KEY)
- userId (사용자 ID, FOREIGN KEY)
- productId (상품 ID, FOREIGN KEY)
- quantity (수량)
- amount (총 금액)
- status (상태: 대기중/승인됨/거부됨)
- createdAt (생성일시)

### point_history 테이블
- id (PRIMARY KEY)
- userId (사용자 ID, FOREIGN KEY)
- type (타입: 입금/출금)
- amount (금액)
- reason (사유)
- createdAt (생성일시)

## 인증

모든 보호된 엔드포인트는 JWT 토큰이 필요합니다. 요청 헤더에 다음과 같이 포함하세요:

```
Authorization: Bearer <your-jwt-token>
```

## 에러 응답

모든 API는 일관된 에러 응답 형식을 사용합니다:

```json
{
  "message": "에러 메시지"
}
```

## 개발 환경 설정

1. `.env` 파일 생성 (선택사항):
```
JWT_SECRET=your-secret-key
PORT=5000
```

2. 데이터베이스 파일은 자동으로 생성됩니다 (`pokrew.db`) 