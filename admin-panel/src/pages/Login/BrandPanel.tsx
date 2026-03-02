import React from 'react';
import { Box, Typography } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import CelebrationIcon from '@mui/icons-material/Celebration';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FloatingCard from './FloatingCard';

const BrandPanel: React.FC = () => (
  <Box
    sx={{
      flex: { md: '0 0 50%' },
      display: { xs: 'none', md: 'flex' },
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F50247 0%, #9333EA 100%)',
      position: 'relative',
      overflow: 'hidden',
      p: 6,
    }}
  >
    <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', top: -80, right: -80 }} />
    <Box sx={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', bottom: -60, left: -60 }} />
    <Box sx={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)', top: '50%', left: '20%' }} />

    <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420 }}>
      <Box
        sx={{
          width: 80, height: 80, borderRadius: 4,
          bgcolor: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 4,
        }}
      >
        <GroupsIcon sx={{ color: '#FFF', fontSize: 44 }} />
      </Box>
      <Typography variant="h3" sx={{ color: '#FFF', fontWeight: 800, fontSize: { md: 36, lg: 42 }, lineHeight: 1.15, mb: 2, letterSpacing: -0.5 }}>
        Manage your community with ease
      </Typography>
      <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, lineHeight: 1.6, mb: 5 }}>
        Monitor pods, manage users, handle support tickets, and oversee venue policies — all from one dashboard.
      </Typography>
    </Box>

    <FloatingCard
      icon={<CelebrationIcon sx={{ color: '#FFF', fontSize: 22 }} />}
      title="12 Active Pods"
      subtitle="3 new today"
      top="18%" left="8%" delay={0.2}
    />
    <FloatingCard
      icon={<EmojiPeopleIcon sx={{ color: '#FFF', fontSize: 22 }} />}
      title="248 Users"
      subtitle="Growing community"
      top="35%" right="6%" delay={0.5}
    />
    <FloatingCard
      icon={<EventAvailableIcon sx={{ color: '#FFF', fontSize: 22 }} />}
      title="Next Event"
      subtitle="Tomorrow, 8 PM"
      bottom="20%" left="12%" delay={0.8}
    />
  </Box>
);

export default BrandPanel;
