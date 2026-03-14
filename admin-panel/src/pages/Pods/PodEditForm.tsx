import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import SaveIcon from '@mui/icons-material/Save';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import type { PodDetailData, AdminUpdatePodInput } from './PodDetail.types';
import { POD_STATUS_OPTIONS } from './PodDetail.types';
import { useQuery } from '@apollo/client';
import { GET_ACTIVE_CATEGORIES } from '../../graphql/queries';

interface CategoryOption {
  id: string;
  name: string;
}

interface PodEditFormProps {
  pod: PodDetailData;
  saving: boolean;
  onSave: (values: AdminUpdatePodInput) => void;
}

const toDateTimeLocal = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  category: Yup.string(),
  feePerPerson: Yup.number().min(0, 'Must be >= 0'),
  maxSeats: Yup.number().min(1, 'Must be >= 1').integer(),
  dateTime: Yup.string(),
  location: Yup.string(),
  locationDetail: Yup.string(),
  status: Yup.string().oneOf([...POD_STATUS_OPTIONS]),
  closeReason: Yup.string(),
  refundPolicy: Yup.string(),
});

const PodEditForm: React.FC<PodEditFormProps> = ({ pod, saving, onSave }) => {
  const { data: catData } = useQuery(GET_ACTIVE_CATEGORIES);
  const categories: CategoryOption[] = catData?.activeCategories ?? [];

  const formik = useFormik({
    initialValues: {
      title: pod.title,
      description: pod.description,
      category: pod.category,
      feePerPerson: pod.feePerPerson,
      maxSeats: pod.maxSeats,
      dateTime: toDateTimeLocal(pod.dateTime),
      location: pod.location,
      locationDetail: pod.locationDetail,
      status: pod.status,
      closeReason: pod.closeReason,
      refundPolicy: pod.refundPolicy,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      const input: AdminUpdatePodInput = {
        ...values,
        dateTime: values.dateTime ? new Date(values.dateTime).toISOString() : undefined,
      };
      onSave(input);
    },
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={2}>
          Edit Pod
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                select
                label="Category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.name}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                select
                label="Status"
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
              >
                {POD_STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Fee Per Person (₹)"
                name="feePerPerson"
                type="number"
                value={formik.values.feePerPerson}
                onChange={formik.handleChange}
                error={formik.touched.feePerPerson && Boolean(formik.errors.feePerPerson)}
                helperText={formik.touched.feePerPerson && formik.errors.feePerPerson}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Max Seats"
                name="maxSeats"
                type="number"
                value={formik.values.maxSeats}
                onChange={formik.handleChange}
                error={formik.touched.maxSeats && Boolean(formik.errors.maxSeats)}
                helperText={formik.touched.maxSeats && formik.errors.maxSeats}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Date & Time"
                name="dateTime"
                type="datetime-local"
                value={formik.values.dateTime}
                onChange={formik.handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Refund Policy"
                name="refundPolicy"
                value={formik.values.refundPolicy}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Location"
                name="location"
                value={formik.values.location}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Location Detail"
                name="locationDetail"
                value={formik.values.locationDetail}
                onChange={formik.handleChange}
              />
            </Grid>
            {formik.values.status === 'CLOSED' && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Close Reason"
                  name="closeReason"
                  value={formik.values.closeReason}
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

export default PodEditForm;
