// API 설정
const API_CONFIG = {
  // 개발 환경
  development: {
    baseURL: 'http://localhost:5001',
    timeout: 10000,
  },
  // 프로덕션 환경
  production: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
    timeout: 10000,
  },
};

// 현재 환경에 따른 설정
const currentEnv = process.env.NODE_ENV || 'development';
const config = API_CONFIG[currentEnv];

// API 엔드포인트들
export const API_ENDPOINTS = {
  // 인증
  AUTH: {
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
    REGISTER: '/api/auth/register',
  },
  // 사용자
  USERS: {
    LIST: '/api/users',
    DETAIL: (id) => `/api/users/${id}`,
    POINTS: (id) => `/api/users/${id}/points`,
    HISTORY: (id) => `/api/users/${id}/history`,
  },
  // 상품
  PRODUCTS: {
    LIST: '/api/products',
    ADMIN_LIST: '/api/products/admin',
    DETAIL: (id) => `/api/products/${id}`,
    TOGGLE: (id) => `/api/products/${id}/toggle`,
  },
  // 요청
  REQUESTS: {
    MY: '/api/requests/my',
    ADMIN: '/api/requests/admin',
    CREATE: '/api/requests',
    APPROVE: (id) => `/api/requests/${id}/approve`,
    REJECT: (id) => `/api/requests/${id}/reject`,
  },
  // 대시보드
  DASHBOARD: {
    ADMIN: '/api/dashboard/admin',
    USER: '/api/dashboard/user',
    STATS: '/api/dashboard/stats',
    MONTHLY_FLOW: '/api/dashboard/monthly-flow',
    PP_DISTRIBUTION: '/api/dashboard/pp-distribution',
  },
  // 헬스 체크
  HEALTH: '/api/health',
};

// API URL 생성 함수
export const getApiUrl = (endpoint) => {
  return `${config.baseURL}${endpoint}`;
};

// 기본 설정
export const API_CONFIG_EXPORT = config;

// API 요청 헬퍼 함수
export const apiRequest = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const token = localStorage.getItem('pokrew_token');

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    timeout: config.timeout,
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  console.log('API 요청:', {
    url,
    method: finalOptions.method || 'GET',
    headers: finalOptions.headers,
    body: finalOptions.body,
  });

  try {
    const response = await fetch(url, finalOptions);
    console.log('API 응답 상태:', response.status, response.statusText);

    const data = await response.json();
    console.log('API 응답 데이터:', data);

    if (!response.ok) {
      throw new Error(data.message || 'API 요청 실패');
    }

    return data;
  } catch (error) {
    console.error('API 요청 오류:', error);
    console.error('요청 URL:', url);
    console.error('요청 옵션:', finalOptions);
    throw error;
  }
};

const apiConfig = {
  getApiUrl,
  apiRequest,
  API_ENDPOINTS,
  config: API_CONFIG_EXPORT,
};

export default apiConfig;
