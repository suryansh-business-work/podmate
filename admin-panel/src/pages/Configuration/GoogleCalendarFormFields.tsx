import React from 'react';
import { TextField, Stack, FormControlLabel, Switch } from '@mui/material';
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
      helperText="OAuth 2.0 Refresh Token (obtained via OAuth consent flow)"
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
