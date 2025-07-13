import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
} from "@mui/material";
import {
  Dashboard,
  People,
  Person,
  AdminPanelSettings,
  RequestPage,
  Store,
  Assessment,
  Logout,
} from "@mui/icons-material";

const drawerWidth = 280;

function Sidebar({ page, setPage, isAdmin, user, onLogout }) {
  const menuItems = [
    {
      title: "대시보드",
      icon: <Dashboard />,
      page: "dashboard",
      forAll: true,
    },
    {
      title: "마이페이지",
      icon: <Person />,
      page: "mypage",
      forAll: true,
    },
    {
      title: "PP 사용 요청",
      icon: <RequestPage />,
      page: "request",
      forAll: true,
    },
  ];

  const adminMenuItems = [
    {
      title: "회원관리",
      icon: <People />,
      page: "members",
      forAdmin: true,
    },
    {
      title: "상품 관리",
      icon: <Store />,
      page: "productManagement",
      forAdmin: true,
    },
    {
      title: "요청 관리",
      icon: <Assessment />,
      page: "requestManagement",
      forAdmin: true,
    },
    {
      title: "포인트 관리",
      icon: <AdminPanelSettings />,
      page: "admin",
      forAdmin: true,
    },
  ];

  const handleMenuClick = (targetPage) => {
    setPage(targetPage);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          홀덤 동호회 PP 관리
        </Typography>
        {user && (
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
            {user.name} 님
          </Typography>
        )}
      </Box>
      
      <Divider />
      
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.page} disablePadding>
            <ListItemButton
              selected={page === item.page}
              onClick={() => handleMenuClick(item.page)}
              sx={{
                mx: 1,
                borderRadius: 1,
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: page === item.page ? "white" : "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {isAdmin && (
        <>
          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              관리자 메뉴
            </Typography>
          </Divider>
          
          <List>
            {adminMenuItems.map((item) => (
              <ListItem key={item.page} disablePadding>
                <ListItemButton
                  selected={page === item.page}
                  onClick={() => handleMenuClick(item.page)}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    "&.Mui-selected": {
                      backgroundColor: "secondary.main",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "secondary.dark",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: page === item.page ? "white" : "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.title} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}

      <Box sx={{ flexGrow: 1 }} />
      
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={onLogout}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="로그아웃" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}

export default Sidebar; 