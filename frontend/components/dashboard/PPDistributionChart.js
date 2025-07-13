import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { darkTheme } from '../../constants/theme';

const PPDistributionChart = ({ data }) => {
  return (
    <Card
      sx={{
        bgcolor: darkTheme.cardBackground,
        border: `1px solid ${darkTheme.border}`,
        borderRadius: 4,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ color: darkTheme.textPrimary, flexGrow: 1 }}>
            PP 분포 (사용자 티어별)
          </Typography>
          <Chip label="TODO: 실제 데이터 연동 필요" size="small" color="warning" sx={{ ml: 1 }} />
        </Box>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkTheme.border} />
            <XAxis
              dataKey="tier"
              stroke={darkTheme.textSecondary}
              tick={{ fill: darkTheme.textSecondary }}
            />
            <YAxis stroke={darkTheme.textSecondary} tick={{ fill: darkTheme.textSecondary }} />
            <Tooltip
              contentStyle={{
                backgroundColor: darkTheme.cardBackground,
                border: `1px solid ${darkTheme.border}`,
                color: darkTheme.textPrimary,
              }}
            />
            <Bar dataKey="pp" fill={darkTheme.gold} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PPDistributionChart;
