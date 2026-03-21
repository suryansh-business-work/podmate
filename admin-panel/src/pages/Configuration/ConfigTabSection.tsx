import React from 'react';
import { Typography, Button, Divider, Stack, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';

interface ConfigTabSectionProps {
  title: string;
  description: string;
  saving: boolean;
  onSave: () => void;
  testing?: boolean;
  onTest?: () => void;
  children: React.ReactNode;
}

const ConfigTabSection: React.FC<ConfigTabSectionProps> = ({
  title,
  description,
  saving,
  onSave,
  testing,
  onTest,
  children,
}) => (
  <>
    <Typography variant="h6" mb={1}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" mb={3}>
      {description}
    </Typography>
    <Divider sx={{ mb: 3 }} />
    {children}
    <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
      {onTest && (
        <Button
          variant="outlined"
          startIcon={testing ? <CircularProgress size={18} /> : <NetworkCheckIcon />}
          onClick={onTest}
          disabled={testing}
        >
          Test Connection
        </Button>
      )}
      <Button
        variant="contained"
        startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
        onClick={onSave}
        disabled={saving}
      >
        Save
      </Button>
    </Stack>
  </>
);

export default ConfigTabSection;
