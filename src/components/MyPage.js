import React, { useEffect, useState } from "react";
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, CircularProgress } from "@mui/material";
import { apiRequest, API_ENDPOINTS } from "../config/api";

function MyPage({ user, token }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(user);

  useEffect(() => {
    setLoading(true);
    
    // 내역 조회
    apiRequest(API_ENDPOINTS.USERS.HISTORY(user.id))
      .then((data) => setHistory(data))
      .catch((error) => {
        console.error("내역 로딩 실패:", error);
      })
      .finally(() => setLoading(false));
    
    // 내 정보 최신화
    apiRequest(API_ENDPOINTS.AUTH.ME)
      .then((data) => {
        if (data.user) setUserInfo(data.user);
      })
      .catch((error) => {
        console.error("사용자 정보 로딩 실패:", error);
      });
  }, [user, token]);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>마이페이지</Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">{userInfo.name} 님</Typography>
          <Typography>현재 PP: {userInfo.points}</Typography>
        </CardContent>
      </Card>
      <Typography variant="h6" sx={{ mb: 2 }}>나의 PP 입출금 내역</Typography>
      {loading ? (
        <CircularProgress sx={{ mt: 2 }} />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>날짜</TableCell>
                <TableCell>입출금</TableCell>
                <TableCell>금액</TableCell>
                <TableCell>사유</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((h, i) => (
                <TableRow key={i}>
                  <TableCell>{h.createdAt?.slice(0, 10)}</TableCell>
                  <TableCell>{h.type}</TableCell>
                  <TableCell>{h.amount}</TableCell>
                  <TableCell>{h.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default MyPage; 