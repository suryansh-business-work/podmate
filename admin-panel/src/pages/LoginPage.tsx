import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
  InputAdornment,
  IconButton,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import CelebrationIcon from '@mui/icons-material/Celebration';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@apollo/client';
import { ADMIN_LOGIN, SEND_ADMIN_CREDENTIALS } from '../graphql/mutations';

const loginSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

interface LoginPageProps {
  onLogin: (token: string) => void;
}

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

const FloatingCard: React.FC<FloatingCardProps> = ({ icon, title, subtitle, top, left, right, bottom, delay = 0 }) => (
  <Box
    sx={{
      position: 'absolute',
      top,
      left,
      right,
      bottom,
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
        width: 40,
        height: 40,
        borderRadius: 2,
        bgcolor: 'rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
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

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [snackMessage, setSnackMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [adminLogin] = useMutation(ADMIN_LOGIN);
  const [sendCredentials, { loading: sendingCredentials }] = useMutation(SEND_ADMIN_CREDENTIALS);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError('');
        const { data } = await adminLogin({
          variables: { email: values.email, password: values.password },
        });
        if (data?.adminLogin?.token) {
          localStorage.setItem('admin-token', data.adminLogin.token);
          onLogin(data.adminLogin.token);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleSendCredentials = async () => {
    try {
      const { data } = await sendCredentials({ variables: { email: 'suryansh@exyconn.com' } });
      if (data?.sendAdminCredentials?.success) {
        setSnackMessage('Credentials sent to suryansh@exyconn.com');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send credentials';
      setError(message);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Left side - Login Form */}
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
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          {/* Brand */}
          <Box sx={{ mb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #FF3370, #F50247)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(245,2,71,0.3)',
                }}
              >
                <GroupsIcon sx={{ color: '#FFF', fontSize: 26 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.3 }}>
                PartyWings
              </Typography>
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: { xs: 28, sm: 32 },
                letterSpacing: -0.5,
                mb: 1,
              }}
            >
              Welcome back
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: 15 }}>
              Sign in to access your admin dashboard
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', letterSpacing: 0.5, mb: 0.5, display: 'block' }}>
              EMAIL
            </Typography>
            <TextField
              name="email"
              type="email"
              placeholder="admin@partywings.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', letterSpacing: 0.5, mb: 0.5, display: 'block' }}>
              PASSWORD
            </Typography>
            <TextField
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              sx={{ mb: 3.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} />
                      ) : (
                        <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
              sx={{
                background: 'linear-gradient(135deg, #F50247 0%, #FF3370 100%)',
                py: 1.6,
                fontSize: 15,
                fontWeight: 700,
                mb: 2,
                boxShadow: '0 4px 20px rgba(245,2,71,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #C7003A 0%, #F50247 100%)',
                  boxShadow: '0 6px 24px rgba(245,2,71,0.45)',
                },
              }}
            >
              {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>

            <Button
              variant="text"
              fullWidth
              size="small"
              onClick={handleSendCredentials}
              disabled={sendingCredentials}
              sx={{
                color: 'text.secondary',
                fontSize: 13,
                '&:hover': { bgcolor: 'rgba(245,2,71,0.04)' },
              }}
            >
              {sendingCredentials ? (
                <CircularProgress size={16} sx={{ mr: 1 }} />
              ) : null}
              Forgot password? Send credentials to email
            </Button>
          </form>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 5, fontSize: 12 }}
          >
            © {new Date().getFullYear()} PartyWings. All rights reserved.
          </Typography>
        </Box>
      </Box>

      {/* Right side - Decorative branding panel */}
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
        {/* Background pattern circles */}
        <Box
          sx={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.05)',
            top: -80,
            right: -80,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.05)',
            bottom: -60,
            left: -60,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.03)',
            top: '50%',
            left: '20%',
          }}
        />

        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
            }}
          >
            <GroupsIcon sx={{ color: '#FFF', fontSize: 44 }} />
          </Box>

          <Typography
            variant="h3"
            sx={{
              color: '#FFF',
              fontWeight: 800,
              fontSize: { md: 36, lg: 42 },
              lineHeight: 1.15,
              mb: 2,
              letterSpacing: -0.5,
            }}
          >
            Manage your community with ease
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 16,
              lineHeight: 1.6,
              mb: 5,
            }}
          >
            Monitor pods, manage users, handle support tickets, and oversee venue policies — all from one dashboard.
          </Typography>
        </Box>

        {/* Floating UI cards */}
        <FloatingCard
          icon={<CelebrationIcon sx={{ color: '#FFF', fontSize: 22 }} />}
          title="12 Active Pods"
          subtitle="3 new today"
          top="18%"
          left="8%"
          delay={0.2}
        />
        <FloatingCard
          icon={<EmojiPeopleIcon sx={{ color: '#FFF', fontSize: 22 }} />}
          title="248 Users"
          subtitle="Growing community"
          top="35%"
          right="6%"
          delay={0.5}
        />
        <FloatingCard
          icon={<EventAvailableIcon sx={{ color: '#FFF', fontSize: 22 }} />}
          title="Next Event"
          subtitle="Tomorrow, 8 PM"
          bottom="20%"
          left="12%"
          delay={0.8}
        />
      </Box>

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
