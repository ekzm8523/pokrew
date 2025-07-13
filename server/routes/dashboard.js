const express = require('express');
const { db } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * API 응답 명세
 * 
 * GET /api/dashboard/admin (관리자용)
 * 응답: {
 *   totalMembers: number,           // 전체 회원 수
 *   totalPoints: number,            // 총 PP (현재 PP + 임시 보관 PP)
 *   totalAvailablePoints: number,   // 총 사용 가능한 PP
 *   totalPendingPoints: number,     // 총 임시 보관 PP
 *   totalCurrentPoints: number,     // 총 현재 PP
 *   pendingRequests: number,        // 대기 중인 요청 수
 *   recentHistory: Array<{          // 최근 포인트 내역 (최근 50개)
 *     id: number,
 *     userId: number,
 *     type: string,                 // "입금" | "출금" | "대기"
 *     amount: number,
 *     reason: string,
 *     createdAt: string,            // ISO datetime
 *     userName: string
 *   }>,
 *   topMembers: Array<{             // Top 5 회원 (이번달 입금 PP 순)
 *     id: number,
 *     name: string,
 *     points: number,
 *     availablePoints: number,
 *     totalDeposit: number,         // 이번달 총 입금 PP
 *     totalWithdraw: number,        // 이번달 총 출금 PP
 *     totalPoints: number,          // 총 PP
 *     rank: number,                 // 순위 (1-5)
 *     tier: string                  // "VIP" | "Gold" | "Silver" | "Bronze"
 *   }>
 * }
 * 
 * GET /api/dashboard/user (사용자용)
 * 응답: {
 *   currentPoints: number,          // 현재 PP
 *   availablePoints: number,        // 사용 가능한 PP
 *   pendingPoints: number,          // 임시 보관 PP
 *   points: number,                 // 총 PP
 *   history: Array<{                // 최근 포인트 내역 (최근 50개)
 *     id: number,
 *     userId: number,
 *     type: string,                 // "입금" | "출금" | "대기"
 *     amount: number,
 *     reason: string,
 *     createdAt: string             // ISO datetime
 *   }>,
 *   requests: Array<{               // 최근 요청 내역 (최근 10개)
 *     id: number,
 *     userId: number,
 *     productId: number,
 *     amount: number,
 *     status: string,               // "대기중" | "승인됨" | "거부됨"
 *     createdAt: string,            // ISO datetime
 *     productName: string,
 *     productLink: string
 *   }>
 * }
 * 
 * GET /api/dashboard/stats (관리자용 - 전체 통계)
 * 응답: {
 *   monthlyStats: Array<{           // 월별 통계
 *     month: string,                // "YYYY-MM" 형식
 *     requestCount: number,         // 요청 수
 *     totalAmount: number           // 총 금액
 *   }>,
 *   productStats: Array<{           // 상품별 통계
 *     productName: string,
 *     requestCount: number,         // 요청 수
 *     totalAmount: number           // 총 금액
 *   }>
 * }
 */

// 대시보드 통계 (관리자용)
router.get('/admin', authenticateToken, requireAdmin, (req, res) => {
  const stats = {};

  // 총 회원 수
  db.get('SELECT COUNT(*) as count FROM users', (err, result) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
    stats.totalMembers = result.count;

    // 총 PP (현재 PP + 임시 보관 PP)
    db.get(`
      SELECT 
        SUM(u.points) as totalPoints,
        SUM(u.availablePoints) as totalAvailablePoints,
        SUM(CASE WHEN r.status = '대기중' THEN r.pendingAmount ELSE 0 END) as totalPendingPoints
      FROM users u
      LEFT JOIN requests r ON u.id = r.userId AND r.status = '대기중'
    `, (err, result) => {
      if (err) {
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
      }
      stats.totalPoints = result.totalPoints || 0;
      stats.totalAvailablePoints = result.totalAvailablePoints || 0;
      stats.totalPendingPoints = result.totalPendingPoints || 0;
      stats.totalCurrentPoints = result.totalPoints || 0;
      stats.totalPoints = (result.totalPoints || 0) + (result.totalPendingPoints || 0);

      // 최근 포인트 내역 (최근 50개)
      db.all(`
        SELECT ph.*, u.name as userName
        FROM point_history ph
        JOIN users u ON ph.userId = u.id
        ORDER BY ph.createdAt DESC
        LIMIT 50
      `, (err, history) => {
        if (err) {
          return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
        stats.recentHistory = history;

        // 대기 중인 요청 수
        db.get('SELECT COUNT(*) as count FROM requests WHERE status = "대기중"', (err, result) => {
          if (err) {
            return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
          }
          stats.pendingRequests = result.count;

          // Top 5 회원 (이번달 입금 PP 순)
          db.all(`
            SELECT 
              u.id, u.name, u.points, u.availablePoints,
              COALESCE(SUM(CASE WHEN ph.type = '입금' THEN ph.amount ELSE 0 END), 0) as totalDeposit,
              COALESCE(SUM(CASE WHEN ph.type = '출금' THEN ph.amount ELSE 0 END), 0) as totalWithdraw,
              COALESCE(SUM(ph.amount), 0) as totalPoints
            FROM users u
            LEFT JOIN point_history ph ON u.id = ph.userId 
            WHERE ph.type = '입금' 
              AND strftime('%Y-%m', ph.createdAt) = strftime('%Y-%m', 'now')
            GROUP BY u.id
            ORDER BY totalDeposit DESC
            LIMIT 5
          `, (err, topMembers) => {
            if (err) {
              return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
            }
            stats.topMembers = topMembers.map((member, index) => ({
              ...member,
              rank: index + 1,
              tier: member.totalDeposit >= 200000 ? "VIP" : 
                    member.totalDeposit >= 100000 ? "Gold" : 
                    member.totalDeposit >= 50000 ? "Silver" : "Bronze"
            }));

            res.json(stats);
          });
        });
      });
    });
  });
});

