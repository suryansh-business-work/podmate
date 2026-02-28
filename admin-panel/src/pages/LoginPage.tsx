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
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const loginSchema = Yup.object({
  phone: Yup.string()
    .matches(/^\+?\d{10,15}$/, 'Enter a valid phone number')
    .required('Phone number is required'),
  otp: Yup.string()
    .length(6, 'OTP must be 6 digits')
    .matches(/^\d+$/, 'OTP must contain only numbers')
    .required('OTP is required'),
});

interface LoginPageProps {
  onLogin: (token: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const formik = useFormik({
    initialValues: { phone: '', otp: '' },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError('');
        if (values.otp === '123456') {
          const token = 'admin-dev-token-' + Date.now();
          localStorage.setItem('admin-token', token);
          onLogin(token);
        } else {
          setError('Invalid OTP. Default OTP is 123456.');
        }
      } catch {
        setError('Login failed. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleSendOtp = () => {
    if (formik.values.phone && !formik.errors.phone) {
      setOtpSent(true);
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
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #7B6EE8, #5B4CDB)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 28,
              }}
            >
              👥
            </Box>
            <Typography variant="h5" gutterBottom>
              PartyWings Admin
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to manage your platform
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <TextField
              label="Phone Number"
              name="phone"
              placeholder="+919999999999"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: !otpSent && (
                  <Button
                    size="small"
                    onClick={handleSendOtp}
                    disabled={!formik.values.phone || Boolean(formik.errors.phone)}
                  >
                    Send OTP
                  </Button>
                ),
              }}
            />

            {otpSent && (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  OTP sent! Default development OTP: <strong>123456</strong>
                </Alert>
                <TextField
                  label="OTP Code"
                  name="otp"
                  placeholder="123456"
                  value={formik.values.otp}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.otp && Boolean(formik.errors.otp)}
                  helperText={formik.touched.otp && formik.errors.otp}
                  sx={{ mb: 3 }}
                  inputProps={{ maxLength: 6 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={formik.isSubmitting}
                  sx={{
                    background: 'linear-gradient(135deg, #5B4CDB, #A78BFA)',
                    py: 1.5,
                    fontSize: 16,
                  }}
                >
                  {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
