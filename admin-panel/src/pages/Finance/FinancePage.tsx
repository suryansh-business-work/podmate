import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Grid from '@mui/material/Grid2';
import { GET_PLATFORM_FEES, GET_PLATFORM_FEE_OVERRIDES } from '../../graphql/queries';
import {
  UPSERT_PLATFORM_FEE,
  UPSERT_PLATFORM_FEE_OVERRIDE,
  DELETE_PLATFORM_FEE_OVERRIDE,
} from '../../graphql/mutations';
import type { PlatformFeeConfigData, PaginatedPlatformFeeOverridesData } from './Finance.types';
import GlobalFeeCard from './GlobalFeeCard';
import OverridesSection from './OverridesSection';

const FinancePage: React.FC = () => {
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: feeData, loading: feeLoading, refetch: refetchFee } = useQuery<PlatformFeeConfigData>(
    GET_PLATFORM_FEES,
    { fetchPolicy: 'cache-and-network' },
  );

  const { data: overridesData, loading: overridesLoading, refetch: refetchOverrides } = useQuery<PaginatedPlatformFeeOverridesData>(
    GET_PLATFORM_FEE_OVERRIDES,
    { variables: { page: 1, limit: 100 }, fetchPolicy: 'cache-and-network' },
  );

  const [upsertFee, { loading: savingFee }] = useMutation(UPSERT_PLATFORM_FEE);
  const [upsertOverride, { loading: savingOverride }] = useMutation(UPSERT_PLATFORM_FEE_OVERRIDE);
  const [deleteOverride] = useMutation(DELETE_PLATFORM_FEE_OVERRIDE);

  const globalFee = feeData?.platformFees?.globalFeePercent ?? 5;
  const overrides = overridesData?.platformFeeOverrides?.items ?? [];

  const handleSaveGlobalFee = useCallback(
    async (value: number) => {
      try {
        await upsertFee({ variables: { globalFeePercent: value } });
        setSnackbar({ open: true, message: `Global fee updated to ${value}%`, severity: 'success' });
        refetchFee();
      } catch (err) {
        setSnackbar({ open: true, message: (err as Error).message, severity: 'error' });
      }
    },
    [upsertFee, refetchFee],
  );

  const handleSaveOverride = useCallback(
    async (input: { id?: string; pincode: string; feePercent: number; label: string }) => {
      try {
        await upsertOverride({ variables: { input } });
        setSnackbar({ open: true, message: `Override for ${input.pincode} saved`, severity: 'success' });
        refetchOverrides();
      } catch (err) {
        setSnackbar({ open: true, message: (err as Error).message, severity: 'error' });
      }
    },
    [upsertOverride, refetchOverrides],
  );

  const handleDeleteOverride = useCallback(
    async (id: string) => {
      try {
        await deleteOverride({ variables: { id } });
        setSnackbar({ open: true, message: 'Override deleted', severity: 'success' });
        refetchOverrides();
      } catch (err) {
        setSnackbar({ open: true, message: (err as Error).message, severity: 'error' });
      }
    },
    [deleteOverride, refetchOverrides],
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/dashboard">Dashboard</Link>
        <Typography color="text.primary">Finance</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Finance &mdash; Platform Fees
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <GlobalFeeCard
            currentFee={globalFee}
            loading={feeLoading}
            saving={savingFee}
            onSave={handleSaveGlobalFee}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <OverridesSection
            overrides={overrides}
            loading={overridesLoading}
            saving={savingOverride}
            onSave={handleSaveOverride}
            onDelete={handleDeleteOverride}
          />
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FinancePage;
