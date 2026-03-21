import React from 'react';
import { TextField, Stack, FormControlLabel, Switch } from '@mui/material';
import type { StripeConfig } from './Configuration.types';

interface StripeFormFieldsProps {
  config: StripeConfig;
  onChange: (key: keyof StripeConfig, value: string) => void;
}

const StripeFormFields: React.FC<StripeFormFieldsProps> = ({ config, onChange }) => (
  <Stack spacing={2}>
    <TextField
      label="Publishable Key"
      value={config.publishableKey}
      onChange={(e) => onChange('publishableKey', e.target.value)}
      fullWidth
      helperText="Starts with pk_test_ or pk_live_"
    />
    <TextField
      label="Secret Key"
      type="password"
      value={config.secretKey}
      onChange={(e) => onChange('secretKey', e.target.value)}
      fullWidth
      helperText="Starts with sk_test_ or sk_live_"
    />
    <TextField
      label="Webhook Secret"
      type="password"
      value={config.webhookSecret}
      onChange={(e) => onChange('webhookSecret', e.target.value)}
      fullWidth
      helperText="Starts with whsec_"
    />
    <FormControlLabel
      control={
        <Switch
          checked={config.enabled === 'true'}
          onChange={(e) => onChange('enabled', e.target.checked ? 'true' : 'false')}
        />
      }
      label="Enable Stripe Payments"
    />
  </Stack>
);

export default StripeFormFields;
