import React from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { FormikProps } from 'formik';
import type { CreatePodFormValues } from '../CreatePod.types';
import { POD_CATEGORIES } from '../CreatePod.types';

interface StepBasicInfoProps {
  formik: FormikProps<CreatePodFormValues>;
}

const StepBasicInfo: React.FC<StepBasicInfoProps> = ({ formik }) => (
  <Stack spacing={2}>
    <TextField
      label="Title"
      name="title"
      value={formik.values.title}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.title && Boolean(formik.errors.title)}
      helperText={(formik.touched.title && formik.errors.title) || 'Give your pod a catchy name'}
      fullWidth
      autoFocus
    />
    <TextField
      label="Description"
      name="description"
      value={formik.values.description}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.description && Boolean(formik.errors.description)}
      helperText={
        (formik.touched.description && formik.errors.description) ||
        'Describe what this pod is about'
      }
      multiline
      rows={3}
      fullWidth
    />
    <TextField
      select
      label="Category"
      name="category"
      value={formik.values.category}
      onChange={formik.handleChange}
      fullWidth
      helperText="Select the type of pod"
    >
      {POD_CATEGORIES.map((c) => (
        <MenuItem key={c} value={c}>
          {c}
        </MenuItem>
      ))}
    </TextField>
  </Stack>
);

export default StepBasicInfo;
