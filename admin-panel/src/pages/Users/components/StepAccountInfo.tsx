import React from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import type { FormikProps } from 'formik';
import type { CreateUserFormValues } from '../CreateUser.types';
import { USER_ROLES } from '../CreateUser.types';

interface StepAccountInfoProps {
  formik: FormikProps<CreateUserFormValues>;
}

const ROLE_LABELS: Record<string, string> = {
  USER: 'User',
  VENUE_OWNER: 'Venue Owner',
  HOST: 'Host',
  ADMIN: 'Admin',
};

const StepAccountInfo: React.FC<StepAccountInfoProps> = ({ formik }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <TextField
      label="Phone"
      name="phone"
      placeholder="+91XXXXXXXXXX"
      value={formik.values.phone}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.phone && Boolean(formik.errors.phone)}
      helperText={formik.touched.phone && formik.errors.phone}
      fullWidth
      autoFocus
    />
    <TextField
      label="Full Name"
      name="name"
      value={formik.values.name}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.name && Boolean(formik.errors.name)}
      helperText={formik.touched.name && formik.errors.name}
      fullWidth
    />
    <FormControl fullWidth>
      <InputLabel>Roles</InputLabel>
      <Select
        multiple
        name="roles"
        value={formik.values.roles}
        label="Roles"
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
        onBlur={formik.handleBlur}
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
          : USER_ROLES.filter((r) => r !== 'ADMIN').map((r) => (
              <MenuItem key={r} value={r}>
                <Checkbox checked={formik.values.roles.includes(r)} size="small" />
                {ROLE_LABELS[r]}
              </MenuItem>
            ))}
      </Select>
    </FormControl>
  </Box>
);

export default StepAccountInfo;
