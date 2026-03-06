import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useFormik } from 'formik';
import { useMutation } from '@apollo/client';
import { ADMIN_LOGIN, SEND_ADMIN_CREDENTIALS } from '../../graphql/mutations';
import { loginSchema } from './Login.types';

interface LoginFormProps {
  onLogin: (token: string) => void;
  error: string;
  setError: (msg: string) => void;
  setSnackMessage: (msg: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, error, setError, setSnackMessage }) => {
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
    <Box sx={{ width: '100%', maxWidth: 420 }}>
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
            <Typography sx={{ color: '#FFF', fontSize: 26, display: 'flex' }}>🎉</Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.3 }}>
            PartyWings
          </Typography>
        </Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, fontSize: { xs: 28, sm: 32 }, letterSpacing: -0.5, mb: 1 }}
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
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            letterSpacing: 0.5,
            mb: 0.5,
            display: 'block',
          }}
        >
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

        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            letterSpacing: 0.5,
            mb: 0.5,
            display: 'block',
          }}
        >
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
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
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
          {sendingCredentials ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
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
  );
};

export default LoginForm;
