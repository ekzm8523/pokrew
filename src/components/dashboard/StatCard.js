import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { darkTheme } from "../../constants/theme";

const StatCard = ({ title, value, icon, color = darkTheme.gold }) => (
  <Card
    sx={{
      bgcolor: darkTheme.cardBackground,
      border: `1px solid ${darkTheme.border}`,
      borderRadius: 4,
      height: "100%",
      transition: "all 0.3s ease",
      "&:hover": {
        borderColor: color,
        transform: "translateY(-2px)",
        boxShadow: `0 8px 25px rgba(0, 0, 0, 0.3)`,
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box sx={{ mr: 2 }}>{icon}</Box>
        <Typography
          variant="body2"
          sx={{ color: darkTheme.textSecondary, fontWeight: "500" }}
        >
          {title}
        </Typography>
      </Box>
      <Typography
        variant="h4"
        sx={{
          color: color,
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export default StatCard; 