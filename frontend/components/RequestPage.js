import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { apiRequest, API_ENDPOINTS } from '../config/api';

function RequestPage({ user, token, refreshUser, refreshAllData }) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [requests, setRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // 상품 목록과 내 요청 목록 불러오기
  useEffect(() => {
    setLoading(true);
    Promise.all([apiRequest(API_ENDPOINTS.PRODUCTS.LIST), apiRequest(API_ENDPOINTS.REQUESTS.MY)])
      .then(([productsData, requestsData]) => {
        setProducts(productsData);
        setRequests(requestsData);
      })
      .catch((error) => {
        console.error('데이터 로딩 실패:', error);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const selectedProduct = products.find((p) => p.id === Number(selectedProductId));
  const points = typeof user.points === 'number' ? user.points : 0;
  const availablePoints = typeof user.availablePoints === 'number' ? user.availablePoints : 0;
  const pendingPoints = typeof user.pendingPoints === 'number' ? user.pendingPoints : 0;
  const totalCost = selectedProduct ? selectedProduct.price * quantity : 0;
  const canAfford = totalCost <= availablePoints;
  const maxQuantity =
    selectedProduct &&
    typeof availablePoints === 'number' &&
    typeof selectedProduct.price === 'number' &&
    selectedProduct.price > 0
      ? Math.floor(availablePoints / selectedProduct.price)
      : 0;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !canAfford) {
      return;
    }

    try {
      await apiRequest(API_ENDPOINTS.REQUESTS.CREATE, {
        method: 'POST',
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: quantity,
        }),
      });
      await refreshUser(); // 요청 성공 후 최신 user 정보로 갱신
      if (refreshAllData) refreshAllData();
      const newRequest = {
        id: Date.now(), // 임시 ID
        createdAt: new Date().toISOString(),
        amount: totalCost,
        productName: selectedProduct.name,
        productLink: selectedProduct.link,
        quantity,
        status: '대기중',
      };
      setRequests([newRequest, ...requests]);
      setSuccess('PP 사용 요청이 제출되었습니다!');
      setSelectedProductId('');
      setQuantity(1);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setSuccess(err.message || '서버 오류');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '승인됨':
        return 'success';
      case '거부됨':
        return 'error';
      default:
        return 'warning';
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        PP 사용 요청
      </Typography>

      {/* 내 PP 정보를 Card 밖으로 이동 */}
      <Box
        style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#d5d5d5',
          borderRadius: '4px',
          border: '1px solid #ccc',
        }}
      >
        <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
          내 PP: {points} PP (현재) / {availablePoints} PP (사용 가능)
        </Typography>
        {pendingPoints > 0 && (
          <Typography variant="body2" color="text.secondary">
            임시 보관 중: {pendingPoints} PP
          </Typography>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            새 요청 작성
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>상품 선택</InputLabel>
              <Select
                value={selectedProductId}
                label="상품 선택"
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setQuantity(1);
                }}
                required
              >
                {products
                  .filter((p) => p.isActive)
                  .map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} - {product.price} PP
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {selectedProduct && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  수량 선택 (최대 {maxQuantity}개)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Remove />
                  </IconButton>
                  <TextField
                    value={quantity}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    type="number"
                    inputProps={{ min: 1, max: maxQuantity }}
                    sx={{ width: 80 }}
                  />
                  <IconButton
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= maxQuantity}
                  >
                    <Add />
                  </IconButton>
                </Box>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  총 비용: {totalCost} PP
                </Typography>
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={!selectedProduct || !canAfford}
              fullWidth
            >
              요청 제출
            </Button>
          </form>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ mb: 2 }}>
        내 요청 내역
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>날짜</TableCell>
              <TableCell>상품</TableCell>
              <TableCell>수량</TableCell>
              <TableCell>비용</TableCell>
              <TableCell>상태</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.createdAt?.slice(0, 10)}</TableCell>
                <TableCell>
                  <Typography variant="body2">{request.productName}</Typography>
                  {request.productLink && (
                    <Typography variant="caption" color="text.secondary">
                      <a href={request.productLink} target="_blank" rel="noopener noreferrer">
                        링크 보기
                      </a>
                    </Typography>
                  )}
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default RequestPage;
