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
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import { apiRequest, API_ENDPOINTS } from "../config/api";

function RequestManagementPage({ user, token, refreshAllData }) {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(true);

  // 요청 목록 불러오기
  useEffect(() => {
    setLoading(true);
    apiRequest(API_ENDPOINTS.REQUESTS.ADMIN)
      .then((data) => setRequests(data))
      .catch((error) => {
        console.error("요청 목록 로딩 실패:", error);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleApprove = async (requestId) => {
    try {
      await apiRequest(API_ENDPOINTS.REQUESTS.APPROVE(requestId), {
        method: "PATCH",
      });
      setRequests(requests.map(req => 
        req.id === requestId ? { ...req, status: "승인됨" } : req
      ));
      if (refreshAllData) refreshAllData();
    } catch (err) {
      console.error("승인 실패:", err);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await apiRequest(API_ENDPOINTS.REQUESTS.REJECT(requestId), {
        method: "PATCH",
        body: JSON.stringify({ reason: rejectReason }),
      });
      setRequests(requests.map(req => 
        req.id === requestId ? { ...req, status: "거부됨" } : req
      ));
      setDialogOpen(false);
      setRejectReason("");
      if (refreshAllData) refreshAllData();
    } catch (err) {
      console.error("거부 실패:", err);
    }
  };

  const openRejectDialog = (request) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "승인됨":
        return "success";
      case "거부됨":
        return "error";
      default:
        return "warning";
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>PP 사용 요청 관리</Typography>
      <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
        회원들의 PP 사용 요청을 승인하거나 거부할 수 있습니다.
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>날짜</TableCell>
              <TableCell>회원명</TableCell>
              <TableCell>상품</TableCell>
              <TableCell>수량</TableCell>
              <TableCell>금액</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.createdAt?.slice(0, 10)}</TableCell>
                <TableCell>{request.userName}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{request.productName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      <a href={request.productLink} target="_blank" rel="noopener noreferrer">
                        구매 링크
                      </a>
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{request.quantity}</TableCell>
                <TableCell>{request.amount} PP</TableCell>
                <TableCell>
                  <Chip
                    label={request.status}
                    color={getStatusColor(request.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {request.status === "대기중" && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleApprove(request.id)}
                      >
                        승인
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => openRejectDialog(request)}
                      >
                        거부
                      </Button>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 거부 사유 입력 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>거부 사유 입력</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="거부 사유"
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button 
            onClick={() => handleReject(selectedRequest?.id)} 
            color="error"
            disabled={!rejectReason.trim()}
          >
            거부
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RequestManagementPage; 