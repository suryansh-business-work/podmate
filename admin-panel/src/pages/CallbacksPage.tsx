import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PhoneCallbackIcon from '@mui/icons-material/PhoneCallback';
import { useNavigate } from 'react-router-dom';
import CallbackRequestsTab from './Support/CallbackRequestsTab';

const CallbacksPage: React.FC = () => {
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
        <Typography
          sx={{ display: 'flex', alignItems: 'center' }}
          color="text.primary"
        >
          <PhoneCallbackIcon sx={{ mr: 0.5 }} fontSize="small" />
          Callback Requests
        </Typography>
      </Breadcrumbs>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Callback Requests
      </Typography>

      <CallbackRequestsTab />
    </Box>
  );
};

export default CallbacksPage;
