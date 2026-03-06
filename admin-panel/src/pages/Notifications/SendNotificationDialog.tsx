import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import type { SendNotificationFormValues } from './Notifications.types';

interface SendNotificationDialogProps {
  open: boolean;
  sending: boolean;
  onClose: () => void;
  onSend: (title: string, message: string) => Promise<void>;
}

const validationSchema = Yup.object<SendNotificationFormValues>({
  title: Yup.string().required('Title is required').max(100, 'Max 100 characters'),
  message: Yup.string().required('Message is required').max(500, 'Max 500 characters'),
});

const SendNotificationDialog: React.FC<SendNotificationDialogProps> = ({
  open,
  sending,
  onClose,
  onSend,
}) => {
  const formik = useFormik<SendNotificationFormValues>({
    initialValues: { title: '', message: '' },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      await onSend(values.title, values.message);
      resetForm();
    },
  });

  const handleClose = () => {
    if (!sending) {
      formik.resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>Send Broadcast Notification</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
              fullWidth
              autoFocus
            />
            <TextField
              label="Message"
              name="message"
              value={formik.values.message}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.message && Boolean(formik.errors.message)}
              helperText={formik.touched.message && formik.errors.message}
              multiline
              rows={4}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={sending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={sending || !formik.isValid || !formik.dirty}
            startIcon={sending ? <CircularProgress size={16} /> : undefined}
          >
            {sending ? 'Sending…' : 'Send to All Users'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SendNotificationDialog;
