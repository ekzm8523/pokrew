import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";

function MemberList({ members, loading, onSelect, setPage }) {
  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>이름</TableCell>
            <TableCell>현재 포인트</TableCell>
            <TableCell>사용 가능 포인트</TableCell>
            <TableCell>임시 포인트</TableCell>
            <TableCell>이메일</TableCell>
            <TableCell>상세</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.name}</TableCell>
              <TableCell>{member.points} PP</TableCell>
              <TableCell>{member.availablePoints} PP</TableCell>
              <TableCell>{(member.points - member.availablePoints)} PP</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  onClick={() => {
                    onSelect(member);
                    setPage("memberDetail");
                  }}
                >
                  보기
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default MemberList; 