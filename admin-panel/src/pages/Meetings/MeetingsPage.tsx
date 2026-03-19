import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useNavigate } from 'react-router-dom';
import MeetingsTab from './MeetingsTab';

const MeetingsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => navigate('/dashboard')}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Typography sx={{ display: 'flex', alignItems: 'center' }} color="text.primary">
          <VideocamIcon sx={{ mr: 0.5 }} fontSize="small" />
          1:1 Meetings
        </Typography>
      </Breadcrumbs>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        1:1 Meetings
      </Typography>

      <MeetingsTab />
    </Box>
  );
};

export default MeetingsPage;
