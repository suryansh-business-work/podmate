import React from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import type { FormikProps } from 'formik';
import type { CreateUserFormValues } from '../CreateUser.types';
import { USER_ROLES } from '../CreateUser.types';

interface StepAccountInfoProps {
  formik: FormikProps<CreateUserFormValues>;
}

const ROLE_LABELS: Record<string, string> = {
  USER: 'User',
  PLACE_OWNER: 'Place Owner',
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
      <InputLabel>Role</InputLabel>
      <Select
        name="role"
        value={formik.values.role}
        label="Role"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      >
        {USER_ROLES.map((r) => (
          <MenuItem key={r} value={r}>
            {ROLE_LABELS[r]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>
);

export default StepAccountInfo;
