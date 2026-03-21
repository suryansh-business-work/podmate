import React from 'react';
import { TextField, Stack, FormControlLabel, Switch } from '@mui/material';
import type { ImageKitConfig, SlackConfig, GoogleMapsConfig } from './Configuration.types';

interface ImageKitFormFieldsProps {
  config: ImageKitConfig;
  onChange: (key: keyof ImageKitConfig, value: string) => void;
}

export const ImageKitFormFields: React.FC<ImageKitFormFieldsProps> = ({ config, onChange }) => (
  <Stack spacing={2}>
    <TextField
      label="Public Key"
      value={config.publicKey}
      onChange={(e) => onChange('publicKey', e.target.value)}
      fullWidth
    />
    <TextField
      label="Private Key"
      type="password"
      value={config.privateKey}
      onChange={(e) => onChange('privateKey', e.target.value)}
      fullWidth
    />
    <TextField
      label="URL Endpoint"
      value={config.urlEndpoint}
      onChange={(e) => onChange('urlEndpoint', e.target.value)}
      fullWidth
    />
  </Stack>
);

interface SlackFormFieldsProps {
  config: SlackConfig;
  onChange: (key: keyof SlackConfig, value: string) => void;
}

export const SlackFormFields: React.FC<SlackFormFieldsProps> = ({ config, onChange }) => (
  <Stack spacing={2}>
    <TextField
      label="Webhook URL"
      value={config.webhookUrl}
      onChange={(e) => onChange('webhookUrl', e.target.value)}
      fullWidth
    />
    <TextField
      label="Channel"
      value={config.channel}
      onChange={(e) => onChange('channel', e.target.value)}
      fullWidth
    />
    <FormControlLabel
      control={
        <Switch
          checked={config.enabled === 'true'}
          onChange={(e) => onChange('enabled', e.target.checked ? 'true' : 'false')}
        />
      }
      label="Enable Slack Notifications"
    />
  </Stack>
);

interface GoogleMapsFormFieldsProps {
  config: GoogleMapsConfig;
  onChange: (key: keyof GoogleMapsConfig, value: string) => void;
}

export const GoogleMapsFormFields: React.FC<GoogleMapsFormFieldsProps> = ({ config, onChange }) => (
  <Stack spacing={2}>
    <TextField
      label="API Key"
      value={config.apiKey}
      onChange={(e) => onChange('apiKey', e.target.value)}
      fullWidth
      helperText="Google Maps Platform API key with Maps SDK & Places API enabled"
    />
    <FormControlLabel
      control={
        <Switch
          checked={config.enabled === 'true'}
          onChange={(e) => onChange('enabled', e.target.checked ? 'true' : 'false')}
        />
      }
      label="Enable Google Maps"
    />
  </Stack>
);
