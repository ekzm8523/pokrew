import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { darkTheme } from '../../constants/theme';
import { formatPP, getTransactionColor } from '../../utils/format';

const RecentPPLogTable = ({ recentHistory = [] }) => {
  return (
    <Card
      sx={{
        bgcolor: darkTheme.cardBackground,
        border: `1px solid ${darkTheme.border}`,
        borderRadius: 4,
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ color: darkTheme.textPrimary, mb: 2 }}>
          최근 PP 로그 ({recentHistory.length}건)
        </Typography>
        <TableContainer
          component={Paper}
          sx={{
            bgcolor: 'transparent',
            maxHeight: 600,
            overflowX: 'auto',
            borderRadius: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: darkTheme.cardBackground,
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: darkTheme.border,
              borderRadius: '4px',
              '&:hover': {
                background: darkTheme.textSecondary,
              },
            },
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    color: darkTheme.textSecondary,
                    borderColor: darkTheme.border,
                    bgcolor: darkTheme.cardBackground,
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                  }}
                >
                  날짜
                </TableCell>
                <TableCell
                  sx={{
                    color: darkTheme.textSecondary,
                    borderColor: darkTheme.border,
                    bgcolor: darkTheme.cardBackground,
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                  }}
                >
                  멤버
                </TableCell>
                <TableCell
                  sx={{
                    color: darkTheme.textSecondary,
                    borderColor: darkTheme.border,
                    bgcolor: darkTheme.cardBackground,
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                  }}
                >
                  유형
                </TableCell>
                <TableCell
                  sx={{
                    color: darkTheme.textSecondary,
                    borderColor: darkTheme.border,
                    bgcolor: darkTheme.cardBackground,
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                  }}
                >
                  금액
                </TableCell>
                <TableCell
                  sx={{
                    color: darkTheme.textSecondary,
                    borderColor: darkTheme.border,
                    bgcolor: darkTheme.cardBackground,
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                  }}
                >
                  비고
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentHistory.map((transaction, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                    },
                    '&:nth-of-type(odd)': {
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                    },
                  }}
                >
                  <TableCell sx={{ color: darkTheme.textPrimary, borderColor: darkTheme.border }}>
                    {transaction.createdAt?.slice(0, 16).replace('T', ' ') || transaction.date}
                  </TableCell>
                  <TableCell sx={{ color: darkTheme.textPrimary, borderColor: darkTheme.border }}>
                    {transaction.userName || transaction.member}
                  </TableCell>
                  <TableCell sx={{ borderColor: darkTheme.border }}>
                    <Chip
                      label={transaction.type}
                      size="small"
                      sx={{
                        bgcolor: getTransactionColor(transaction.type, darkTheme),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      color: darkTheme.gold,
                      borderColor: darkTheme.border,
                      fontWeight: 'bold',
                    }}
                  >
                    {formatPP(transaction.amount)}
                  </TableCell>
                  <TableCell sx={{ color: darkTheme.textSecondary, borderColor: darkTheme.border }}>
                    {transaction.reason || transaction.note}
                  </TableCell>
                </TableRow>
              ))}
              {recentHistory.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    sx={{
                      textAlign: 'center',
                      color: darkTheme.textSecondary,
                      borderColor: darkTheme.border,
                      py: 4,
                    }}
                  >
                    거래 내역이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default RecentPPLogTable;
