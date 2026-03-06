import React, { useState, useCallback } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { PlatformFeeOverride } from './Finance.types';
import OverrideDialog from './OverrideDialog';

interface OverridesSectionProps {
  overrides: PlatformFeeOverride[];
  loading: boolean;
  saving: boolean;
  onSave: (input: {
    id?: string;
    pincode: string;
    feePercent: number;
    label: string;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const OverridesSection: React.FC<OverridesSectionProps> = ({
  overrides,
  loading,
  saving,
  onSave,
  onDelete,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformFeeOverride | null>(null);

  const handleCreate = useCallback(() => {
    setEditing(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((override: PlatformFeeOverride) => {
    setEditing(override);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(
    async (values: { pincode: string; feePercent: number; label: string }) => {
      await onSave({ id: editing?.id, ...values });
      setDialogOpen(false);
    },
    [editing, onSave],
  );

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width={260} height={32} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 2, borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Pincode Overrides
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set a different platform fee for specific pincodes
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleCreate} size="small">
            Add Override
          </Button>
        </Stack>

        {overrides.length === 0 ? (
          <Box py={3} textAlign="center">
            <Typography color="text.secondary">No pincode overrides configured</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Pincode</TableCell>
                  <TableCell>Label</TableCell>
                  <TableCell>Fee %</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {overrides.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {o.pincode}
                      </Typography>
                    </TableCell>
                    <TableCell>{o.label || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${o.feePercent}%`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(o.updatedAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(o)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => onDelete(o.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      <OverrideDialog
        open={dialogOpen}
        editing={editing}
        saving={saving}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </Card>
  );
};

export default OverridesSection;
