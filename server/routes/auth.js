const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../database');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 로그인
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
  }

  db.get('SELECT id, name, email, password, points, availablePoints, isAdmin, createdAt FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }

    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    console.log('DB에서 가져온 user 객체:', user);
    console.log('user 객체의 모든 키:', Object.keys(user));
    console.log('availablePoints 값:', user.availablePoints);
    console.log('createdAt 값:', user.createdAt);

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const token = generateToken(user);
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      points: user.points,
      availablePoints: user.availablePoints,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    };
    
    console.log('응답으로 보낼 user 객체:', userResponse);
    
    res.json({
      token,
      user: userResponse
    });
  });
});

// 사용자 정보 조회
router.get('/me', authenticateToken, (req, res) => {
  db.get('SELECT id, name, email, points, availablePoints, isAdmin, createdAt FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({ user });
  });
});

// 회원가입 (관리자만 가능)
router.post('/register', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: '관리자만 회원을 추가할 수 있습니다.' });
  }

  const { name, email, password, isAdmin = false } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }

    db.run(
      'INSERT INTO users (name, email, password, points, availablePoints, isAdmin) VALUES (?, ?, ?, 1500, 1500, ?)',
      [name, email, hashedPassword, isAdmin],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
          }
          return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }

        res.status(201).json({ 
          message: '회원이 성공적으로 추가되었습니다.',
          userId: this.lastID 
        });
      }
    );
  });
});

module.exports = router; 