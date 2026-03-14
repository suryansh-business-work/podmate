import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useQuery, useMutation, gql } from '@apollo/client';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';
import type { CityItem } from './Locations.types';
import CityAccordion from './components/CityAccordion';
import CityFormDialog from './components/CityFormDialog';

const GET_CITIES = gql`
  query GetCities($page: Int, $limit: Int, $search: String) {
    cities(page: $page, limit: $limit, search: $search) {
      items {
        id
        name
        state
        country
        imageUrl
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
    createCity(input: $input) { id name }
  }
`;
const UPDATE_CITY = gql`
  mutation UpdateCity($id: ID!, $input: UpdateCityInput!) {
    updateCity(id: $id, input: $input) { id name }
  }
`;
const DELETE_CITY = gql`
  mutation DeleteCity($id: ID!) { deleteCity(id: $id) }
`;
const ADD_AREA = gql`
  mutation AddArea($input: CreateAreaInput!) {
    addArea(input: $input) { id name cityId }
  }
`;
const REMOVE_AREA = gql`
  mutation RemoveArea($cityId: ID!, $areaId: ID!) { removeArea(cityId: $cityId, areaId: $areaId) }
`;

const LocationsPage: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [cityDialogOpen, setCityDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<CityItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CityItem | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_CITIES, {
    variables: { page: 1, limit: 200 },
  });

  const [createCity, { loading: creating }] = useMutation(CREATE_CITY, {
    onCompleted: () => { setCityDialogOpen(false); refetch(); },
  });
  const [updateCity, { loading: updating }] = useMutation(UPDATE_CITY, {
    onCompleted: () => { setCityDialogOpen(false); setEditingCity(null); refetch(); },
  });
  const [deleteCity, { loading: deleting }] = useMutation(DELETE_CITY, {
    onCompleted: () => { setDeleteTarget(null); refetch(); },
  });
  const [addArea, { loading: addingArea }] = useMutation(ADD_AREA, { onCompleted: () => refetch() });
  const [removeArea] = useMutation(REMOVE_AREA, { onCompleted: () => refetch() });

  const allCities: CityItem[] = useMemo(() => data?.cities?.items ?? [], [data]);

  const countries = useMemo(
    () => [...new Set(allCities.map((c) => c.country).filter(Boolean))].sort(),
    [allCities],
  );

  const statesForCountry = useMemo(() => {
    if (!selectedCountry) return [];
    return [
      ...new Set(
        allCities.filter((c) => c.country === selectedCountry).map((c) => c.state).filter(Boolean),
      ),
    ].sort();
  }, [allCities, selectedCountry]);

  const filteredCities = useMemo(() => {
    let result = allCities;
    if (selectedCountry) result = result.filter((c) => c.country === selectedCountry);
    if (selectedState) result = result.filter((c) => c.state === selectedState);
    return result;
  }, [allCities, selectedCountry, selectedState]);

  const handleOpenCreate = () => {
    setEditingCity(null);
    setCityDialogOpen(true);
  };

  const handleSaveCity = (form: { name: string; state: string; country: string; isTopCity: boolean; isActive: boolean }, imageUrl: string) => {
    const input = { ...form, imageUrl };
    if (editingCity) {
      updateCity({ variables: { id: editingCity.id, input } });
    } else {
      createCity({ variables: { input } });
    }
  };

  const handleMoveCity = (cityId: string, direction: 'up' | 'down') => {
    const idx = filteredCities.findIndex((c) => c.id === cityId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= filteredCities.length) return;
    const currentOrder = filteredCities[idx].sortOrder;
    const swapOrder = filteredCities[swapIdx].sortOrder;
    updateCity({ variables: { id: filteredCities[idx].id, input: { sortOrder: swapOrder } } });
    updateCity({ variables: { id: filteredCities[swapIdx].id, input: { sortOrder: currentOrder } } });
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
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Location Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Country → State → City → Area hierarchy
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Add City
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      {/* Country filter */}
      {countries.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Country
          </Typography>
          <ToggleButtonGroup
            value={selectedCountry}
            exclusive
            onChange={(_, val) => {
              setSelectedCountry(val);
              setSelectedState(null);
            }}
            size="small"
          >
            <ToggleButton value={null as unknown as string}>All</ToggleButton>
            {countries.map((c) => (
              <ToggleButton key={c} value={c}>
                {c}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      )}

      {/* State filter */}
      {statesForCountry.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            State
          </Typography>
          <ToggleButtonGroup
            value={selectedState}
            exclusive
            onChange={(_, val) => setSelectedState(val)}
            size="small"
          >
            <ToggleButton value={null as unknown as string}>All</ToggleButton>
            {statesForCountry.map((s) => (
              <ToggleButton key={s} value={s}>
                {s}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      )}

      {/* Breadcrumb trail */}
      {(selectedCountry || selectedState) && (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing:
          </Typography>
          {selectedCountry && (
            <Typography variant="body2" fontWeight={600}>
              {selectedCountry}
            </Typography>
          )}
          {selectedState && (
            <>
              <NavigateNextIcon fontSize="small" color="disabled" />
              <Typography variant="body2" fontWeight={600}>
                {selectedState}
              </Typography>
            </>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({filteredCities.length} cities)
          </Typography>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredCities.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {allCities.length === 0
              ? 'No cities yet. Add one to get started.'
              : 'No cities match the selected filters.'}
          </Typography>
        </Paper>
      ) : (
        filteredCities.map((city, idx) => (
          <CityAccordion
            key={city.id}
            city={city}
            index={idx}
            total={filteredCities.length}
            onEdit={(c) => {
              setEditingCity(c);
              setCityDialogOpen(true);
            }}
            onDelete={(c) => setDeleteTarget(c)}
            onMove={handleMoveCity}
            onAddArea={(cityId, name) => addArea({ variables: { input: { name, cityId } } })}
            onRemoveArea={(cityId, areaId) => removeArea({ variables: { cityId, areaId } })}
            addingArea={addingArea}
          />
        ))
      )}

      <CityFormDialog
        open={cityDialogOpen}
        editingCity={editingCity}
        allCities={allCities}
        saving={creating || updating}
        onClose={() => {
          setCityDialogOpen(false);
          setEditingCity(null);
        }}
        onSave={handleSaveCity}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete City"
        entityName={deleteTarget?.name ?? ''}
        entityType="city"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteCity({ variables: { id: deleteTarget.id } });
        }}
      />
    </Box>
  );
};

export default LocationsPage;
