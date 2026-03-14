import React, { useState, useEffect, useMemo } from 'react';
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
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import AdminMediaUploader from '../../../components/AdminMediaUploader';
import type { MediaItem } from '../../../components/AdminMediaUploader';
import type { CityFormData, CityItem } from '../Locations.types';
import { getCountryNames, getStatesForCountry } from '../countryStateData';

interface CityFormDialogProps {
  open: boolean;
  editingCity: CityItem | null;
  allCities: CityItem[];
  saving: boolean;
  onClose: () => void;
  onSave: (form: CityFormData, imageUrl: string) => void;
}

const CityFormDialog: React.FC<CityFormDialogProps> = ({
  open,
  editingCity,
  allCities,
  saving,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<CityFormData>({
    name: '',
    state: '',
    country: '',
    imageUrl: '',
    isTopCity: false,
    isActive: true,
  });
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const countryOptions = useMemo(() => getCountryNames(), []);

  const stateOptions = useMemo(
    () => (form.country ? getStatesForCountry(form.country) : []),
    [form.country],
  );

  const cityOptions = useMemo(() => {
    if (!form.country || !form.state) return [];
    return [
      ...new Set(
        allCities
          .filter((c) => c.country === form.country && c.state === form.state)
          .map((c) => c.name)
          .filter(Boolean),
      ),
    ].sort();
  }, [allCities, form.country, form.state]);

  useEffect(() => {
    if (open) {
      if (editingCity) {
        setForm({
          name: editingCity.name,
          state: editingCity.state,
          country: editingCity.country,
          imageUrl: editingCity.imageUrl,
          isTopCity: editingCity.isTopCity,
          isActive: editingCity.isActive,
        });
        setMediaItems(editingCity.imageUrl ? [{ url: editingCity.imageUrl, type: 'image' }] : []);
      } else {
        setForm({ name: '', state: '', country: '', imageUrl: '', isTopCity: false, isActive: true });
        setMediaItems([]);
      }
    }
  }, [open, editingCity]);

  const handleMediaChange = (items: MediaItem[]) => {
    setMediaItems(items);
  };

  const handleSubmit = () => {
    onSave(form, mediaItems[0]?.url ?? '');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingCity ? 'Edit City' : 'Add City'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Autocomplete
            options={countryOptions}
            value={form.country || null}
            onChange={(_, val) => setForm({ ...form, country: val ?? '', state: '' })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Country"
                required
                helperText="Select a country"
              />
            )}
          />
          <Autocomplete
            options={stateOptions}
            value={form.state || null}
            onChange={(_, val) => setForm({ ...form, state: val ?? '' })}
            disabled={!form.country}
            renderInput={(params) => (
              <TextField
                {...params}
                label="State / Province"
                required
                helperText={form.country ? `States in ${form.country}` : 'Select a country first'}
              />
            )}
          />
          <Autocomplete
            freeSolo
            options={cityOptions}
            value={form.name}
            onChange={(_, val) => setForm({ ...form, name: val ?? '' })}
            onInputChange={(_, val) => setForm((prev) => ({ ...prev, name: val }))}
            disabled={!form.state}
            renderInput={(params) => (
              <TextField
                {...params}
                label="City Name"
                required
                fullWidth
                helperText={
                  form.state
                    ? `Cities in ${form.state} — type to add new`
                    : 'Select a state first'
                }
              />
            )}
          />
          <AdminMediaUploader
            mediaItems={mediaItems}
            onMediaChange={handleMediaChange}
            folder="/cities"
            maxItems={1}
            label="City Image"
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.isTopCity}
                onChange={(e) => setForm({ ...form, isTopCity: e.target.checked })}
              />
            }
            label="Top City (featured on home screen)"
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
            }
            label="Active (visible to users)"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || !form.name || !form.country || !form.state}
        >
          {saving ? <CircularProgress size={20} /> : editingCity ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CityFormDialog;
