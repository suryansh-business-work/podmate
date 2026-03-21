import React from 'react';
import { TextField, Stack, FormControlLabel, Switch, Typography } from '@mui/material';
import type { AppConfig, DevConfig } from './Configuration.types';

interface AppSettingsFormFieldsProps {
  config: AppConfig;
  onChange: (key: keyof AppConfig, value: string) => void;
}

export const AppSettingsFormFields: React.FC<AppSettingsFormFieldsProps> = ({
  config,
  onChange,
}) => (
  <Stack spacing={2}>
    <TextField
      label="App Name"
      value={config.appName}
      onChange={(e) => onChange('appName', e.target.value)}
      fullWidth
    />
    <TextField
      label="App Description"
      value={config.appDescription}
      onChange={(e) => onChange('appDescription', e.target.value)}
      fullWidth
      multiline
      rows={2}
    />
    <TextField
      label="App Logo URL"
      value={config.appLogo}
      onChange={(e) => onChange('appLogo', e.target.value)}
      fullWidth
      helperText="Upload via ImageKit and paste the URL"
    />
    <TextField
      label="Splash Video URL"
      value={config.splashVideoUrl}
      onChange={(e) => onChange('splashVideoUrl', e.target.value)}
      fullWidth
      helperText="Upload video via ImageKit and paste the URL"
    />
  </Stack>
);

interface DevelopmentFormFieldsProps {
  config: DevConfig;
  onChange: (key: keyof DevConfig, value: string) => void;
}

export const DevelopmentFormFields: React.FC<DevelopmentFormFieldsProps> = ({
  config,
  onChange,
}) => (
  <Stack spacing={2}>
    <FormControlLabel
      control={
        <Switch
          checked={config.devMode === 'true'}
          onChange={(e) => onChange('devMode', e.target.checked ? 'true' : 'false')}
        />
      }
      label="Development Mode"
    />
    <Typography variant="caption" color="text.secondary">
      When enabled, uses dev endpoints and shows debug info.
    </Typography>
    <FormControlLabel
      control={
        <Switch
          checked={config.dummyCheckout === 'true'}
          onChange={(e) => onChange('dummyCheckout', e.target.checked ? 'true' : 'false')}
        />
      }
      label="Dummy Payment Checkout"
    />
    <Typography variant="caption" color="text.secondary">
      When enabled, all payments will be simulated without real charges.
    </Typography>
  </Stack>
);
