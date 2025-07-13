const express = require('express');
const { db } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 모든 상품 조회 (활성화된 상품만)
router.get('/', (req, res) => {
  db.all('SELECT * FROM products WHERE isActive = 1 ORDER BY id', (err, products) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
    res.json(products);
  });
});

// 모든 상품 조회 (관리자용 - 비활성화된 상품 포함)
router.get('/admin', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT * FROM products ORDER BY id', (err, products) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
    res.json(products);
  });
});

// 상품 생성 (관리자만)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const { name, price, description, link } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: '상품명과 가격은 필수입니다.' });
  }

  db.run(
    'INSERT INTO products (name, price, description, link) VALUES (?, ?, ?, ?)',
    [name, price, description, link],
    function(err) {
      if (err) {
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
      }

      res.status(201).json({
        message: '상품이 성공적으로 생성되었습니다.',
        productId: this.lastID
      });
    }
  );
});

// 상품 수정 (관리자만)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, price, description, link, isActive } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: '상품명과 가격은 필수입니다.' });
  }

  db.run(
    'UPDATE products SET name = ?, price = ?, description = ?, link = ?, isActive = ? WHERE id = ?',
    [name, price, description, link, isActive, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      }

      res.json({ message: '상품이 성공적으로 수정되었습니다.' });
    }
  );
});

// 상품 삭제 (관리자만)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }

    res.json({ message: '상품이 성공적으로 삭제되었습니다.' });
  });
});

// 상품 활성화/비활성화 토글 (관리자만)
router.patch('/:id/toggle', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  db.run(
    'UPDATE products SET isActive = CASE WHEN isActive = 1 THEN 0 ELSE 1 END WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      }

      res.json({ message: '상품 상태가 변경되었습니다.' });
    }
  );
});

module.exports = router; 