import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { CATEGORIES } from './Settings.types';

interface SettingDialogProps {
  open: boolean;
  isEditing: boolean;
  editKey: string;
  editValue: string;
  editCategory: string;
  saving: boolean;
  onKeyChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

const SettingDialog: React.FC<SettingDialogProps> = ({
  open,
  isEditing,
  editKey,
  editValue,
  editCategory,
  saving,
  onKeyChange,
  onValueChange,
  onCategoryChange,
  onSave,
  onClose,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>{isEditing ? 'Edit Setting' : 'Add Setting'}</DialogTitle>
    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
      <TextField
        label="Key"
        value={editKey}
        onChange={(e) => onKeyChange(e.target.value)}
        disabled={isEditing}
        fullWidth
      />
      <TextField
        label="Value"
        value={editValue}
        onChange={(e) => onValueChange(e.target.value)}
        multiline
        rows={2}
        fullWidth
      />
      <FormControl fullWidth>
        <InputLabel>Category</InputLabel>
        <Select
          value={editCategory}
          label="Category"
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" onClick={onSave} disabled={saving}>
        {saving ? <CircularProgress size={20} /> : 'Save'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default SettingDialog;
