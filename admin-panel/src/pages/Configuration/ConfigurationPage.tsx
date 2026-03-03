import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Tabs, Tab, TextField, MenuItem,
  CircularProgress, Alert, Breadcrumbs, Link, Divider, Switch, FormControlLabel, Stack,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SaveIcon from '@mui/icons-material/Save';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import { useQuery, useMutation } from '@apollo/client';
import { GET_APP_SETTINGS } from '../../graphql/queries';
import { UPSERT_SETTING, TEST_SMTP_CONNECTION, TEST_IMAGEKIT_CONNECTION } from '../../graphql/mutations';
import type {
  AppSetting, SettingsData, SmtpConfig, ImageKitConfig, SlackConfig,
  AppConfig, DevConfig, StripeConfig, GoogleMapsConfig, TestConnectionResult,
} from './Configuration.types';
import {
  DEFAULT_SMTP, DEFAULT_IMAGEKIT, DEFAULT_SLACK,
  DEFAULT_APP_CONFIG, DEFAULT_DEV_CONFIG, DEFAULT_STRIPE, DEFAULT_GOOGLE_MAPS,
} from './Configuration.types';
import SmtpFormFields from './SmtpFormFields';

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
);

const ConfigurationPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [smtp, setSmtp] = useState<SmtpConfig>({ ...DEFAULT_SMTP });
  const [imagekit, setImagekit] = useState<ImageKitConfig>({ ...DEFAULT_IMAGEKIT });
  const [slack, setSlack] = useState<SlackConfig>({ ...DEFAULT_SLACK });
  const [appConfig, setAppConfig] = useState<AppConfig>({ ...DEFAULT_APP_CONFIG });
  const [devConfig, setDevConfig] = useState<DevConfig>({ ...DEFAULT_DEV_CONFIG });
  const [stripe, setStripe] = useState<StripeConfig>({ ...DEFAULT_STRIPE });
  const [googleMaps, setGoogleMaps] = useState<GoogleMapsConfig>({ ...DEFAULT_GOOGLE_MAPS });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);

  const { data, loading } = useQuery<SettingsData>(GET_APP_SETTINGS, { fetchPolicy: 'cache-and-network' });
  const [upsertSetting, { loading: saving }] = useMutation(UPSERT_SETTING);
  const [testSmtp, { loading: testingSmtp }] = useMutation(TEST_SMTP_CONNECTION);
  const [testImageKit, { loading: testingImageKit }] = useMutation(TEST_IMAGEKIT_CONNECTION);

  const populateFromSettings = useCallback((settings: AppSetting[]) => {
    const get = (cat: string, key: string) => settings.find((s) => s.category === cat && s.key === key)?.value ?? '';

    setSmtp({
      host: get('smtp', 'smtp_host') || DEFAULT_SMTP.host,
      port: get('smtp', 'smtp_port') || DEFAULT_SMTP.port,
      user: get('smtp', 'smtp_user') || DEFAULT_SMTP.user,
      password: get('smtp', 'smtp_password') || DEFAULT_SMTP.password,
      fromName: get('smtp', 'smtp_fromName') || DEFAULT_SMTP.fromName,
      fromEmail: get('smtp', 'smtp_fromEmail') || DEFAULT_SMTP.fromEmail,
    });
    setImagekit({
      publicKey: get('imagekit', 'imagekit_public_key') || DEFAULT_IMAGEKIT.publicKey,
      privateKey: get('imagekit', 'imagekit_private_key') || DEFAULT_IMAGEKIT.privateKey,
      urlEndpoint: get('imagekit', 'imagekit_url_endpoint') || DEFAULT_IMAGEKIT.urlEndpoint,
    });
    setSlack({
      webhookUrl: get('slack', 'slack_webhook_url') || DEFAULT_SLACK.webhookUrl,
      channel: get('slack', 'slack_channel') || DEFAULT_SLACK.channel,
      enabled: get('slack', 'slack_enabled') || DEFAULT_SLACK.enabled,
    });
    setAppConfig({
      appName: get('app', 'app_name') || DEFAULT_APP_CONFIG.appName,
      appDescription: get('app', 'app_description') || DEFAULT_APP_CONFIG.appDescription,
      appLogo: get('app', 'app_logo') || DEFAULT_APP_CONFIG.appLogo,
      splashVideoUrl: get('app', 'app_splash_video_url') || DEFAULT_APP_CONFIG.splashVideoUrl,
    });
    setDevConfig({
      devMode: get('dev', 'dev_mode') || DEFAULT_DEV_CONFIG.devMode,
      dummyCheckout: get('dev', 'dummy_checkout') || DEFAULT_DEV_CONFIG.dummyCheckout,
    });
    setStripe({
      publishableKey: get('stripe', 'stripe_publishable_key') || DEFAULT_STRIPE.publishableKey,
      secretKey: get('stripe', 'stripe_secret_key') || DEFAULT_STRIPE.secretKey,
      webhookSecret: get('stripe', 'stripe_webhook_secret') || DEFAULT_STRIPE.webhookSecret,
      enabled: get('stripe', 'stripe_enabled') || DEFAULT_STRIPE.enabled,
    });
    setGoogleMaps({
      apiKey: get('googlemaps', 'google_maps_api_key') || DEFAULT_GOOGLE_MAPS.apiKey,
      enabled: get('googlemaps', 'google_maps_enabled') || DEFAULT_GOOGLE_MAPS.enabled,
    });
  }, []);

  useEffect(() => {
    if (data?.appSettings) populateFromSettings(data.appSettings);
  }, [data, populateFromSettings]);

  const saveCategory = async (category: string, entries: Array<{ key: string; value: string }>) => {
    setError('');
    setSuccess('');
    try {
      await Promise.all(
        entries.map((e) =>
          upsertSetting({ variables: { input: { key: e.key, value: e.value, category } } }),
        ),
      );
      setSuccess(`${category.toUpperCase()} configuration saved successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleTest = async (type: 'smtp' | 'imagekit') => {
    setTestResult(null);
    try {
      let result: { data?: Record<string, TestConnectionResult> };
      if (type === 'smtp') result = await testSmtp();
      else result = await testImageKit();

      const key = type === 'smtp' ? 'testSmtpConnection' : 'testImageKitConnection';
      const data = result?.data?.[key];
      if (data) setTestResult(data);
    } catch (err) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : 'Test failed' });
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} color="inherit" href="/dashboard">
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
        </Link>
        <Typography color="text.primary" fontWeight={600}>Configuration</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} mb={3}>Configuration</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {testResult && (
        <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mb: 2 }} onClose={() => setTestResult(null)}>
          {testResult.message}
        </Alert>
      )}

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="SMTP" />
          <Tab label="ImageKit" />
          <Tab label="Slack" />
          <Tab label="Stripe" />
          <Tab label="Google Maps" />
          <Tab label="App Settings" />
          <Tab label="Development" />
        </Tabs>

        <CardContent>
          {/* SMTP Tab */}
          <TabPanel value={tab} index={0}>
            <Typography variant="h6" mb={1}>Email / SMTP Configuration</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Configure SMTP settings for sending emails.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <SmtpFormFields smtp={smtp} onChange={(k, v) => setSmtp((p) => ({ ...p, [k]: v }))} />
            <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
              <Button variant="outlined" startIcon={testingSmtp ? <CircularProgress size={18} /> : <NetworkCheckIcon />}
                onClick={() => handleTest('smtp')} disabled={testingSmtp}>
                Test Connection
              </Button>
              <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                onClick={() => saveCategory('smtp', [
                  { key: 'smtp_host', value: smtp.host },
                  { key: 'smtp_port', value: smtp.port },
                  { key: 'smtp_user', value: smtp.user },
                  { key: 'smtp_password', value: smtp.password },
                  { key: 'smtp_fromName', value: smtp.fromName },
                  { key: 'smtp_fromEmail', value: smtp.fromEmail },
                ])} disabled={saving}>
                Save
              </Button>
            </Stack>
          </TabPanel>

          {/* ImageKit Tab */}
          <TabPanel value={tab} index={1}>
            <Typography variant="h6" mb={1}>ImageKit Configuration</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Configure ImageKit for media uploads and processing.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2}>
              <TextField label="Public Key" value={imagekit.publicKey}
                onChange={(e) => setImagekit((p) => ({ ...p, publicKey: e.target.value }))} fullWidth />
              <TextField label="Private Key" type="password" value={imagekit.privateKey}
                onChange={(e) => setImagekit((p) => ({ ...p, privateKey: e.target.value }))} fullWidth />
              <TextField label="URL Endpoint" value={imagekit.urlEndpoint}
                onChange={(e) => setImagekit((p) => ({ ...p, urlEndpoint: e.target.value }))} fullWidth />
            </Stack>
            <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
              <Button variant="outlined" startIcon={testingImageKit ? <CircularProgress size={18} /> : <NetworkCheckIcon />}
                onClick={() => handleTest('imagekit')} disabled={testingImageKit}>
                Test Connection
              </Button>
              <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                onClick={() => saveCategory('imagekit', [
                  { key: 'imagekit_public_key', value: imagekit.publicKey },
                  { key: 'imagekit_private_key', value: imagekit.privateKey },
                  { key: 'imagekit_url_endpoint', value: imagekit.urlEndpoint },
                ])} disabled={saving}>
                Save
              </Button>
            </Stack>
          </TabPanel>

          {/* Slack Tab */}
          <TabPanel value={tab} index={2}>
            <Typography variant="h6" mb={1}>Slack Configuration</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Configure Slack webhook for notifications.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2}>
              <TextField label="Webhook URL" value={slack.webhookUrl}
                onChange={(e) => setSlack((p) => ({ ...p, webhookUrl: e.target.value }))} fullWidth />
              <TextField label="Channel" value={slack.channel}
                onChange={(e) => setSlack((p) => ({ ...p, channel: e.target.value }))} fullWidth />
              <FormControlLabel control={
                <Switch checked={slack.enabled === 'true'}
                  onChange={(e) => setSlack((p) => ({ ...p, enabled: e.target.checked ? 'true' : 'false' }))} />
              } label="Enable Slack Notifications" />
            </Stack>
            <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
              <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                onClick={() => saveCategory('slack', [
                  { key: 'slack_webhook_url', value: slack.webhookUrl },
                  { key: 'slack_channel', value: slack.channel },
                  { key: 'slack_enabled', value: slack.enabled },
                ])} disabled={saving}>
                Save
              </Button>
            </Stack>
          </TabPanel>

          {/* Stripe Tab */}
          <TabPanel value={tab} index={3}>
            <Typography variant="h6" mb={1}>Stripe Payment Configuration</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Configure Stripe API keys for processing payments and refunds.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2}>
              <TextField label="Publishable Key" value={stripe.publishableKey}
                onChange={(e) => setStripe((p) => ({ ...p, publishableKey: e.target.value }))} fullWidth
                helperText="Starts with pk_test_ or pk_live_" />
              <TextField label="Secret Key" type="password" value={stripe.secretKey}
                onChange={(e) => setStripe((p) => ({ ...p, secretKey: e.target.value }))} fullWidth
                helperText="Starts with sk_test_ or sk_live_" />
              <TextField label="Webhook Secret" type="password" value={stripe.webhookSecret}
                onChange={(e) => setStripe((p) => ({ ...p, webhookSecret: e.target.value }))} fullWidth
                helperText="Starts with whsec_" />
              <FormControlLabel control={
                <Switch checked={stripe.enabled === 'true'}
                  onChange={(e) => setStripe((p) => ({ ...p, enabled: e.target.checked ? 'true' : 'false' }))} />
              } label="Enable Stripe Payments" />
            </Stack>
            <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
              <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                onClick={() => saveCategory('stripe', [
                  { key: 'stripe_publishable_key', value: stripe.publishableKey },
                  { key: 'stripe_secret_key', value: stripe.secretKey },
                  { key: 'stripe_webhook_secret', value: stripe.webhookSecret },
                  { key: 'stripe_enabled', value: stripe.enabled },
                ])} disabled={saving}>
                Save
              </Button>
            </Stack>
          </TabPanel>

          {/* Google Maps Tab */}
          <TabPanel value={tab} index={4}>
            <Typography variant="h6" mb={1}>Google Maps Configuration</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Configure Google Maps & Places API for location services.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2}>
              <TextField label="API Key" value={googleMaps.apiKey}
                onChange={(e) => setGoogleMaps((p) => ({ ...p, apiKey: e.target.value }))} fullWidth
                helperText="Google Maps Platform API key with Maps SDK & Places API enabled" />
              <FormControlLabel control={
                <Switch checked={googleMaps.enabled === 'true'}
                  onChange={(e) => setGoogleMaps((p) => ({ ...p, enabled: e.target.checked ? 'true' : 'false' }))} />
              } label="Enable Google Maps" />
            </Stack>
            <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
              <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                onClick={() => saveCategory('googlemaps', [
                  { key: 'google_maps_api_key', value: googleMaps.apiKey },
                  { key: 'google_maps_enabled', value: googleMaps.enabled },
                ])} disabled={saving}>
                Save
              </Button>
            </Stack>
          </TabPanel>

          {/* App Settings Tab */}
          <TabPanel value={tab} index={5}>
            <Typography variant="h6" mb={1}>App Settings</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Configure app-level settings like name, logo, and splash video.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2}>
              <TextField label="App Name" value={appConfig.appName}
                onChange={(e) => setAppConfig((p) => ({ ...p, appName: e.target.value }))} fullWidth />
              <TextField label="App Description" value={appConfig.appDescription}
                onChange={(e) => setAppConfig((p) => ({ ...p, appDescription: e.target.value }))} fullWidth multiline rows={2} />
              <TextField label="App Logo URL" value={appConfig.appLogo}
                onChange={(e) => setAppConfig((p) => ({ ...p, appLogo: e.target.value }))} fullWidth
                helperText="Upload via ImageKit and paste the URL" />
              <TextField label="Splash Video URL" value={appConfig.splashVideoUrl}
                onChange={(e) => setAppConfig((p) => ({ ...p, splashVideoUrl: e.target.value }))} fullWidth
                helperText="Upload video via ImageKit and paste the URL" />
            </Stack>
            <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
              <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                onClick={() => saveCategory('app', [
                  { key: 'app_name', value: appConfig.appName },
                  { key: 'app_description', value: appConfig.appDescription },
                  { key: 'app_logo', value: appConfig.appLogo },
                  { key: 'app_splash_video_url', value: appConfig.splashVideoUrl },
                ])} disabled={saving}>
                Save
              </Button>
            </Stack>
          </TabPanel>

          {/* Development Tab */}
          <TabPanel value={tab} index={6}>
            <Typography variant="h6" mb={1}>Development Settings</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Configure development mode and testing options.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2}>
              <FormControlLabel control={
                <Switch checked={devConfig.devMode === 'true'}
                  onChange={(e) => setDevConfig((p) => ({ ...p, devMode: e.target.checked ? 'true' : 'false' }))} />
              } label="Development Mode" />
              <Typography variant="caption" color="text.secondary">
                When enabled, uses dev endpoints and shows debug info.
              </Typography>
              <FormControlLabel control={
                <Switch checked={devConfig.dummyCheckout === 'true'}
                  onChange={(e) => setDevConfig((p) => ({ ...p, dummyCheckout: e.target.checked ? 'true' : 'false' }))} />
              } label="Dummy Payment Checkout" />
              <Typography variant="caption" color="text.secondary">
                When enabled, all payments will be simulated without real charges.
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
              <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                onClick={() => saveCategory('dev', [
                  { key: 'dev_mode', value: devConfig.devMode },
                  { key: 'dummy_checkout', value: devConfig.dummyCheckout },
                ])} disabled={saving}>
                Save
              </Button>
            </Stack>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ConfigurationPage;
