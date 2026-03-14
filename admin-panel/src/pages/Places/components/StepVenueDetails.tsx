import React, { useMemo, useState, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { useQuery, useLazyQuery, gql } from '@apollo/client';
import type { FormikProps } from 'formik';
import type { CreatePlaceFormValues } from '../CreatePlace.types';
import { PLACE_CATEGORIES } from '../CreatePlace.types';

const GET_ALL_CITIES = gql`
  query GetCitiesForVenue {
    cities(page: 1, limit: 500) {
      items {
        id
        name
        state
        country
      }
    }
  }
`;

const SEARCH_GOOGLE_PLACES = gql`
  query SearchGooglePlaces($input: String!, $sessionToken: String) {
    searchGooglePlaces(input: $input, sessionToken: $sessionToken) {
      placeId
      description
      mainText
      secondaryText
    }
  }
`;

const GOOGLE_PLACE_DETAILS = gql`
  query GooglePlaceDetails($placeId: String!) {
    googlePlaceDetails(placeId: $placeId) {
      city
      state
      country
      pincode
      area
      address
      latitude
      longitude
      matchedCityId
      matchedCityName
    }
  }
`;

interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface CityOption {
  id: string;
  name: string;
  state: string;
  country: string;
}

interface StepVenueDetailsProps {
  formik: FormikProps<CreatePlaceFormValues>;
}

const StepVenueDetails: React.FC<StepVenueDetailsProps> = ({ formik }) => {
  const { data } = useQuery(GET_ALL_CITIES, { fetchPolicy: 'cache-first' });
  const cities: CityOption[] = useMemo(() => data?.cities?.items ?? [], [data]);
  const [addressSearch, setAddressSearch] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);

  const [searchPlaces, { loading: searchingPlaces }] = useLazyQuery<{
    searchGooglePlaces: PlacePrediction[];
  }>(SEARCH_GOOGLE_PLACES);

  const [getPlaceDetails] = useLazyQuery<{
    googlePlaceDetails: {
      city: string;
      state: string;
      country: string;
      pincode: string;
      area: string;
      address: string;
      latitude: number;
      longitude: number;
      matchedCityId: string | null;
      matchedCityName: string | null;
    } | null;
  }>(GOOGLE_PLACE_DETAILS);

  const handleAddressSearch = useCallback(
    async (input: string) => {
      setAddressSearch(input);
      if (input.length < 3) {
        setPredictions([]);
        return;
      }
      const { data: searchData } = await searchPlaces({ variables: { input } });
      setPredictions(searchData?.searchGooglePlaces ?? []);
    },
    [searchPlaces],
  );

  const handleSelectPlace = useCallback(
    async (prediction: PlacePrediction | null) => {
      if (!prediction) return;
      setPredictions([]);

      const { data: detailData } = await getPlaceDetails({
        variables: { placeId: prediction.placeId },
      });

      const details = detailData?.googlePlaceDetails;
      if (details) {
        formik.setFieldValue('address', details.address);
        formik.setFieldValue('city', details.matchedCityName || details.city);
        formik.setFieldValue('state', details.state);
        formik.setFieldValue('country', details.country);
        formik.setFieldValue('pincode', details.pincode);
        setAddressSearch(details.address);
      }
    },
    [getPlaceDetails, formik],
  );

  const selectedCity = useMemo(
    () => cities.find((c) => c.name === formik.values.city),
    [cities, formik.values.city],
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Venue Name"
        name="name"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
        fullWidth
        autoFocus
      />
      <TextField
        label="Description"
        name="description"
        value={formik.values.description}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.description && Boolean(formik.errors.description)}
        helperText={formik.touched.description && formik.errors.description}
        multiline
        rows={3}
        fullWidth
      />
      <FormControl fullWidth>
        <InputLabel>Category</InputLabel>
        <Select
          name="category"
          value={formik.values.category}
          label="Category"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        >
          {PLACE_CATEGORIES.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Google Places address search */}
      <Autocomplete
        freeSolo
        options={predictions}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.description
        }
        inputValue={addressSearch || formik.values.address}
        onInputChange={(_, value) => handleAddressSearch(value)}
        onChange={(_, value) => {
          if (value && typeof value !== 'string') {
            handleSelectPlace(value);
          }
        }}
        loading={searchingPlaces}
        renderOption={(props, option) => {
          if (typeof option === 'string') return null;
          return (
            <li {...props} key={option.placeId}>
              <Box>
                <Box sx={{ fontWeight: 600, fontSize: 14 }}>{option.mainText}</Box>
                <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{option.secondaryText}</Box>
              </Box>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Address (search via Google Places)"
            placeholder="Start typing venue address..."
            error={formik.touched.address && Boolean(formik.errors.address)}
            helperText={
              formik.touched.address && formik.errors.address
                ? formik.errors.address
                : 'Search and select an address to auto-fill city, state, country, pincode'
            }
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {searchingPlaces && <CircularProgress color="inherit" size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />

      {/* Auto-filled or manual city selection */}
      <TextField
        select
        label="City"
        name="city"
        value={formik.values.city}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.city && Boolean(formik.errors.city)}
        helperText={
          formik.touched.city && formik.errors.city
            ? formik.errors.city
            : 'Auto-filled from address or select manually'
        }
        fullWidth
      >
        <MenuItem value="">
          <em>Select a city</em>
        </MenuItem>
        {cities.map((city) => (
          <MenuItem key={city.id} value={city.name}>
            {city.name}
          </MenuItem>
        ))}
      </TextField>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="State"
          value={formik.values.state || selectedCity?.state || ''}
          fullWidth
          slotProps={{ input: { readOnly: true } }}
        />
        <TextField
          label="Country"
          value={formik.values.country || selectedCity?.country || ''}
          fullWidth
          slotProps={{ input: { readOnly: true } }}
        />
        <TextField
          label="Pincode"
          value={formik.values.pincode}
          fullWidth
          slotProps={{ input: { readOnly: true } }}
        />
      </Box>
    </Box>
  );
};

export default StepVenueDetails;
