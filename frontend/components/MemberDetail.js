import React, { useEffect, useState } from 'react';
import { Typography, Button, Box, CircularProgress } from '@mui/material';
import PointForm from './PointForm';
import { apiRequest, API_ENDPOINTS } from '../config/api';

function MemberDetail({ member, setPage, token }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiRequest(API_ENDPOINTS.USERS.HISTORY(member.id))
      .then((data) => setHistory(data))
      .catch((error) => {
        console.error('회원 내역 로딩 실패:', error);
      })
      .finally(() => setLoading(false));
  }, [member, token]);

  return (
    <Box>
      <Button onClick={() => setPage('members')}>← 회원 목록</Button>
      <Typography variant="h4">{member.name}</Typography>
      <Typography>현재 포인트: {member.points} PP</Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>
        포인트 내역
      </Typography>
      {loading ? (
        <CircularProgress sx={{ mt: 2 }} />
      ) : (
        <ul>
          {history.map((h, i) => (
            <li key={i}>
              {h.createdAt?.slice(0, 10)} | {h.type} | {h.amount} | {h.reason}
            </li>
          ))}
        </ul>
      )}
      <PointForm member={member} />
    </Box>
  );
}

export default MemberDetail;
