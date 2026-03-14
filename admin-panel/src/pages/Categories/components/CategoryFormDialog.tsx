import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AdminMediaUploader from '../../../components/AdminMediaUploader';
import type { MediaItem } from '../../../components/AdminMediaUploader';
import type { CategoryItem, SubCategoryItem } from '../Categories.types';

export interface SubCategoryEntry {
  id?: string;
  name: string;
  description: string;
}

interface CategoryFormDialogProps {
  open: boolean;
  editingCategory: CategoryItem | null;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    iconUrl: string;
    isActive: boolean;
    subcategories: SubCategoryEntry[];
    removedSubCategoryIds: string[];
  }) => Promise<void>;
}

const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  open,
  editingCategory,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [iconItems, setIconItems] = useState<MediaItem[]>([]);
  const [saving, setSaving] = useState(false);

  const [subcategories, setSubcategories] = useState<SubCategoryEntry[]>([]);
  const [removedSubIds, setRemovedSubIds] = useState<string[]>([]);
  const [newSubName, setNewSubName] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');

  useEffect(() => {
    if (open) {
      setRemovedSubIds([]);
      setNewSubName('');
      setNewSubDesc('');
      if (editingCategory) {
        setName(editingCategory.name);
        setDescription(editingCategory.description);
        setIsActive(editingCategory.isActive);
        setIconItems(
          editingCategory.iconUrl ? [{ url: editingCategory.iconUrl, type: 'image' }] : [],
        );
        setSubcategories(
          (editingCategory?.subcategories ?? []).map((s: SubCategoryItem) => ({
            id: s.id,
            name: s.name,
            description: s.description,
          })),
        );
      } else {
        setName('');
        setDescription('');
        setIsActive(true);
        setIconItems([]);
        setSubcategories([]);
      }
    }
  }, [open, editingCategory]);

  const handleAddSub = () => {
    const trimmed = newSubName.trim();
    if (!trimmed || trimmed.length < 2) return;
    setSubcategories((prev) => [...prev, { name: trimmed, description: newSubDesc.trim() }]);
    setNewSubName('');
    setNewSubDesc('');
  };

  const handleRemoveSub = (index: number) => {
    const sub = subcategories[index];
    if (sub.id) setRemovedSubIds((prev) => [...prev, sub.id as string]);
    setSubcategories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        name,
        description,
        iconUrl: iconItems[0]?.url ?? '',
        isActive,
        subcategories,
        removedSubCategoryIds: removedSubIds,
      });
    } finally {
      setSaving(false);
    }
  };

  const isValid = name.trim().length >= 2 && iconItems.length > 0 && subcategories.length >= 1;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            helperText="A short, unique name for this category (e.g. Social, Learning)"
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            fullWidth
            helperText="Brief description of what this category represents"
          />
          <AdminMediaUploader
            mediaItems={iconItems}
            onMediaChange={setIconItems}
            folder="/categories/icons"
            maxItems={1}
            label="Category Icon (Required)"
          />
          <FormControlLabel
            control={
              <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            }
            label="Active"
          />

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              Subcategories ({subcategories.length})
            </Typography>
            {subcategories.length === 0 && (
              <Alert severity="info" sx={{ mb: 1 }}>
                At least one subcategory is required.
              </Alert>
            )}
            {subcategories.length > 0 && (
              <List dense disablePadding sx={{ mb: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                {subcategories.map((sub, idx) => (
                  <React.Fragment key={sub.id ?? `new-${idx}`}>
                    <ListItem
                      secondaryAction={
                        <IconButton edge="end" size="small" onClick={() => handleRemoveSub(idx)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={sub.name}
                        secondary={sub.description || undefined}
                      />
                    </ListItem>
                    {idx < subcategories.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField
                  size="small"
                  label="Subcategory Name"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  fullWidth
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSub();
                    }
                  }}
                />
                <TextField
                  size="small"
                  label="Description (optional)"
                  value={newSubDesc}
                  onChange={(e) => setNewSubDesc(e.target.value)}
                  fullWidth
                />
              </Box>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddSub}
                disabled={newSubName.trim().length < 2}
                sx={{ mt: 0.5 }}
              >
                Add
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || !isValid}>
          {saving ? 'Saving…' : editingCategory ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryFormDialog;
