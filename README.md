# Pokrew PP 관리 시스템

홀덤 포커 클럽을 위한 포인트(PP) 관리 시스템입니다.

## 🚀 시작하기

### 백엔드 서버 실행
```bash
cd server
npm install
PORT=5001 node server.js
```

### 프론트엔드 실행
```bash
npm install
npm start
```

## 📋 기본 계정

- **관리자**: admin@test.com / 1234
- **일반회원**: user@test.com / 1234

## 🔧 API 설정 관리

### 중앙 설정 파일
모든 API 엔드포인트와 설정은 `src/config/api.js`에서 관리됩니다.

```javascript
// API 설정
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:5001',
    timeout: 10000,
  },
  production: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
    timeout: 10000,
  }
};
```

### 환경별 설정 변경
1. **개발 환경**: `src/config/api.js`의 `development` 객체 수정
2. **프로덕션 환경**: 환경 변수 `REACT_APP_API_URL` 설정

### API 엔드포인트 사용법
```javascript
import { apiRequest, API_ENDPOINTS } from '../config/api';

// GET 요청
const data = await apiRequest(API_ENDPOINTS.AUTH.ME);

// POST 요청
const result = await apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});

// 동적 엔드포인트
const history = await apiRequest(API_ENDPOINTS.USERS.HISTORY(userId));
```

## 🏗️ 프로젝트 구조

```
pokrew/
├── src/
│   ├── config/
│   │   └── api.js          # API 설정 중앙 관리
│   ├── components/
│   │   ├── LoginPage.js
│   │   ├── Dashboard.js
│   │   ├── MemberList.js
│   │   ├── MemberDetail.js
│   │   ├── MyPage.js
│   │   ├── AdminPage.js
│   │   ├── RequestPage.js
│   │   ├── RequestManagementPage.js
│   │   ├── ProductManagementPage.js
│   │   ├── PointForm.js
│   │   ├── Navbar.js
│   │   └── Sidebar.js
│   └── App.js
├── server/
│   ├── routes/
│   ├── middleware/
│   ├── database.js
│   └── server.js
└── README.md
```

## 🔄 리팩토링 완료

### 변경 사항
- ✅ 하드코딩된 API URL 제거
- ✅ 중앙 API 설정 파일 생성 (`src/config/api.js`)
- ✅ 모든 컴포넌트에서 통일된 API 호출 방식 적용
- ✅ 환경별 설정 지원 (개발/프로덕션)
- ✅ 에러 처리 개선
- ✅ 토큰 자동 첨부

### 사용된 컴포넌트
- LoginPage.js
- App.js
- Dashboard.js
- MemberDetail.js
- MyPage.js
- RequestPage.js
- RequestManagementPage.js
- ProductManagementPage.js
- AdminPage.js

## 🛠️ 기술 스택

- **프론트엔드**: React, Material-UI
- **백엔드**: Node.js, Express
- **데이터베이스**: SQLite
- **인증**: JWT, bcrypt

## 📝 주요 기능

- 사용자 인증 (로그인/로그아웃)
- 역할 기반 접근 제어 (관리자/일반회원)
- PP 포인트 관리
- 상품 관리
- PP 사용 요청 및 승인/거부
- 대시보드 통계
- 회원 관리
