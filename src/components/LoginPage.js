import React, { useState } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import { apiRequest, API_ENDPOINTS } from "../config/api";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.token) {
        localStorage.setItem('pokrew_token', response.token);
        onLogin(response.user, response.token);
      } else {
        setError("로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      setError(error.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "grey.100",
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%", mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" sx={{ mb: 3 }}>
            포크루 PP 관리
          </Typography>
          <Typography variant="body2" align="center" sx={{ mb: 3, color: "text.secondary" }}>
            포크루 회원만 접근 가능합니다
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              required
            />
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
          
          <Typography variant="body2" align="center" sx={{ mt: 3, color: "text.secondary" }}>
            테스트 계정: admin@test.com / 1234
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage; 