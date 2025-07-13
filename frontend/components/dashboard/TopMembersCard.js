import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { darkTheme } from '../../constants/theme';
import { formatPP } from '../../utils/format';

const TopMembersCard = ({ topMembers = [] }) => {
  return (
    <Card
      sx={{
        bgcolor: darkTheme.cardBackground,
        border: `2px solid ${darkTheme.gold}`,
        borderRadius: 4,
        height: '100%',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EmojiEvents sx={{ fontSize: 40, color: darkTheme.gold, mr: 2 }} />
          <Box>
            <Typography variant="h6" sx={{ color: darkTheme.gold, fontWeight: 'bold' }}>
              Top 5 Members
            </Typography>
            <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
              이달의 PP 순위
            </Typography>
          </Box>
        </Box>
        <Box>
          {topMembers.map((member, index) => (
            <Box
              key={member.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
                mb: 1,
                borderRadius: 2,
                bgcolor: index === 0 ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                border: index === 0 ? `1px solid ${darkTheme.gold}` : 'none',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: index === 0 ? darkTheme.gold : darkTheme.textPrimary,
                    fontWeight: 'bold',
                    mr: 2,
                    minWidth: 30,
                  }}
                >
                  #{member.rank}
                </Typography>
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ color: darkTheme.textPrimary, fontWeight: 'bold' }}
                  >
                    {member.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: darkTheme.textSecondary }}>
                    {member.tier}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ color: darkTheme.gold, fontWeight: 'bold' }}>
                {formatPP(member.totalDeposit)}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopMembersCard;
