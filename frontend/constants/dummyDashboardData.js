// 대시보드 더미 데이터 정의
// TODO: 실제 데이터 연동 시 이 파일의 import만 교체하면 됩니다.
// 실제 데이터는 API_ENDPOINTS.DASHBOARD.MONTHLY_FLOW와 API_ENDPOINTS.DASHBOARD.PP_DISTRIBUTION에서 제공됩니다.

export const monthlyPPFlowData = [
  { month: '1월', 입금: 450000, 출금: 320000 },
  { month: '2월', 입금: 520000, 출금: 380000 },
  { month: '3월', 입금: 480000, 출금: 350000 },
  { month: '4월', 입금: 600000, 출금: 420000 },
  { month: '5월', 입금: 550000, 출금: 390000 },
  { month: '6월', 입금: 580000, 출금: 410000 },
];

export const ppDistributionData = [
  { tier: 'VIP', pp: 850000, count: 12 },
  { tier: 'Gold', pp: 650000, count: 25 },
  { tier: 'Silver', pp: 450000, count: 38 },
  { tier: 'Bronze', pp: 250000, count: 52 },
];

// 더미 통계 데이터
// TODO: 실제 데이터 연동 시 stats 객체에서 제공되는 데이터로 대체됩니다.
export const dummyStats = {
  totalMembers: 127,
  totalPoints: 2200000,
  totalTransactions: 1847,
  totalRequests: 23,
};
