const express = require('express');
const { db } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 사용자의 요청 목록 조회
router.get('/my', authenticateToken, (req, res) => {
  const query = `
    SELECT r.*, p.name as productName, p.link as productLink
    FROM requests r
    JOIN products p ON r.productId = p.id
    WHERE r.userId = ?
    ORDER BY r.createdAt DESC
  `;

  db.all(query, [req.user.id], (err, requests) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
    res.json(requests);
  });
});

// 모든 요청 목록 조회 (관리자용)
router.get('/admin', authenticateToken, requireAdmin, (req, res) => {
  const query = `
    SELECT r.*, u.name as userName, p.name as productName, p.link as productLink
    FROM requests r
    JOIN users u ON r.userId = u.id
    JOIN products p ON r.productId = p.id
    ORDER BY r.createdAt DESC
  `;

  db.all(query, (err, requests) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
    res.json(requests);
  });
});

// 새로운 요청 생성
router.post('/', authenticateToken, (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ message: '상품과 수량을 올바르게 입력해주세요.' });
  }

  // 상품 정보 조회
  db.get('SELECT * FROM products WHERE id = ? AND isActive = 1', [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }

    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }

    const totalAmount = product.price * quantity;

    // 사용자의 사용 가능한 PP 확인
    db.get('SELECT availablePoints FROM users WHERE id = ?', [req.user.id], (err, user) => {
      if (err) {
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
      }

      if (user.availablePoints < totalAmount) {
        return res.status(400).json({ message: '사용 가능한 PP가 부족합니다.' });
      }

      // 트랜잭션 시작
      db.serialize(() => {
        // 요청 생성 (임시 보관 PP 설정)
        db.run(
          'INSERT INTO requests (userId, productId, quantity, amount, pendingAmount) VALUES (?, ?, ?, ?, ?)',
          [req.user.id, productId, quantity, totalAmount, totalAmount],
          function(err) {
            if (err) {
              return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
            }

            // 사용자의 사용 가능한 PP에서 임시 보관
            db.run(
              'UPDATE users SET availablePoints = availablePoints - ? WHERE id = ?',
              [totalAmount, req.user.id],
              function(err) {
                if (err) {
                  return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
                }

                res.status(201).json({
                  message: '요청이 성공적으로 생성되었습니다.',
                  requestId: this.lastID
                });
              }
            );
          }
        );
      });
    });
  });
});

// 요청 승인 (관리자만)
router.patch('/:id/approve', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  // 요청 정보 조회
  db.get('SELECT * FROM requests WHERE id = ? AND status = "대기중"', [id], (err, request) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }

    if (!request) {
      return res.status(404).json({ message: '승인할 수 있는 요청을 찾을 수 없습니다.' });
    }

    // 트랜잭션 시작
    db.serialize(() => {
      // 포인트 차감 (currentPoints에서 차감)
      db.run(
        'UPDATE users SET points = points - ? WHERE id = ?',
        [request.pendingAmount, request.userId],
        function(err) {
          if (err) {
            return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
          }

          // 요청 상태 변경 (임시 보관 PP 해제)
          db.run(
            'UPDATE requests SET status = "승인됨", pendingAmount = 0 WHERE id = ?',
            [id],
            function(err) {
              if (err) {
                return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
              }

              // 포인트 내역 기록
              db.run(
                'INSERT INTO point_history (userId, type, amount, reason) VALUES (?, ?, ?, ?)',
                [request.userId, '출금', request.amount, `상품 구매 요청 승인 (요청 ID: ${id})`]
              );

              res.json({ message: '요청이 승인되었습니다.' });
            }
          );
        }
      );
    });
  });
});

// 요청 거부 (관리자만)
router.patch('/:id/reject', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  // 요청 정보 조회
  db.get('SELECT * FROM requests WHERE id = ? AND status = "대기중"', [id], (err, request) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }

    if (!request) {
      return res.status(404).json({ message: '거부할 수 있는 요청을 찾을 수 없습니다.' });
    }

    // 트랜잭션 시작
    db.serialize(() => {
      // 임시 보관된 PP를 사용 가능한 PP로 반환
      db.run(
        'UPDATE users SET availablePoints = availablePoints + ? WHERE id = ?',
        [request.pendingAmount, request.userId],
        function(err) {
          if (err) {
            return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
          }

          // 요청 상태 변경 (임시 보관 PP 해제)
          db.run(
            'UPDATE requests SET status = "거부됨", pendingAmount = 0 WHERE id = ?',
            [id],
            function(err) {
              if (err) {
                return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
              }

              res.json({ message: '요청이 거부되었습니다.' });
            }
          );
        }
      );
    });
  });
});

module.exports = router; 