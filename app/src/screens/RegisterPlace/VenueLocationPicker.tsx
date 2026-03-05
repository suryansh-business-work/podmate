import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { spacing, borderRadius } from '../../theme';
import { getCurrentLocation } from '../../utils/locationService';
import { useAppColors, useThemedStyles, ThemeUtils } from '../../hooks/useThemedStyles';

export interface LocationResult {
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceDetail {
  geometry: { location: { lat: number; lng: number } };
  formatted_address: string;
  address_components: Array<{ long_name: string; short_name: string; types: string[] }>;
}

interface VenueLocationPickerProps {
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  googleMapsApiKey: string;
  onLocationChange: (result: LocationResult) => void;
}

type LocationMode = 'at_venue' | 'search';

const VenueLocationPicker: React.FC<VenueLocationPickerProps> = ({
  address,
  city,
  latitude,
  longitude,
  googleMapsApiKey,
  onLocationChange,
}) => {
  const colors = useAppColors();
  const pickerStyles = useThemedStyles(createPickerStyles);
  const [mode, setMode] = useState<LocationMode>('search');
  const [searchQuery, setSearchQuery] = useState(address || '');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loadingGps, setLoadingGps] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync search box when address changes externally (e.g. GPS fill)
  useEffect(() => {
    if (address && address !== searchQuery) {
      setSearchQuery(address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const fetchPredictions = useCallback(
    async (query: string) => {
      if (!googleMapsApiKey || query.trim().length < 3) {
        setPredictions([]);
        return;
      }
      setLoadingSearch(true);
      try {
        const url =
          `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
          `?input=${encodeURIComponent(query)}` +
          `&types=establishment|geocode` +
          `&key=${googleMapsApiKey}`;
        const res = await fetch(url);
        const json = (await res.json()) as { status: string; predictions: PlacePrediction[] };
        if (json.status === 'OK') {
          setPredictions(json.predictions);
        } else {
          setPredictions([]);
        }
      } catch {
        setPredictions([]);
      } finally {
        setLoadingSearch(false);
      }
    },
    [googleMapsApiKey],
  );

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchPredictions(text);
      }, 400);
    },
    [fetchPredictions],
  );

  const handleSelectPrediction = useCallback(
    async (prediction: PlacePrediction) => {
      setPredictions([]);
      setSearchQuery(prediction.description);

      if (!googleMapsApiKey) return;
      try {
        const url =
          `https://maps.googleapis.com/maps/api/place/details/json` +
          `?place_id=${prediction.place_id}` +
          `&fields=geometry,formatted_address,address_components` +
          `&key=${googleMapsApiKey}`;
        const res = await fetch(url);
        const json = (await res.json()) as { status: string; result: PlaceDetail };
        if (json.status === 'OK') {
          const { geometry, formatted_address, address_components } = json.result;
          const cityComp = address_components.find(
            (c) => c.types.includes('locality') || c.types.includes('administrative_area_level_2'),
          );
          onLocationChange({
            address: formatted_address,
            city: cityComp?.long_name ?? '',
            latitude: geometry.location.lat,
            longitude: geometry.location.lng,
            placeId: prediction.place_id,
          });
          setSearchQuery(formatted_address);
        }
      } catch {
        // silently fail – address text is still captured
      }
    },
    [googleMapsApiKey, onLocationChange],
  );

  const handleUseMyLocation = useCallback(async () => {
    setLoadingGps(true);
    try {
      const locationData = await getCurrentLocation();
      if (!locationData) {
        setLoadingGps(false);
        return;
      }
      onLocationChange({
        address: locationData.address,
        city: locationData.city,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });
      setSearchQuery(locationData.address);
    } catch {
      // ignore
    } finally {
      setLoadingGps(false);
    }
  }, [onLocationChange]);

  const hasCoords = latitude !== undefined && longitude !== undefined && latitude !== 0 && longitude !== 0;

  return (
    <View style={pickerStyles.container}>
      {/* Toggle */}
      <View style={pickerStyles.toggleRow}>
        <TouchableOpacity
          style={[pickerStyles.toggleBtn, mode === 'at_venue' && pickerStyles.toggleBtnActive]}
          onPress={() => {
            setMode('at_venue');
            handleUseMyLocation();
          }}
        >
          <MaterialIcons
            name="my-location"
            size={16}
            color={mode === 'at_venue' ? colors.white : colors.textSecondary}
          />
          <Text style={[pickerStyles.toggleLabel, mode === 'at_venue' && pickerStyles.toggleLabelActive]}>
            I'm at the venue
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[pickerStyles.toggleBtn, mode === 'search' && pickerStyles.toggleBtnActive]}
          onPress={() => setMode('search')}
        >
          <MaterialIcons
            name="search"
            size={16}
            color={mode === 'search' ? colors.white : colors.textSecondary}
          />
          <Text style={[pickerStyles.toggleLabel, mode === 'search' && pickerStyles.toggleLabelActive]}>
            Search address
          </Text>
        </TouchableOpacity>
      </View>

      {/* "I'm at the venue" — GPS mode */}
      {mode === 'at_venue' && (
        <View>
          {loadingGps ? (
            <View style={pickerStyles.gpsRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={pickerStyles.gpsText}>Getting your location…</Text>
            </View>
          ) : hasCoords ? (
            <View>
              <View style={pickerStyles.gpsRow}>
                <MaterialIcons name="check-circle" size={18} color={colors.success} />
                <Text style={[pickerStyles.gpsText, { color: colors.success }]}>Location detected</Text>
              </View>
              <Text style={pickerStyles.addressPreview} numberOfLines={2}>{address}</Text>
              {/* Static Map Preview */}
              {googleMapsApiKey.length > 0 && (
                <Image
                  source={{
                    uri:
                      `https://maps.googleapis.com/maps/api/staticmap` +
                      `?center=${latitude},${longitude}&zoom=15&size=600x200&scale=2` +
                      `&markers=color:red%7C${latitude},${longitude}` +
                      `&key=${googleMapsApiKey}`,
                  }}
                  style={pickerStyles.mapPreview}
                  resizeMode="cover"
                />
              )}
              <TouchableOpacity style={pickerStyles.retryBtn} onPress={handleUseMyLocation}>
                <MaterialIcons name="refresh" size={14} color={colors.primary} />
                <Text style={pickerStyles.retryText}>Retry GPS</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={pickerStyles.gpsBtn} onPress={handleUseMyLocation}>
              <MaterialIcons name="gps-fixed" size={20} color={colors.primary} />
              <Text style={pickerStyles.gpsBtnText}>Use My Current Location</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Search mode — Google Places */}
      {mode === 'search' && (
        <View>
          <View style={pickerStyles.inputRow}>
            <MaterialIcons name="place" size={18} color={colors.textTertiary} style={{ marginRight: spacing.sm }} />
            <TextInput
              style={pickerStyles.input}
              placeholder="Search venue address…"
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoCorrect={false}
            />
            {loadingSearch && <ActivityIndicator size="small" color={colors.primary} />}
            {searchQuery.length > 0 && !loadingSearch && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); setPredictions([]); }}>
                <MaterialIcons name="close" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          {predictions.length > 0 && (
            <View style={pickerStyles.predictionsContainer}>
              <FlatList
                data={predictions}
                keyExtractor={(item) => item.place_id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={pickerStyles.predictionItem}
                    onPress={() => handleSelectPrediction(item)}
                  >
                    <MaterialIcons name="place" size={16} color={colors.primary} style={{ marginRight: spacing.sm }} />
                    <View style={{ flex: 1 }}>
                      <Text style={pickerStyles.predictionMain} numberOfLines={1}>
                        {item.structured_formatting.main_text}
                      </Text>
                      <Text style={pickerStyles.predictionSecondary} numberOfLines={1}>
                        {item.structured_formatting.secondary_text}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* Static Map Preview once location is picked */}
          {hasCoords && googleMapsApiKey.length > 0 && predictions.length === 0 && (
            <View style={{ marginTop: spacing.md }}>
              <Image
                source={{
                  uri:
                    `https://maps.googleapis.com/maps/api/staticmap` +
                    `?center=${latitude},${longitude}&zoom=15&size=600x200&scale=2` +
                    `&markers=color:red%7C${latitude},${longitude}` +
                    `&key=${googleMapsApiKey}`,
                }}
                style={pickerStyles.mapPreview}
                resizeMode="cover"
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                <MaterialIcons name="check-circle" size={14} color={colors.success} />
                <Text style={{ fontSize: 12, color: colors.success, fontWeight: '600' }}>
                  Location confirmed
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const createPickerStyles = ({ colors }: ThemeUtils) => StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleLabelActive: {
    color: colors.white,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 12,
  },
  predictionsContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 220,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  predictionMain: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  predictionSecondary: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  gpsText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignSelf: 'flex-start',
  },
  gpsBtnText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  addressPreview: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  mapPreview: {
    width: '100%',
    height: 150,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceVariant,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  retryText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default VenueLocationPicker;
