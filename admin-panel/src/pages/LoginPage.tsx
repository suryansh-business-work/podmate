import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
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

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [snackMessage, setSnackMessage] = useState('');

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
    const email = formik.values.email;
    if (!email || formik.errors.email) {
      setError('Please enter a valid email first');
      return;
    }
    try {
      const { data } = await sendCredentials({ variables: { email } });
      if (data?.sendAdminCredentials?.success) {
        setSnackMessage('Credentials sent to your email!');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send credentials';
      setError(message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #5B4CDB 0%, #A78BFA 100%)',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=200&fit=crop"
              alt="PartyWings"
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                objectFit: 'cover',
                margin: '0 auto 16px',
                display: 'block',
                boxShadow: '0 4px 12px rgba(91,76,219,0.3)',
              }}
            />
            <Typography variant="h5" gutterBottom>
              PartyWings Admin
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in with your admin credentials
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              placeholder="suryansh@exyconn.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
              sx={{
                background: 'linear-gradient(135deg, #5B4CDB, #A78BFA)',
                py: 1.5,
                fontSize: 16,
                mb: 2,
              }}
            >
              {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              size="small"
              onClick={handleSendCredentials}
              disabled={sendingCredentials || !formik.values.email || Boolean(formik.errors.email)}
              sx={{ textTransform: 'none' }}
            >
              {sendingCredentials ? (
                <CircularProgress size={18} sx={{ mr: 1 }} />
              ) : null}
              Send Credentials to Email
            </Button>
          </form>
        </CardContent>
      </Card>

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
