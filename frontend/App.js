import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MemberList from './components/MemberList';
import MemberDetail from './components/MemberDetail';
import MyPage from './components/MyPage';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';
import RequestPage from './components/RequestPage';
import RequestManagementPage from './components/RequestManagementPage';
import ProductManagementPage from './components/ProductManagementPage';
import { Box, CircularProgress } from '@mui/material';
import { apiRequest, API_ENDPOINTS } from './config/api';

function App() {
  const [page, setPage] = useState('dashboard');
  const [selectedMember, setSelectedMember] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // 로그인 성공 시 user/token 저장
  const handleLogin = (loginUser, loginToken) => {
    setUser(loginUser);
    setToken(loginToken);
    localStorage.setItem('pokrew_token', loginToken);
    setPage('dashboard');
  };

  // 로그아웃
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pokrew_token');
    setPage('dashboard');
  };

  // 전역 리프레시 함수
  const refreshAllData = async () => {
    console.log('전역 데이터 리프레시 시작...');

    try {
      // 1. 사용자 정보 갱신
      const userData = await apiRequest(API_ENDPOINTS.AUTH.ME);
      if (userData.user) {
        setUser(userData.user);
      }

      // 2. 관리자인 경우 회원 목록 갱신
      if (userData.user && userData.user.isAdmin) {
        const membersData = await apiRequest(API_ENDPOINTS.USERS.LIST);
        setMembers(membersData);
      }

      console.log('전역 데이터 리프레시 완료');
    } catch (error) {
      console.error('전역 데이터 리프레시 실패:', error);
    }
  };

  // 토큰 있으면 자동 로그인 (초기화 시 한 번만 실행)
  useEffect(() => {
    const savedToken = localStorage.getItem('pokrew_token');
    if (savedToken) {
      apiRequest(API_ENDPOINTS.AUTH.ME)
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            setToken(savedToken);
          }
        })
        .catch(() => {
          // 토큰이 유효하지 않으면 제거
          localStorage.removeItem('pokrew_token');
        })
        .finally(() => {
          setIsInitializing(false);
        });
    } else {
      setIsInitializing(false);
    }
  }, []); // 빈 의존성 배열로 초기화 시 한 번만 실행

  // 회원 목록 불러오기 (관리자만)
  useEffect(() => {
    if (user && user.isAdmin) {
      setLoadingMembers(true);
      apiRequest(API_ENDPOINTS.USERS.LIST)
        .then((data) => {
          setMembers(data);
        })
        .catch((error) => {
          console.error('회원 목록 로딩 실패:', error);
        })
        .finally(() => setLoadingMembers(false));
    }
  }, [user, token]);

  // user 정보 갱신 함수
  const refreshUser = async () => {
    const data = await apiRequest(API_ENDPOINTS.AUTH.ME);
    if (data.user) setUser(data.user);
  };

  // 초기화 중이면 로딩 표시
  if (isInitializing) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar
        page={page}
        setPage={setPage}
        isAdmin={user.isAdmin}
        user={user}
        onLogout={handleLogout}
      />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {page === 'dashboard' && (
          <Dashboard user={user} token={token} refreshAllData={refreshAllData} />
        )}
        {page === 'members' && (
          <MemberList
            members={members}
            loading={loadingMembers}
            onSelect={setSelectedMember}
            setPage={setPage}
            refreshAllData={refreshAllData}
          />
        )}
        {page === 'memberDetail' && selectedMember && (
          <MemberDetail
            member={selectedMember}
            setPage={setPage}
            token={token}
            refreshAllData={refreshAllData}
          />
        )}
        {page === 'mypage' && <MyPage user={user} token={token} refreshAllData={refreshAllData} />}
        {page === 'admin' && (
          <AdminPage user={user} token={token} refreshAllData={refreshAllData} />
        )}
        {page === 'request' && (
          <RequestPage
            user={user}
            token={token}
            refreshUser={refreshUser}
            refreshAllData={refreshAllData}
          />
        )}
        {page === 'requestManagement' && (
          <RequestManagementPage user={user} token={token} refreshAllData={refreshAllData} />
        )}
        {page === 'productManagement' && (
          <ProductManagementPage user={user} token={token} refreshAllData={refreshAllData} />
        )}
      </Box>
    </Box>
  );
}

export default App;
