import React, { useState } from 'react';
import { Box, TextField, Button, MenuItem } from '@mui/material';

function PointForm({ member }) {
  const [type, setType] = useState('입금');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`${member.name}님에게 ${type} ${amount}PP (${reason}) 처리 (실제 저장은 미구현)`);
    setAmount('');
    setReason('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        select
        label="입출금"
        value={type}
        onChange={(e) => setType(e.target.value)}
        sx={{ mr: 2, width: 100 }}
      >
        <MenuItem value="입금">입금</MenuItem>
        <MenuItem value="출금">출금</MenuItem>
      </TextField>
      <TextField
        label="금액"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        sx={{ mr: 2, width: 100 }}
        required
      />
      <TextField
        label="사유"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        sx={{ mr: 2, width: 200 }}
        required
      />
      <Button type="submit" variant="contained">
        처리
      </Button>
    </Box>
  );
}

export default PointForm;
