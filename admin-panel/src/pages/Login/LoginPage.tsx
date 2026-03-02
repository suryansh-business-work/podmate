import React, { useState } from 'react';
import { Box, Snackbar } from '@mui/material';
import { LoginPageProps } from './Login.types';
import LoginForm from './LoginForm';
import BrandPanel from './BrandPanel';

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [snackMessage, setSnackMessage] = useState('');

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 50%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 6 },
          bgcolor: 'background.paper',
          minHeight: { xs: '100vh', md: 'auto' },
        }}
      >
        <LoginForm onLogin={onLogin} error={error} setError={setError} setSnackMessage={setSnackMessage} />
      </Box>

      <BrandPanel />

      <Snackbar
        open={Boolean(snackMessage)}
        autoHideDuration={4000}
        onClose={() => setSnackMessage('')}
        message={snackMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default LoginPage;
