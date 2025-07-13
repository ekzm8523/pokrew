import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Select,
  InputLabel,
  FormControl,
  Alert,
  CircularProgress,
} from "@mui/material";
import { apiRequest, API_ENDPOINTS } from "../config/api";

function AdminPage({ user, token, refreshAllData }) {
  const [members, setMembers] = useState([]);
  const [history, setHistory] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [type, setType] = useState("입금");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");

  // 회원 목록과 최근 내역 불러오기
  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiRequest(API_ENDPOINTS.USERS.LIST),
      apiRequest(API_ENDPOINTS.DASHBOARD.ADMIN),
    ])
      .then(([membersData, dashboardData]) => {
        setMembers(membersData);
        setHistory(dashboardData.recentHistory || []);
        if (membersData.length > 0) {
          setMemberId(membersData[0].id);
        }
      })
      .catch((error) => {
        console.error("데이터 로딩 실패:", error);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!memberId || !amount || !reason) return;

    try {
      const data = await apiRequest(API_ENDPOINTS.USERS.POINTS(memberId), {
        method: "PATCH",
        body: JSON.stringify({ type, amount: Number(amount), reason }),
      });
      
      // 회원 목록 업데이트
      setMembers(members.map(m => 
        m.id === Number(memberId) ? { ...m, points: data.newPoints } : m
      ));
      // 내역에 추가
      const member = members.find(m => m.id === Number(memberId));
      setHistory([
        {
          createdAt: new Date().toISOString(),
          userName: member?.name,
          type,
          amount: Number(amount),
          reason,
        },
        ...history,
      ]);
      setAmount("");
      setReason("");
      setSuccess("포인트가 성공적으로 조정되었습니다!");
      setTimeout(() => setSuccess(""), 3000);
      if (refreshAllData) refreshAllData();
    } catch (err) {
      setSuccess(err.message || "서버 오류");
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>관리자 PP 관리</Typography>
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>회원</InputLabel>
              <Select
                value={memberId}
                label="회원"
                onChange={(e) => setMemberId(e.target.value)}
                required
              >
                {members.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.name} ({m.points} PP)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              select
              label="입출금"
              value={type}
              onChange={(e) => setType(e.target.value)}
              sx={{ width: 100 }}
            >
              <MenuItem value="입금">입금</MenuItem>
              <MenuItem value="출금">출금</MenuItem>
            </TextField>
            <TextField
              label="금액"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              sx={{ width: 100 }}
              required
            />
            <TextField
              label="사유"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              sx={{ width: 200 }}
              required
            />
            <Button type="submit" variant="contained" sx={{ height: 56 }}>
              처리
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Typography variant="h6" sx={{ mb: 2 }}>최근 처리 내역</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>날짜</TableCell>
              <TableCell>회원명</TableCell>
              <TableCell>입출금</TableCell>
              <TableCell>금액</TableCell>
              <TableCell>사유</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((h, i) => (
              <TableRow key={i}>
                <TableCell>{h.createdAt?.slice(0, 10)}</TableCell>
                <TableCell>{h.userName}</TableCell>
                <TableCell>{h.type}</TableCell>
                <TableCell>{h.amount}</TableCell>
                <TableCell>{h.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default AdminPage; 