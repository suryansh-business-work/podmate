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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type {
  EntityFeeOverride,
  EntityFeeOverrideFormValues,
  EntityOverrideType,
} from './Finance.types';
import EntityOverrideDialog from './EntityOverrideDialog';

interface EntityOverridesSectionProps {
  overrides: EntityFeeOverride[];
  loading: boolean;
  saving: boolean;
  onSave: (input: EntityFeeOverrideFormValues) => Promise<void>;
  onDelete: (entityType: EntityOverrideType, entityId: string) => Promise<void>;
  onTabChange: (entityType: EntityOverrideType | undefined) => void;
}

const ENTITY_LABELS: Record<EntityOverrideType, string> = {
  USER: 'User',
  POD: 'Pod',
  PLACE: 'Venue',
};

const EntityOverridesSection: React.FC<EntityOverridesSectionProps> = ({
  overrides,
  loading,
  saving,
  onSave,
  onDelete,
  onTabChange,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EntityFeeOverride | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  const handleCreate = useCallback(() => {
    setEditing(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((override: EntityFeeOverride) => {
    setEditing(override);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(
    async (values: EntityFeeOverrideFormValues) => {
      await onSave(values);
      setDialogOpen(false);
    },
    [onSave],
  );

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      setTabIndex(newValue);
      const types: (EntityOverrideType | undefined)[] = [undefined, 'USER', 'POD', 'PLACE'];
      onTabChange(types[newValue]);
    },
    [onTabChange],
  );

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width={300} height={32} />
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
              Entity Fee Overrides
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Override platform fee for specific users, pods, or venues. When enabled, overrides the
              global fee.
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleCreate} size="small">
            Add Override
          </Button>
        </Stack>

        <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="All" />
          <Tab label="Users" />
          <Tab label="Pods" />
          <Tab label="Venues" />
        </Tabs>

        {overrides.length === 0 ? (
          <Box py={3} textAlign="center">
            <Typography color="text.secondary">No entity overrides configured</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Entity ID</TableCell>
                  <TableCell>Fee %</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {overrides.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Chip
                        label={ENTITY_LABELS[o.entityType]}
                        size="small"
                        color={
                          o.entityType === 'USER'
                            ? 'primary'
                            : o.entityType === 'POD'
                              ? 'secondary'
                              : 'info'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                        {o.entityId.substring(0, 8)}…
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${o.feePercent}%`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={o.enabled ? 'Active' : 'Disabled'}
                        size="small"
                        color={o.enabled ? 'success' : 'default'}
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
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(o.entityType, o.entityId)}
                      >
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

      <EntityOverrideDialog
        open={dialogOpen}
        editing={editing}
        saving={saving}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </Card>
  );
};

export default EntityOverridesSection;
