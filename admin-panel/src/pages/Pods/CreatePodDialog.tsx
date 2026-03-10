import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Box from '@mui/material/Box';
import { useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CREATE_POD } from '../../graphql/mutations';
import type { MediaItem } from '../../components/AdminMediaUploader';
import type { CreatePodFormValues } from './CreatePod.types';
import { CREATE_POD_STEPS } from './CreatePod.types';
import StepBasicInfo from './components/StepBasicInfo';
import StepMedia from './components/StepMedia';
import StepLogistics from './components/StepLogistics';

interface CreatePodDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const validationSchema = Yup.object({
  title: Yup.string().min(3, 'At least 3 characters').required('Title is required'),
  description: Yup.string().min(10, 'At least 10 characters').required('Description is required'),
  category: Yup.string().required('Category is required'),
  feePerPerson: Yup.number().min(0, 'Cannot be negative').required('Fee is required'),
  maxSeats: Yup.number().min(1, 'At least 1 seat').integer().required('Max seats is required'),
  dateTime: Yup.string().required('Date & time is required'),
  location: Yup.string().required('Location is required'),
  locationDetail: Yup.string(),
});

const INITIAL_VALUES: CreatePodFormValues = {
  title: '',
  description: '',
  category: 'Social',
  imageUrl: '',
  mediaUrls: [],
  feePerPerson: 0,
  maxSeats: 10,
  dateTime: '',
  location: '',
  locationDetail: '',
};

const CreatePodDialog: React.FC<CreatePodDialogProps> = ({ open, onClose, onCreated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [createPod, { loading }] = useMutation(CREATE_POD);

  const formik = useFormik<CreatePodFormValues>({
    initialValues: INITIAL_VALUES,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setError('');
      try {
        const imageUrls = mediaItems.map((m) => m.url);
        await createPod({
          variables: {
            input: {
              title: values.title.trim(),
              description: values.description.trim(),
              category: values.category,
              imageUrl: imageUrls[0] || undefined,
              mediaUrls: imageUrls,
              feePerPerson: Number(values.feePerPerson),
              maxSeats: Number(values.maxSeats),
              dateTime: new Date(values.dateTime).toISOString(),
              location: values.location.trim(),
              locationDetail: values.locationDetail.trim() || undefined,
            },
          },
        });
        handleReset();
        onClose();
        onCreated();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create pod');
      }
    },
  });

  const handleReset = () => {
    setActiveStep(0);
    setError('');
    setMediaItems([]);
    formik.resetForm();
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const canProceed = (): boolean => {
    if (activeStep === 0) {
      return Boolean(
        formik.values.title.trim() &&
          formik.values.description.trim() &&
          formik.values.category &&
          !formik.errors.title &&
          !formik.errors.description,
      );
    }
    if (activeStep === 1) {
      return mediaItems.length > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (activeStep < CREATE_POD_STEPS.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      formik.handleSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Pod</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {CREATE_POD_STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ minHeight: 200 }}>
          {activeStep === 0 && <StepBasicInfo formik={formik} />}
          {activeStep === 1 && (
            <StepMedia mediaItems={mediaItems} onMediaChange={setMediaItems} />
          )}
          {activeStep === 2 && <StepLogistics formik={formik} />}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={loading || !canProceed()}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          {activeStep === CREATE_POD_STEPS.length - 1
            ? loading
              ? 'Creating…'
              : 'Create Pod'
            : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePodDialog;
