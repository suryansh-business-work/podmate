import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useConfigurationState } from './useConfigurationState';
import ConfigurationTabPanels from './ConfigurationTabPanels';

const ConfigurationPage: React.FC = () => {
  const c = useConfigurationState();

  if (c.loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          href="/dashboard"
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
        </Link>
        <Typography color="text.primary" fontWeight={600}>
          Configuration
        </Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} mb={3}>
        Configuration
      </Typography>

      {c.error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => c.setError('')}>
          {c.error}
        </Alert>
      )}
      {c.success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => c.setSuccess('')}>
          {c.success}
        </Alert>
      )}
      {c.testResult && (
        <Alert
          severity={c.testResult.success ? 'success' : 'error'}
          sx={{ mb: 2 }}
          onClose={() => c.setTestResult(null)}
        >
          {c.testResult.message}
        </Alert>
      )}

      <Card>
        <Tabs
          value={c.tab}
          onChange={(_, v) => c.setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="SMTP" />
          <Tab label="ImageKit" />
          <Tab label="Slack" />
          <Tab label="Stripe" />
          <Tab label="Google Maps" />
          <Tab label="Google Calendar" />
          <Tab label="App Settings" />
          <Tab label="Development" />
        </Tabs>
        <CardContent>
          <ConfigurationTabPanels state={c} />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ConfigurationPage;
