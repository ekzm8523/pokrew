const express = require('express');
const { db } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 모든 사용자 목록 조회 (관리자만)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  db.all(`
    SELECT 
      u.id, u.name, u.email, u.points, u.availablePoints, u.isAdmin, u.createdAt,
      (u.points - u.availablePoints) as pendingPoints
    FROM users u
    ORDER BY u.id
  `, (err, users) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
    res.json(users);
  });
});

// 특정 사용자 정보 조회 (관리자만)
router.get('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  db.get(
    'SELECT id, name, email, points, availablePoints, isAdmin, createdAt FROM users WHERE id = ?',
    [id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
      }

      if (!user) {
        return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }

      res.json(user);
    }
  );
});

// 사용자 포인트 수동 조정 (관리자만)
router.patch('/:id/points', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { type, amount, reason } = req.body;

  if (!type || !amount || !reason) {
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
  }

  if (type !== '입금' && type !== '출금') {
    return res.status(400).json({ message: '타입은 입금 또는 출금이어야 합니다.' });
  }

  const pointChange = type === '입금' ? amount : -amount;

  // 사용자 존재 확인
  db.get('SELECT points, availablePoints FROM users WHERE id = ?', [id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const newPoints = user.points + pointChange;
    const newAvailablePoints = user.availablePoints + pointChange;
    
    if (newPoints < 0) {
      return res.status(400).json({ message: '포인트가 부족합니다.' });
    }

    // 포인트 업데이트
    db.run(
      'UPDATE users SET points = ?, availablePoints = ? WHERE id = ?',
      [newPoints, newAvailablePoints, id],
      function(err) {
        if (err) {
          return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }

        // 포인트 내역 기록
        db.run(
          'INSERT INTO point_history (userId, type, amount, reason) VALUES (?, ?, ?, ?)',
          [id, type, amount, reason],
          function(err) {
            if (err) {
              return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
            }

            res.json({
              message: '포인트가 성공적으로 조정되었습니다.',
              newPoints,
              newAvailablePoints
            });
          }
        );
      }
    );
  });
});

// 사용자 포인트 내역 조회
router.get('/:id/history', authenticateToken, (req, res) => {
  const { id } = req.params;

  // 본인 또는 관리자만 조회 가능
  if (req.user.id != id && !req.user.isAdmin) {
    return res.status(403).json({ message: '권한이 없습니다.' });
  }

  db.all(
    'SELECT * FROM point_history WHERE userId = ? ORDER BY createdAt DESC',
    [id],
    (err, history) => {
      if (err) {
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
      }
      res.json(history);
    }
  );
});

// 사용자 삭제 (관리자만)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  // 본인 삭제 방지
  if (req.user.id == id) {
    return res.status(400).json({ message: '자신을 삭제할 수 없습니다.' });
  }

  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({ message: '사용자가 성공적으로 삭제되었습니다.' });
  });
});

module.exports = router; 