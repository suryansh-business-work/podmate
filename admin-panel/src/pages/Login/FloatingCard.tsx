import React from 'react';
import { Box, Typography } from '@mui/material';

interface FloatingCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay?: number;
}

const FloatingCard: React.FC<FloatingCardProps> = ({
  icon, title, subtitle, top, left, right, bottom, delay = 0,
}) => (
  <Box
    sx={{
      position: 'absolute',
      top, left, right, bottom,
      bgcolor: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(12px)',
      borderRadius: 3,
      p: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      minWidth: 200,
      animation: `floatIn 0.8s ease-out ${delay}s both`,
      '@keyframes floatIn': {
        '0%': { opacity: 0, transform: 'translateY(20px)' },
        '100%': { opacity: 1, transform: 'translateY(0)' },
      },
    }}
  >
    <Box
      sx={{
        width: 40, height: 40, borderRadius: 2,
        bgcolor: 'rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" sx={{ color: '#FFF', fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
        {subtitle}
      </Typography>
    </Box>
  </Box>
);

export default FloatingCard;
