import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { darkTheme } from '../../constants/theme';

const ModeCard = ({ title, subtitle, icon, isActive = false }) => (
  <Card
    sx={{
      bgcolor: isActive ? darkTheme.cardBackground : darkTheme.background,
      border: `2px solid ${isActive ? darkTheme.gold : darkTheme.border}`,
      borderRadius: 4,
      height: '100%',
      minHeight: 100,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: darkTheme.gold,
        transform: 'translateY(-2px)',
      },
    }}
  >
    <CardContent sx={{ p: 2, textAlign: 'center' }}>
      <Box sx={{ color: isActive ? darkTheme.gold : darkTheme.textSecondary, mb: 1 }}>{icon}</Box>
      <Typography
        variant="h6"
        sx={{
          color: isActive ? darkTheme.gold : darkTheme.textPrimary,
          fontWeight: 'bold',
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

export default ModeCard;
