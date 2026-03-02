import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button, CircularProgress,
} from '@mui/material';
import { FormikProps } from 'formik';

interface PolicyFormValues {
  type: string;
  title: string;
  content: string;
}

interface PolicyDialogProps {
  open: boolean;
  isEditing: boolean;
  formik: FormikProps<PolicyFormValues>;
  creating: boolean;
  updating: boolean;
  onClose: () => void;
}

const PolicyDialog: React.FC<PolicyDialogProps> = ({
  open, isEditing, formik, creating, updating, onClose,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <form onSubmit={formik.handleSubmit}>
      <DialogTitle>{isEditing ? 'Edit Policy' : 'Create Policy'}</DialogTitle>
      <DialogContent>
        <TextField
          select fullWidth label="Policy Type" name="type"
          value={formik.values.type} onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={formik.touched.type && Boolean(formik.errors.type)}
          helperText={formik.touched.type && formik.errors.type}
          sx={{ mt: 1, mb: 2 }} disabled={isEditing}
        >
          <MenuItem value="VENUE">Venue</MenuItem>
          <MenuItem value="USER">User</MenuItem>
          <MenuItem value="HOST">Host</MenuItem>
        </TextField>
        <TextField
          fullWidth label="Title" name="title"
          value={formik.values.title} onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={formik.touched.title && Boolean(formik.errors.title)}
          helperText={formik.touched.title && formik.errors.title}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth multiline rows={6} label="Content" name="content"
          value={formik.values.content} onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={formik.touched.content && Boolean(formik.errors.content)}
          helperText={formik.touched.content && formik.errors.content}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={creating || updating || !formik.isValid || !formik.dirty}>
          {creating || updating ? <CircularProgress size={20} /> : isEditing ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </form>
  </Dialog>
);

export default PolicyDialog;
