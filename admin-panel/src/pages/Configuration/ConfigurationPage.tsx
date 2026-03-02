import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Button,
  CircularProgress, Alert, Breadcrumbs, Link, Divider,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SaveIcon from '@mui/icons-material/Save';
import { useQuery, useMutation } from '@apollo/client';
import { GET_APP_SETTINGS } from '../../graphql/queries';
import { UPSERT_SETTING } from '../../graphql/mutations';
import { AppSetting, SettingsData, SmtpConfig, SMTP_KEYS, DEFAULT_SMTP } from './Configuration.types';
import SmtpFormFields from './SmtpFormFields';

const ConfigurationPage: React.FC = () => {
  const [smtp, setSmtp] = useState<SmtpConfig>({ ...DEFAULT_SMTP });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { data, loading } = useQuery<SettingsData>(GET_APP_SETTINGS, {
    fetchPolicy: 'cache-and-network',
  });

  const [upsertSetting, { loading: saving }] = useMutation(UPSERT_SETTING);

  const populateFromSettings = useCallback((settings: AppSetting[]) => {
    const smtpSettings = settings.filter((s) => s.category === 'smtp');
    const newSmtp: SmtpConfig = { ...DEFAULT_SMTP };
    smtpSettings.forEach((s) => {
      const field = s.key.replace('smtp_', '') as keyof SmtpConfig;
      if (field in newSmtp) {
        newSmtp[field] = s.value;
      }
    });
    setSmtp(newSmtp);
  }, []);

  useEffect(() => {
    if (data?.appSettings) {
      populateFromSettings(data.appSettings);
    }
  }, [data, populateFromSettings]);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    try {
      const promises = SMTP_KEYS.map(({ key }) =>
        upsertSetting({
          variables: {
            input: { key: `smtp_${key}`, value: smtp[key], category: 'smtp' },
          },
        }),
      );
      await Promise.all(promises);
      setSuccess('SMTP configuration saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    }
  };

  const handleChange = (key: keyof SmtpConfig, value: string) => {
    setSmtp((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} color="inherit">
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Typography color="text.primary" fontWeight={600}>Configuration</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} mb={3}>Configuration</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <CardContent>
          <Typography variant="h6" mb={1}>Email / SMTP Configuration</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Configure SMTP settings for sending emails (OTP, notifications, admin credentials).
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <SmtpFormFields smtp={smtp} onChange={handleChange} />

          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ConfigurationPage;
