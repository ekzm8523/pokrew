import React from "react";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { darkTheme } from "../../constants/theme";

const PPFlowChart = ({ data }) => {
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
          <Typography
            variant="h6"
            sx={{ color: darkTheme.textPrimary, flexGrow: 1 }}
          >
            월별 PP 흐름
          </Typography>
          <Chip label="TODO: 실제 데이터 연동 필요" size="small" color="warning" sx={{ ml: 1 }} />
        </Box>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkTheme.border} />
            <XAxis
              dataKey="month"
              stroke={darkTheme.textSecondary}
              tick={{ fill: darkTheme.textSecondary }}
            />
            <YAxis
              stroke={darkTheme.textSecondary}
              tick={{ fill: darkTheme.textSecondary }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: darkTheme.cardBackground,
                border: `1px solid ${darkTheme.border}`,
                color: darkTheme.textPrimary,
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="입금"
              stroke={darkTheme.green}
              strokeWidth={3}
              dot={{ fill: darkTheme.green, strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="출금"
              stroke={darkTheme.red}
              strokeWidth={3}
              dot={{ fill: darkTheme.red, strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PPFlowChart; 