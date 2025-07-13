import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Chip,
  CircularProgress,
} from "@mui/material";
import { apiRequest, API_ENDPOINTS } from "../config/api";

function ProductManagementPage({ user, token, refreshAllData }) {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  // 상품 목록 불러오기
  useEffect(() => {
    setLoading(true);
    apiRequest(API_ENDPOINTS.PRODUCTS.ADMIN_LIST)
      .then((data) => setProducts(data))
      .catch((error) => {
        console.error("상품 목록 로딩 실패:", error);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleEdit = (product) => {
    setEditingProduct({ ...product });
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    try {
      await apiRequest(API_ENDPOINTS.PRODUCTS.DETAIL(editingProduct.id), {
        method: "PUT",
        body: JSON.stringify(editingProduct),
      });
      setProducts(products.map(p => 
        p.id === editingProduct.id ? editingProduct : p
      ));
      setEditingProduct(null);
      setSuccess("상품이 수정되었습니다!");
      setTimeout(() => setSuccess(""), 3000);
      if (refreshAllData) refreshAllData();
    } catch (err) {
      setSuccess(err.message || "수정 실패");
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
  };

  const handleToggleActive = async (productId) => {
    try {
      await apiRequest(API_ENDPOINTS.PRODUCTS.TOGGLE(productId), {
        method: "PATCH",
      });
      setProducts(products.map(p => 
        p.id === productId ? { ...p, isActive: !p.isActive } : p
      ));
      if (refreshAllData) refreshAllData();
    } catch (err) {
      console.error("토글 실패:", err);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await apiRequest(API_ENDPOINTS.PRODUCTS.DETAIL(productId), {
        method: "DELETE",
      });
      setProducts(products.filter(p => p.id !== productId));
      setSuccess("상품이 삭제되었습니다!");
      setTimeout(() => setSuccess(""), 3000);
      if (refreshAllData) refreshAllData();
    } catch (err) {
      setSuccess(err.message || "삭제 실패");
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>월간 상품 관리</Typography>
      <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
        매달 3개의 상품을 설정하여 회원들이 선택할 수 있도록 합니다.
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={2}>
        {products.map((product) => (
          <Grid item xs={12} md={4} key={product.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6">{product.name}</Typography>
                  <Chip 
                    label={product.isActive ? "활성" : "비활성"} 
                    color={product.isActive ? "success" : "default"}
                    size="small"
                  />
                </Box>

                {editingProduct?.id === product.id ? (
                  <Box>
                    <TextField
                      fullWidth
                      label="상품명"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="가격 (PP)"
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="상품 설명"
                      multiline
                      rows={2}
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="구매 링크"
                      value={editingProduct.link}
                      onChange={(e) => setEditingProduct({...editingProduct, link: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button size="small" variant="contained" onClick={handleSave}>
                        저장
                      </Button>
                      <Button size="small" variant="outlined" onClick={handleCancel}>
                        취소
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h5" color="primary" sx={{ mb: 1 }}>
                      {product.price} PP
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {product.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <a href={product.link} target="_blank" rel="noopener noreferrer">
                        구매 링크
                      </a>
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button size="small" variant="outlined" onClick={() => handleEdit(product)}>
                        수정
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color={product.isActive ? "error" : "success"}
                        onClick={() => handleToggleActive(product.id)}
                      >
                        {product.isActive ? "비활성화" : "활성화"}
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="error"
                        onClick={() => handleDelete(product.id)}
                      >
                        삭제
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ProductManagementPage; 