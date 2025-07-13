import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";

function Navbar({ setPage }) {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          홀덤 동호회 PP 관리
        </Typography>
        {user && (
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user.name} 님
          </Typography>
        )}
        <Button color="inherit" onClick={() => setPage("dashboard")}>대시보드</Button>
        {isAdmin && (
          <Button color="inherit" onClick={() => setPage("members")}>회원관리</Button>
        )}
        <Button color="inherit" onClick={() => setPage("mypage")}>마이페이지</Button>
        <Button color="inherit" onClick={() => setPage("request")}>PP 요청</Button>
        {isAdmin && (
          <Button color="inherit" onClick={() => setPage("admin")}>관리자</Button>
        )}
        {isAdmin && (
          <Button color="inherit" onClick={() => setPage("requestManagement")}>요청 관리</Button>
        )}
        {isAdmin && (
          <Button color="inherit" onClick={() => setPage("productManagement")}>상품 관리</Button>
        )}
        {user && (
          <Button color="inherit" onClick={onLogout}>로그아웃</Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 