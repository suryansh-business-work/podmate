import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import SaveIcon from '@mui/icons-material/Save';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import type { UserDetail, AdminUpdateUserInput } from './UserDetail.types';
import { ROLE_OPTIONS } from './UserDetail.types';

interface UserEditFormProps {
  user: UserDetail;
  saving: boolean;
  onSave: (values: AdminUpdateUserInput) => void;
}

const ROLE_LABELS: Record<string, string> = {
  USER: 'User',
  VENUE_OWNER: 'Venue Owner',
  HOST: 'Host',
  ADMIN: 'Admin',
};

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email'),
  phone: Yup.string().required('Phone is required'),
  username: Yup.string(),
  dob: Yup.string(),
  roles: Yup.array()
    .of(Yup.string().oneOf([...ROLE_OPTIONS]))
    .min(1, 'At least one role required')
    .required(),
  isVerifiedHost: Yup.boolean(),
  isActive: Yup.boolean(),
  disableReason: Yup.string(),
});

const UserEditForm: React.FC<UserEditFormProps> = ({ user, saving, onSave }) => {
  const formik = useFormik({
    initialValues: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      username: user.username,
      dob: user.dob,
      roles: user.roles,
      isVerifiedHost: user.isVerifiedHost,
      isActive: user.isActive,
      disableReason: user.disableReason,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      onSave(values);
    },
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={2}>
          Edit User
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Username"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Phone"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Date of Birth"
                name="dob"
                type="date"
                value={formik.values.dob}
                onChange={formik.handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Roles</InputLabel>
                <Select
                  multiple
                  name="roles"
                  value={formik.values.roles}
                  onChange={(e) => {
                    const val = e.target.value;
                    const newRoles = typeof val === 'string' ? val.split(',') : val;
                    // ADMIN is exclusive
                    if (newRoles.includes('ADMIN') && newRoles.length > 1) {
                      formik.setFieldValue('roles', ['ADMIN']);
                    } else {
                      formik.setFieldValue('roles', newRoles);
                    }
                  }}
                  input={<OutlinedInput label="Roles" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((r) => (
                        <Chip key={r} label={ROLE_LABELS[r] ?? r} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {formik.values.roles.includes('ADMIN')
                    ? [
                        <MenuItem key="ADMIN" value="ADMIN">
                          <Checkbox checked size="small" />
                          Admin
                        </MenuItem>,
                      ]
                    : ROLE_OPTIONS.filter((r) => r !== 'ADMIN').map((r) => (
                        <MenuItem key={r} value={r}>
                          <Checkbox checked={formik.values.roles.includes(r)} size="small" />
                          {ROLE_LABELS[r]}
                        </MenuItem>
                      ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isVerifiedHost}
                    onChange={(e) => formik.setFieldValue('isVerifiedHost', e.target.checked)}
                  />
                }
                label="Verified Host"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isActive}
                    onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
                  />
                }
                label="Active"
              />
            </Grid>
            {!formik.values.isActive && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Disable Reason"
                  name="disableReason"
                  value={formik.values.disableReason}
                  onChange={formik.handleChange}
                  multiline
                  rows={2}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                  disabled={saving || !formik.dirty}
                >
                  Save Changes
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserEditForm;
