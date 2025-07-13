const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./database');

// 라우터 import
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const requestRoutes = require('./routes/requests');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS 설정 - 더 강력한 설정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());

// 라우터 설정
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({ message: '서버가 정상적으로 실행 중입니다.' });
});

// 데이터베이스 초기화 및 서버 시작
initDatabase()
  .then(() => {
    console.log('데이터베이스가 성공적으로 초기화되었습니다.');
    
    app.listen(PORT, () => {
      // 실제 서비스에서는 불필요한 안내 메시지 제거
      // console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
      // console.log(`API 서버: http://localhost:${PORT}`);
      // console.log('기본 계정:');
      // console.log('- 관리자: admin@test.com / 1234');
      // console.log('- 일반회원: user@test.com / 1234');
    });
  })
  .catch((err) => {
    console.error('데이터베이스 초기화 실패:', err);
    process.exit(1);
  });

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
});

// 404 핸들링
app.use('*', (req, res) => {
  res.status(404).json({ message: '요청한 엔드포인트를 찾을 수 없습니다.' });
}); 