// 사용자 대시보드
router.get('/user', authenticateToken, (req, res) => {
  const stats = {};

  // 사용자 정보 (현재 PP, 사용 가능한 PP, 임시 보관 PP)
  db.get(`
    SELECT 
      u.id, u.name, u.email, u.points, u.availablePoints,
      SUM(CASE WHEN r.status = '대기중' THEN r.pendingAmount ELSE 0 END) as pendingPoints
    FROM users u
    LEFT JOIN requests r ON u.id = r.userId AND r.status = '대기중'
    WHERE u.id = ?
    GROUP BY u.id
  `, [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
    stats.currentPoints = user.points;
    stats.availablePoints = user.availablePoints;
    stats.pendingPoints = user.pendingPoints;
    stats.points = user.points;

    // 최근 포인트 내역 (최근 50개)
    db.all(`
      SELECT * FROM point_history 
      WHERE userId = ? 
      ORDER BY createdAt DESC 
      LIMIT 50
    `, [req.user.id], (err, history) => {
      if (err) {
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
      }
      stats.history = history;

      // 최근 요청 내역 (최근 5개)
      db.all(`
        SELECT r.*, p.name as productName, p.link as productLink
        FROM requests r
        JOIN products p ON r.productId = p.id
        WHERE r.userId = ?
        ORDER BY r.createdAt DESC
        LIMIT 10
      `, [req.user.id], (err, requests) => {
        if (err) {
          return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
        stats.requests = requests;

        res.json(stats);
      });
    });
  });
});

// 전체 통계 (관리자용)
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  const stats = {};

  // 월별 통계
  db.all(`
    SELECT 
      strftime('%Y-%m', createdAt) as month,
      COUNT(*) as requestCount,
      SUM(amount) as totalAmount
    FROM requests 
    WHERE status = '승인됨'
    GROUP BY strftime('%Y-%m', createdAt)
    ORDER BY month DESC
    LIMIT 12
  `, (err, monthlyStats) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
    stats.monthlyStats = monthlyStats;

    // 상품별 통계
    db.all(`
      SELECT 
        p.name as productName,
        COUNT(r.id) as requestCount,
        SUM(r.amount) as totalAmount
      FROM requests r
      JOIN products p ON r.productId = p.id
      WHERE r.status = '승인됨'
      GROUP BY p.id
      ORDER BY totalAmount DESC
    `, (err, productStats) => {
      if (err) {
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
      }
      stats.productStats = productStats;

      res.json(stats);
    });
  });
});

// 월별 PP 흐름 데이터 (관리자용)
router.get('/monthly-flow', authenticateToken, requireAdmin, (req, res) => {
  db.all(`
    SELECT 
      strftime('%Y-%m', ph.createdAt) as month,
      SUM(CASE WHEN ph.type = '입금' THEN ph.amount ELSE 0 END) as 입금,
      SUM(CASE WHEN ph.type = '출금' THEN ph.amount ELSE 0 END) as 출금
    FROM point_history ph
    WHERE ph.createdAt >= datetime('now', '-6 months')
    GROUP BY strftime('%Y-%m', ph.createdAt)
    ORDER BY month ASC
  `, (err, monthlyFlow) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
    
    // 월 이름을 한국어로 변환
    const monthNames = {
      '01': '1월', '02': '2월', '03': '3월', '04': '4월',
      '05': '5월', '06': '6월', '07': '7월', '08': '8월',
      '09': '9월', '10': '10월', '11': '11월', '12': '12월'
    };
    
    const formattedData = monthlyFlow.map(item => ({
      month: monthNames[item.month.split('-')[1]] || item.month,
      입금: item.입금 || 0,
      출금: item.출금 || 0
    }));
    
    res.json(formattedData);
  });
});

// PP 분포 데이터 (사용자 티어별) (관리자용)
router.get('/pp-distribution', authenticateToken, requireAdmin, (req, res) => {
  db.all(`
    SELECT 
      CASE 
        WHEN totalDeposit >= 200000 THEN 'VIP'
        WHEN totalDeposit >= 100000 THEN 'Gold'
        WHEN totalDeposit >= 50000 THEN 'Silver'
        ELSE 'Bronze'
      END as tier,
      SUM(totalDeposit) as pp,
      COUNT(*) as count
    FROM (
      SELECT 
        u.id,
        COALESCE(SUM(CASE WHEN ph.type = '입금' THEN ph.amount ELSE 0 END), 0) as totalDeposit
      FROM users u
      LEFT JOIN point_history ph ON u.id = ph.userId 
      WHERE ph.type = '입금' 
        AND strftime('%Y-%m', ph.createdAt) = strftime('%Y-%m', 'now')
      GROUP BY u.id
    )
    GROUP BY tier
    ORDER BY pp DESC
  `, (err, distribution) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
    
    res.json(distribution);
  });
});

module.exports = router; 