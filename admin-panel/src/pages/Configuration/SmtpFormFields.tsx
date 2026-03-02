import React from 'react';
import { Box, TextField, Divider } from '@mui/material';
import { SmtpConfig } from './Configuration.types';

interface SmtpFormFieldsProps {
  smtp: SmtpConfig;
  onChange: (key: keyof SmtpConfig, value: string) => void;
}

const SmtpFormFields: React.FC<SmtpFormFieldsProps> = ({ smtp, onChange }) => (
  <Box display="flex" flexDirection="column" gap={2.5}>
    <Box display="flex" gap={2}>
      <TextField
        label="SMTP Host"
        value={smtp.host}
        onChange={(e) => onChange('host', e.target.value)}
        fullWidth
        placeholder="smtp.gmail.com"
      />
      <TextField
        label="SMTP Port"
        value={smtp.port}
        onChange={(e) => onChange('port', e.target.value)}
        sx={{ width: 200 }}
        placeholder="587"
      />
    </Box>
    <Box display="flex" gap={2}>
      <TextField
        label="SMTP Username"
        value={smtp.user}
        onChange={(e) => onChange('user', e.target.value)}
        fullWidth
        placeholder="your-email@gmail.com"
      />
      <TextField
        label="SMTP Password"
        type="password"
        value={smtp.password}
        onChange={(e) => onChange('password', e.target.value)}
        fullWidth
        placeholder="••••••••"
      />
    </Box>

    <Divider />

    <Box display="flex" gap={2}>
      <TextField
        label="From Name"
        value={smtp.fromName}
        onChange={(e) => onChange('fromName', e.target.value)}
        fullWidth
        placeholder="PartyWings"
      />
      <TextField
        label="From Email"
        type="email"
        value={smtp.fromEmail}
        onChange={(e) => onChange('fromEmail', e.target.value)}
        fullWidth
        placeholder="noreply@partywings.com"
      />
    </Box>
  </Box>
);

export default SmtpFormFields;
