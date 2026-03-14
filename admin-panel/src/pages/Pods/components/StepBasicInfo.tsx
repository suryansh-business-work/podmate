import React from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import { FormikProps } from 'formik';
import { useQuery } from '@apollo/client';
import type { CreatePodFormValues } from '../CreatePod.types';
import { GET_ACTIVE_CATEGORIES } from '../../../graphql/queries';

interface CategoryOption {
  id: string;
  name: string;
}

interface StepBasicInfoProps {
  formik: FormikProps<CreatePodFormValues>;
}

const StepBasicInfo: React.FC<StepBasicInfoProps> = ({ formik }) => {
  const { data, loading } = useQuery(GET_ACTIVE_CATEGORIES);
  const categories: CategoryOption[] = data?.activeCategories ?? [];

  return (
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
        disabled={loading}
        slotProps={{
          input: {
            endAdornment: loading ? <CircularProgress size={16} /> : undefined,
          },
        }}
      >
        {categories.map((c) => (
          <MenuItem key={c.id} value={c.name}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
};

export default StepBasicInfo;
