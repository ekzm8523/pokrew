import React, { useEffect, useState } from "react";
import {
  Grid,
  Box,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  TrendingUp,
  People,
  AccountBalance,
  Receipt,
  Schedule,
  Casino,
} from "@mui/icons-material";
import { apiRequest, API_ENDPOINTS } from "../config/api";
import { darkTheme } from "../constants/theme";
import { monthlyPPFlowData, ppDistributionData, dummyStats } from "../constants/dummyDashboardData";
import { formatPP } from "../utils/format";
import StatCard from "./dashboard/StatCard";
import ModeCard from "./dashboard/ModeCard";
import PPFlowChart from "./dashboard/PPFlowChart";
import PPDistributionChart from "./dashboard/PPDistributionChart";
import RecentPPLogTable from "./dashboard/RecentPPLogTable";
import TopMembersCard from "./dashboard/TopMembersCard";

function Dashboard({ user, token }) {
  const [stats, setStats] = useState(null);
  const [monthlyFlowData, setMonthlyFlowData] = useState(null);
  const [ppDistributionDataState, setPpDistributionDataState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const endpoint = user.isAdmin ? API_ENDPOINTS.DASHBOARD.ADMIN : API_ENDPOINTS.DASHBOARD.USER;
    
    // 메인 대시보드 데이터 로드
    apiRequest(endpoint)
      .then((data) => setStats(data))
      .catch((error) => {
        console.error("대시보드 데이터 로딩 실패:", error);
      });

    // 관리자인 경우 추가 데이터 로드
    if (user.isAdmin) {
      // 월별 PP 흐름 데이터 로드
      apiRequest(API_ENDPOINTS.DASHBOARD.MONTHLY_FLOW)
        .then((data) => setMonthlyFlowData(data))
        .catch((error) => {
          console.error("월별 PP 흐름 데이터 로딩 실패:", error);
        });

      // PP 분포 데이터 로드
      apiRequest(API_ENDPOINTS.DASHBOARD.PP_DISTRIBUTION)
        .then((data) => setPpDistributionDataState(data))
        .catch((error) => {
          console.error("PP 분포 데이터 로딩 실패:", error);
        });
    }

    setLoading(false);
  }, [user, token]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: darkTheme.background,
        }}
      >
        <CircularProgress sx={{ color: darkTheme.gold }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: darkTheme.background, minHeight: "100vh", p: 3 }}>
      {/* 상단 모드 카드들 */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <TopMembersCard topMembers={stats?.topMembers || []} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
              <Chip label="TODO: 실제 데이터 연동 필요" size="small" color="warning" />
            </Box>
            <ModeCard
              title="Tournament Mode"
              subtitle="토너먼트 진행중"
              icon={<TrendingUp sx={{ fontSize: 40 }} />}
              isActive={false}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
              <Chip label="TODO: 실제 데이터 연동 필요" size="small" color="warning" />
            </Box>
            <ModeCard
              title="Ring Mode"
              subtitle="일반 게임"
              icon={<Casino sx={{ fontSize: 40 }} />}
              isActive={false}
            />
          </Box>
        </Grid>
      </Grid>

      {/* 통계 카드들 */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            title="전체 회원"
            value={stats?.totalMembers || dummyStats.totalMembers}
            icon={<People sx={{ color: darkTheme.textSecondary }} />}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="총 PP"
            value={formatPP(stats?.totalPoints || dummyStats.totalPoints)}
            icon={<AccountBalance sx={{ color: darkTheme.textSecondary }} />}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
              <Chip label="TODO: 실제 데이터 연동 필요" size="small" color="warning" />
            </Box>
            <StatCard
              title="총 거래"
              value={(stats?.totalTransactions || dummyStats.totalTransactions).toLocaleString()}
              icon={<Receipt sx={{ color: darkTheme.textSecondary }} />}
            />
          </Box>
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="총 요청"
            value={stats?.totalRequests || dummyStats.totalRequests}
            icon={<Schedule sx={{ color: darkTheme.textSecondary }} />}
          />
        </Grid>
      </Grid>

      {/* 차트 섹션 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 월별 PP 흐름 차트 */}
        <Grid item xs={12} lg={6}>
          <PPFlowChart data={monthlyFlowData || monthlyPPFlowData} />
        </Grid>

        {/* PP 분포 차트 */}
        <Grid item xs={12} lg={6}>
          <PPDistributionChart data={ppDistributionDataState || ppDistributionData} />
        </Grid>
      </Grid>

      {/* 최근 PP 로그 테이블 */}
      <RecentPPLogTable recentHistory={stats?.recentHistory || []} />
    </Box>
  );
}

export default Dashboard; 