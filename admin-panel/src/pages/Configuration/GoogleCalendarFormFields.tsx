import React from 'react';
import { TextField, Stack, FormControlLabel, Switch, Typography, Alert, Link } from '@mui/material';
import type { GoogleCalendarConfig } from './Configuration.types';

interface GoogleCalendarFormFieldsProps {
  config: GoogleCalendarConfig;
  onChange: (key: keyof GoogleCalendarConfig, value: string) => void;
}

const GoogleCalendarFormFields: React.FC<GoogleCalendarFormFieldsProps> = ({
  config,
  onChange,
}) => (
  <Stack spacing={2}>
    <Alert severity="info" sx={{ mb: 1 }}>
      <Typography variant="body2" gutterBottom>
        <strong>How to get a Refresh Token:</strong>
      </Typography>
      <Typography variant="body2" component="ol" sx={{ pl: 2, m: 0 }}>
        <li>
          Go to{' '}
          <Link
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Cloud Console &gt; Credentials
          </Link>
        </li>
        <li>Create an OAuth 2.0 Client ID (Web application type)</li>
        <li>
          Enable the{' '}
          <Link
            href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Calendar API
          </Link>
        </li>
        <li>
          Open{' '}
          <Link
            href="https://developers.google.com/oauthplayground/"
            target="_blank"
            rel="noopener noreferrer"
          >
            OAuth 2.0 Playground
          </Link>
        </li>
        <li>
          Click the gear icon, check &quot;Use your own OAuth credentials&quot;, and enter your
          Client ID &amp; Secret
        </li>
        <li>
          Select scope:{' '}
          <code>https://www.googleapis.com/auth/calendar</code>
        </li>
        <li>Authorize APIs &rarr; Exchange authorization code for tokens</li>
        <li>Copy the <strong>Refresh Token</strong> from the response</li>
      </Typography>
    </Alert>
    <TextField
      label="Client ID"
      value={config.clientId}
      onChange={(e) => onChange('clientId', e.target.value)}
      fullWidth
      helperText="OAuth 2.0 Client ID from Google Cloud Console"
    />
    <TextField
      label="Client Secret"
      type="password"
      value={config.clientSecret}
      onChange={(e) => onChange('clientSecret', e.target.value)}
      fullWidth
      helperText="OAuth 2.0 Client Secret from Google Cloud Console"
    />
    <TextField
      label="Refresh Token"
      type="password"
      value={config.refreshToken}
      onChange={(e) => onChange('refreshToken', e.target.value)}
      fullWidth
      helperText="OAuth 2.0 Refresh Token — see instructions above"
    />
    <TextField
      label="Calendar ID"
      value={config.calendarId}
      onChange={(e) => onChange('calendarId', e.target.value)}
      fullWidth
      helperText="Calendar ID (use 'primary' for the main calendar)"
    />
    <FormControlLabel
      control={
        <Switch
          checked={config.enabled === 'true'}
          onChange={(e) => onChange('enabled', e.target.checked ? 'true' : 'false')}
        />
      }
      label="Enable Google Calendar Integration"
    />
  </Stack>
);

export default GoogleCalendarFormFields;
