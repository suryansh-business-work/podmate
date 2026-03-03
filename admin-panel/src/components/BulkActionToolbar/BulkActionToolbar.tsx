import React from 'react';
import { Box, Typography, Button, IconButton, Tooltip, alpha, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { BulkActionToolbarProps } from './BulkActionToolbar.types';

const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedCount,
  entityType,
  loading,
  onDelete,
  onClearSelection,
}) => {
  const theme = useTheme();

  if (selectedCount === 0) return null;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px={2}
      py={1}
      sx={{
        bgcolor: alpha(theme.palette.primary.main, 0.08),
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <Tooltip title="Clear selection">
          <IconButton size="small" onClick={onClearSelection}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="subtitle2" color="primary" fontWeight={600}>
          {selectedCount} {entityType}{selectedCount > 1 ? 's' : ''} selected
        </Typography>
      </Box>
      <Button
        size="small"
        variant="contained"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={onDelete}
        disabled={loading}
      >
        {loading ? 'Deleting…' : `Delete ${selectedCount}`}
      </Button>
    </Box>
  );
};

export default BulkActionToolbar;
