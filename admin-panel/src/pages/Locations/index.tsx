import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_CITIES = gql`
  query GetCities($page: Int, $limit: Int, $search: String) {
    cities(page: $page, limit: $limit, search: $search) {
      items {
        id
        name
        state
        country
        imageUrl
        clubCount
        isTopCity
        isActive
        sortOrder
        areas {
          id
          name
          cityId
        }
        createdAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

const CREATE_CITY = gql`
  mutation CreateCity($input: CreateCityInput!) {
    createCity(input: $input) {
      id
      name
    }
  }
`;

const UPDATE_CITY = gql`
  mutation UpdateCity($id: ID!, $input: UpdateCityInput!) {
    updateCity(id: $id, input: $input) {
      id
      name
    }
  }
`;

const DELETE_CITY = gql`
  mutation DeleteCity($id: ID!) {
    deleteCity(id: $id)
  }
`;

const ADD_AREA = gql`
  mutation AddArea($input: CreateAreaInput!) {
    addArea(input: $input) {
      id
      name
      cityId
    }
  }
`;

const REMOVE_AREA = gql`
  mutation RemoveArea($cityId: ID!, $areaId: ID!) {
    removeArea(cityId: $cityId, areaId: $areaId)
  }
`;

interface CityFormData {
  name: string;
  state: string;
  country: string;
  imageUrl: string;
  clubCount: number;
  isTopCity: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface AreaItem {
  id: string;
  name: string;
  cityId: string;
}

interface CityItem {
  id: string;
  name: string;
  state: string;
  country: string;
  imageUrl: string;
  clubCount: number;
  isTopCity: boolean;
  isActive: boolean;
  sortOrder: number;
  areas: AreaItem[];
}

const defaultCityForm: CityFormData = {
  name: '',
  state: 'India',
  country: 'India',
  imageUrl: '',
  clubCount: 0,
  isTopCity: false,
  isActive: true,
  sortOrder: 0,
};

const LocationsPage: React.FC = () => {
  const [cityDialogOpen, setCityDialogOpen] = useState(false);
  const [editingCityId, setEditingCityId] = useState<string | null>(null);
  const [cityForm, setCityForm] = useState<CityFormData>(defaultCityForm);
  const [areaName, setAreaName] = useState('');
  const [addingAreaForCity, setAddingAreaForCity] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_CITIES, {
    variables: { page: 1, limit: 100 },
  });

  const [createCity, { loading: creating }] = useMutation(CREATE_CITY, {
    onCompleted: () => {
      setCityDialogOpen(false);
      setCityForm(defaultCityForm);
      refetch();
    },
  });

  const [updateCity, { loading: updating }] = useMutation(UPDATE_CITY, {
    onCompleted: () => {
      setCityDialogOpen(false);
      setCityForm(defaultCityForm);
      setEditingCityId(null);
      refetch();
    },
  });

  const [deleteCity] = useMutation(DELETE_CITY, { onCompleted: () => refetch() });
  const [addArea, { loading: addingArea }] = useMutation(ADD_AREA, {
    onCompleted: () => {
      setAreaName('');
      setAddingAreaForCity(null);
      refetch();
    },
  });
  const [removeArea] = useMutation(REMOVE_AREA, { onCompleted: () => refetch() });

  const cities: CityItem[] = data?.cities?.items ?? [];

  const handleOpenCreate = () => {
    setEditingCityId(null);
    setCityForm(defaultCityForm);
    setCityDialogOpen(true);
  };

  const handleOpenEdit = (city: CityItem) => {
    setEditingCityId(city.id);
    setCityForm({
      name: city.name,
      state: city.state,
      country: city.country,
      imageUrl: city.imageUrl,
      clubCount: city.clubCount,
      isTopCity: city.isTopCity,
      isActive: city.isActive,
      sortOrder: city.sortOrder,
    });
    setCityDialogOpen(true);
  };

  const handleSaveCity = () => {
    if (editingCityId) {
      updateCity({ variables: { id: editingCityId, input: cityForm } });
    } else {
      createCity({ variables: { input: cityForm } });
    }
  };

  const handleDeleteCity = (id: string) => {
    if (window.confirm('Delete this city and all its areas?')) {
      deleteCity({ variables: { id } });
    }
  };

  const handleAddArea = (cityId: string) => {
    if (areaName.trim()) {
      addArea({ variables: { input: { name: areaName.trim(), cityId } } });
    }
  };

  const handleRemoveArea = (cityId: string, areaId: string) => {
    if (window.confirm('Remove this area?')) {
      removeArea({ variables: { cityId, areaId } });
    }
  };

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/dashboard">
          Dashboard
        </Link>
        <Typography color="text.primary">Locations</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Location Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Add City
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        cities.map((city) => (
          <Accordion key={city.id} defaultExpanded={city.isTopCity}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, mr: 2 }}>
                {city.imageUrl && (
                  <Box
                    component="img"
                    src={city.imageUrl}
                    sx={{ width: 50, height: 35, borderRadius: 1, objectFit: 'cover' }}
                  />
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>{city.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {city.clubCount} clubs · {city.areas.length} areas
                  </Typography>
                </Box>
                {city.isTopCity && <Chip label="Top City" size="small" color="primary" />}
                <Chip
                  label={city.isActive ? 'Active' : 'Inactive'}
                  size="small"
                  color={city.isActive ? 'success' : 'default'}
                />
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenEdit(city); }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteCity(city.id); }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Areas</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {city.areas.map((area) => (
                  <Chip
                    key={area.id}
                    label={area.name}
                    onDelete={() => handleRemoveArea(city.id, area.id)}
                    variant="outlined"
                    size="small"
                  />
                ))}
                {city.areas.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No areas added yet
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Area name (e.g. South City)"
                  value={addingAreaForCity === city.id ? areaName : ''}
                  onChange={(e) => {
                    setAddingAreaForCity(city.id);
                    setAreaName(e.target.value);
                  }}
                  onFocus={() => setAddingAreaForCity(city.id)}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleAddArea(city.id)}
                  disabled={addingArea || !areaName.trim() || addingAreaForCity !== city.id}
                >
                  Add Area
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      {!loading && cities.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No cities yet. Add one to get started.</Typography>
        </Paper>
      )}

      <Dialog open={cityDialogOpen} onClose={() => setCityDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCityId ? 'Edit City' : 'Add City'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="City Name"
              value={cityForm.name}
              onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="State"
              value={cityForm.state}
              onChange={(e) => setCityForm({ ...cityForm, state: e.target.value })}
              fullWidth
            />
            <TextField
              label="Country"
              value={cityForm.country}
              onChange={(e) => setCityForm({ ...cityForm, country: e.target.value })}
              fullWidth
            />
            <TextField
              label="Image URL"
              value={cityForm.imageUrl}
              onChange={(e) => setCityForm({ ...cityForm, imageUrl: e.target.value })}
              fullWidth
            />
            <TextField
              label="Club Count"
              type="number"
              value={cityForm.clubCount}
              onChange={(e) => setCityForm({ ...cityForm, clubCount: parseInt(e.target.value, 10) || 0 })}
              fullWidth
            />
            <TextField
              label="Sort Order"
              type="number"
              value={cityForm.sortOrder}
              onChange={(e) => setCityForm({ ...cityForm, sortOrder: parseInt(e.target.value, 10) || 0 })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={cityForm.isTopCity}
                  onChange={(e) => setCityForm({ ...cityForm, isTopCity: e.target.checked })}
                />
              }
              label="Top City"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={cityForm.isActive}
                  onChange={(e) => setCityForm({ ...cityForm, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCityDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveCity}
            disabled={creating || updating || !cityForm.name}
          >
            {creating || updating ? <CircularProgress size={20} /> : editingCityId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LocationsPage;
