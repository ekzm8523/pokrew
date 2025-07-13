const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// 데이터베이스 파일 생성
const db = new sqlite3.Database('./pokrew.db');

// 테이블 생성 함수
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    // 사용자 테이블 - points(현재 PP)와 availablePoints(사용 가능한 PP) 구분
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        points INTEGER DEFAULT 1500,
        availablePoints INTEGER DEFAULT 1500,
        isAdmin BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        reject(err);
      } else {
        // 기존 테이블에 새 컬럼 추가 (마이그레이션)
        migrateDatabase().then(() => {
          // 초기 데이터 삽입
          insertInitialData().then(resolve).catch(reject);
        }).catch(reject);
      }
    });

    // 상품 테이블
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        price INTEGER NOT NULL,
        description TEXT,
        link TEXT,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 요청 테이블 - pendingAmount(임시 보관 PP) 추가
    db.run(`
      CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        pendingAmount INTEGER DEFAULT 0,
        status TEXT DEFAULT '대기중',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id),
        FOREIGN KEY (productId) REFERENCES products (id)
      )
    `);

    // 포인트 내역 테이블
    db.run(`
      CREATE TABLE IF NOT EXISTS point_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        reason TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id)
      )
    `, (err) => {
      if (err) {
        reject(err);
      } else {
        // 기존 테이블에 새 컬럼 추가 (마이그레이션)
        migrateDatabase().then(() => {
          // 초기 데이터 삽입
          insertInitialData().then(resolve).catch(reject);
        }).catch(reject);
      }
    });
  });
};

// 데이터베이스 마이그레이션
const migrateDatabase = () => {
  return new Promise((resolve, reject) => {
    // users 테이블에 새 컬럼 추가
    db.run(`ALTER TABLE users ADD COLUMN availablePoints INTEGER DEFAULT 1500`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.log('availablePoints 컬럼이 이미 존재합니다.');
      }
    });

    // requests 테이블에 새 컬럼 추가
    db.run(`ALTER TABLE requests ADD COLUMN pendingAmount INTEGER DEFAULT 0`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.log('pendingAmount 컬럼이 이미 존재합니다.');
      }
    });

    // 기존 데이터 마이그레이션
    db.run(`UPDATE users SET availablePoints = points WHERE availablePoints IS NULL`, (err) => {
      if (err) {
        console.log('사용자 데이터 마이그레이션 오류:', err);
      }
    });

    resolve();
  });
};

// 초기 데이터 삽입
const insertInitialData = async () => {
  // 기본 사용자 생성
  const hashedPassword = await bcrypt.hash('1234', 10);
  
  db.run(`
    INSERT OR IGNORE INTO users (name, email, password, points, availablePoints, isAdmin) VALUES 
    ('관리자', 'admin@test.com', ?, 1500, 1500, 1),
    ('일반회원', 'user@test.com', ?, 1500, 1500, 0)
  `, [hashedPassword, hashedPassword]);

  // 기존 상품 개수 확인 후 기본 상품 생성 (중복 방지)
  db.get('SELECT COUNT(*) as count FROM products', (err, result) => {
    if (err) {
      console.error('상품 개수 확인 오류:', err);
      return;
    }

    // 상품이 없을 때만 기본 상품 추가
    if (result.count === 0) {
      const defaultProducts = [
        { name: '홀덤 칩 세트', price: 500, description: '고급 홀덤 칩 세트 (500개)', link: 'https://example.com/chips' },
        { name: '카드 덱', price: 300, description: '내구성 좋은 카드 덱', link: 'https://example.com/cards' },
        { name: '홀덤 테이블', price: 800, description: '접이식 홀덤 테이블', link: 'https://example.com/table' }
      ];

      for (const product of defaultProducts) {
        db.run(`
          INSERT INTO products (name, price, description, link, isActive) 
          VALUES (?, ?, ?, ?, 1)
        `, [product.name, product.price, product.description, product.link], (err) => {
          if (err) {
            console.error('기본 상품 추가 오류:', err);
          }
        });
      }
      console.log('기본 상품 3개가 추가되었습니다.');
    } else {
      console.log(`이미 ${result.count}개의 상품이 존재합니다. 기본 상품을 추가하지 않습니다.`);
    }
  });
};

module.exports = { db, initDatabase }; 