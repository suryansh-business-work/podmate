import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Divider,
  Stack,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_APP_SETTINGS,
  GET_MAINTENANCE_MODE,
  GET_MAINTENANCE_STATUS,
} from '../../graphql/queries';
import { UPSERT_SETTING, DELETE_SETTING } from '../../graphql/mutations';
import type {
  AppSetting,
  SettingsData,
  MaintenanceData,
  MaintenanceStatusData,
} from './Settings.types';
import SettingsTable from './SettingsTable';
import SettingDialog from './SettingDialog';

const SettingsPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editKey, setEditKey] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editCategory, setEditCategory] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  const { data, loading, refetch } = useQuery<SettingsData>(GET_APP_SETTINGS, {
    fetchPolicy: 'cache-and-network',
  });
  const { data: maintData, refetch: refetchMaint } =
    useQuery<MaintenanceData>(GET_MAINTENANCE_MODE);
  const { data: maintStatusData, refetch: refetchMaintStatus } =
    useQuery<MaintenanceStatusData>(GET_MAINTENANCE_STATUS);
  const [upsertSetting, { loading: saving }] = useMutation(UPSERT_SETTING);
  const [deleteSetting] = useMutation(DELETE_SETTING);

  const handleToggleMaintenance = async () => {
    const current = maintData?.maintenanceMode ?? false;
    try {
      await upsertSetting({
        variables: {
          input: { key: 'maintenance_mode', value: String(!current), category: 'general' },
        },
      });
      await refetchMaint();
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle maintenance mode');
    }
  };

  const handleToggleAppMaintenance = async () => {
    const current = maintStatusData?.maintenanceStatus?.app ?? false;
    try {
      await upsertSetting({
        variables: {
          input: { key: 'maintenance_mode_app', value: String(!current), category: 'general' },
        },
      });
      await refetchMaintStatus();
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle app maintenance mode');
    }
  };

  const handleToggleWebsiteMaintenance = async () => {
    const current = maintStatusData?.maintenanceStatus?.website ?? false;
    try {
      await upsertSetting({
        variables: {
          input: { key: 'maintenance_mode_website', value: String(!current), category: 'general' },
        },
      });
      await refetchMaintStatus();
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle website maintenance mode');
    }
  };

  const handleOpenDialog = (setting?: AppSetting) => {
    if (setting) {
      setEditKey(setting.key);
      setEditValue(setting.value);
      setEditCategory(setting.category);
      setIsEditing(true);
    } else {
      setEditKey('');
      setEditValue('');
      setEditCategory('general');
      setIsEditing(false);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setError('');
    if (!editKey.trim() || !editValue.trim()) {
      setError('Key and value are required');
      return;
    }
    try {
      await upsertSetting({
        variables: {
          input: { key: editKey.trim(), value: editValue.trim(), category: editCategory },
        },
      });
      setDialogOpen(false);
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save setting');
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await deleteSetting({ variables: { key } });
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete setting');
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );

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
          Settings
        </Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} mb={3}>
        App Settings
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Maintenance Mode
          </Typography>
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Global Maintenance
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Affects all platforms
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={maintData?.maintenanceMode ?? false}
                    onChange={handleToggleMaintenance}
                    color="warning"
                  />
                }
                label={maintData?.maintenanceMode ? 'ON' : 'OFF'}
              />
            </Box>
            <Divider />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Mobile App Maintenance
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Show maintenance screen on mobile app only
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={maintStatusData?.maintenanceStatus?.app ?? false}
                    onChange={handleToggleAppMaintenance}
                    color="warning"
                  />
                }
                label={maintStatusData?.maintenanceStatus?.app ? 'ON' : 'OFF'}
              />
            </Box>
            <Divider />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Website Maintenance
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Show maintenance screen on website only
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={maintStatusData?.maintenanceStatus?.website ?? false}
                    onChange={handleToggleWebsiteMaintenance}
                    color="warning"
                  />
                }
                label={maintStatusData?.maintenanceStatus?.website ? 'ON' : 'OFF'}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Divider sx={{ mb: 3 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">All Settings</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Setting
        </Button>
      </Box>

      <SettingsTable
        settings={data?.appSettings ?? []}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
      />

      <SettingDialog
        open={dialogOpen}
        isEditing={isEditing}
        editKey={editKey}
        editValue={editValue}
        editCategory={editCategory}
        saving={saving}
        onKeyChange={setEditKey}
        onValueChange={setEditValue}
        onCategoryChange={setEditCategory}
        onSave={handleSave}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
};

export default SettingsPage;
