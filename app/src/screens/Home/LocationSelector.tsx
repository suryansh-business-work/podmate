import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import { StyleSheet, Dimensions } from 'react-native';

import SafeImage from '../../components/SafeImage';
import { useLocation } from '../../hooks/useLocation';
import { GET_ACTIVE_CITIES, GET_APPROVED_PLACES } from '../../graphql/queries';
import { useThemedStyles, useAppColors, ThemeUtils } from '../../hooks/useThemedStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CITY_CARD_WIDTH = (SCREEN_WIDTH - 72) / 3;

interface CityItem {
  id: string;
  name: string;
  imageUrl: string;
  clubCount: number;
  isTopCity: boolean;
  areas: { id: string; name: string }[];
}

interface PlaceItem {
  id: string;
  name: string;
  address: string;
  city: string;
}

interface LocationSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectCity: (city: string, area?: string) => void;
  currentCity?: string;
  currentArea?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  visible,
  onClose,
  onSelectCity,
  currentCity,
  currentArea,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityObj, setSelectedCityObj] = useState<CityItem | null>(null);
  const { requestLocation } = useLocation();

  const { data, loading } = useQuery(GET_ACTIVE_CITIES, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: placesData, loading: placesLoading } = useQuery<{
    approvedPlaces: PlaceItem[];
  }>(GET_APPROVED_PLACES, {
    variables: { search: searchQuery || undefined },
    skip: !searchQuery || searchQuery.length < 2,
    fetchPolicy: 'cache-and-network',
  });

  const cities: CityItem[] = (data?.activeCities as CityItem[]) ?? [];
  const topCities = cities.filter((c) => c.isTopCity);
  const otherCities = cities.filter((c) => !c.isTopCity);

  const filteredCities = searchQuery
    ? cities.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const searchedPlaces = placesData?.approvedPlaces ?? [];

  const handleCityPress = (city: CityItem) => {
    if (city.areas.length > 0) {
      setSelectedCityObj(city);
    } else {
      onSelectCity(city.name);
      onClose();
    }
  };

  const handlePlacePress = (place: PlaceItem) => {
    onSelectCity(place.city, place.name);
    onClose();
  };

  const handleAreaPress = (area: string) => {
    if (selectedCityObj) {
      onSelectCity(selectedCityObj.name, area);
      onClose();
    }
  };

  const handleUseLocation = useCallback(async () => {
    const result = await requestLocation();
    if (result?.address) {
      onSelectCity(result.address);
      onClose();
    }
  }, [requestLocation, onSelectCity, onClose]);

  const renderCityCard = (city: CityItem) => (
    <TouchableOpacity
      key={city.id}
      style={[styles.cityCard, currentCity === city.name && styles.cityCardSelected]}
      onPress={() => handleCityPress(city)}
    >
      <SafeImage uri={city.imageUrl} style={styles.cityImage} fallbackIcon="location-city" />
      <View style={styles.cityCardOverlay}>
        <Text style={styles.cityCardName}>{city.name}</Text>
        <Text style={styles.cityCardCount}>{city.clubCount} Clubs</Text>
      </View>
      {currentCity === city.name && (
        <View style={styles.checkBadge}>
          <MaterialIcons name="check-circle" size={22} color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <TouchableOpacity style={styles.header} onPress={onClose}>
          <MaterialIcons name="keyboard-arrow-down" size={24} color={colors.text} />
          <Text style={styles.headerTitle}>Select Location</Text>
        </TouchableOpacity>

        {/* Search */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Current Selection */}
        {currentCity && (
          <View style={styles.currentLocationCard}>
            <MaterialIcons name="place" size={40} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.currentLabel}>Currently selected</Text>
              <Text style={styles.currentCity}>{currentCity}</Text>
              {currentArea && <Text style={styles.currentArea}>({currentArea})</Text>}
            </View>
            <TouchableOpacity style={styles.updateBtn}>
              <Text style={styles.updateBtnText}>Update location</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Area Bottom Sheet */}
        {selectedCityObj ? (
          <View style={styles.areaSheet}>
            <View style={styles.areaSheetHandle} />
            <Text style={styles.areaSheetTitle}>Which area is closest to you?</Text>
            <Text style={styles.areaSheetSubtitle}>
              You'll still see all meet-ups in {selectedCityObj.name}, this just helps us show
              nearby ones first.
            </Text>

            <TouchableOpacity style={styles.areaItem} onPress={handleUseLocation}>
              <MaterialIcons name="my-location" size={20} color={colors.primary} />
              <Text style={[styles.areaItemText, { color: colors.primary }]}>
                Use current location
              </Text>
            </TouchableOpacity>

            <FlatList
              data={selectedCityObj.areas}
              keyExtractor={(a) => a.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.areaItem}
                  onPress={() => handleAreaPress(item.name)}
                >
                  <MaterialCommunityIcons
                    name="office-building"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.areaItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedCityObj(null)}>
              <Text style={styles.backBtnText}>← Back to cities</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {loading && (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            )}

            {searchQuery ? (
              <View style={{ padding: 20 }}>
                {placesLoading && (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                    style={{ marginBottom: 12 }}
                  />
                )}
                {searchedPlaces.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.sectionTitle}>PLACES</Text>
                    {searchedPlaces.map((place) => (
                      <TouchableOpacity
                        key={place.id}
                        style={styles.listCityItem}
                        onPress={() => handlePlacePress(place)}
                      >
                        <View style={styles.placeIcon}>
                          <MaterialIcons name="place" size={20} color={colors.primary} />
                        </View>
                        <View>
                          <Text style={styles.listCityName}>{place.name}</Text>
                          <Text style={styles.listCityCount}>
                            {place.address}, {place.city}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {filteredCities.length > 0 && (
                  <View>
                    <Text style={styles.sectionTitle}>CITIES</Text>
                    {filteredCities.map(renderCityCard)}
                  </View>
                )}
                {filteredCities.length === 0 && searchedPlaces.length === 0 && !placesLoading && (
                  <Text style={styles.emptyText}>No locations found</Text>
                )}
              </View>
            ) : (
              <>
                {/* Top Cities */}
                {topCities.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>TOP CITIES</Text>
                    <View style={styles.cityGrid}>{topCities.map(renderCityCard)}</View>
                  </View>
                )}

                {/* Other Active Cities */}
                {otherCities.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>OTHER ACTIVE CITIES</Text>
                    {otherCities.map((city) => (
                      <TouchableOpacity
                        key={city.id}
                        style={styles.listCityItem}
                        onPress={() => handleCityPress(city)}
                      >
                        <SafeImage
                          uri={city.imageUrl}
                          style={styles.listCityImage}
                          fallbackIcon="location-city"
                        />
                        <View>
                          <Text style={styles.listCityName}>{city.name}</Text>
                          <Text style={styles.listCityCount}>{city.clubCount} clubs</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    headerTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      marginHorizontal: spacing.xl,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    searchInput: { flex: 1, fontSize: 15, color: colors.text },
    currentLocationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryLight + '20',
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginHorizontal: spacing.xl,
      marginBottom: spacing.lg,
      gap: spacing.md,
    },
    currentLabel: { fontSize: 11, color: colors.textSecondary },
    currentCity: { fontSize: 18, fontWeight: '700', color: colors.text },
    currentArea: { fontSize: 12, color: colors.textSecondary },
    updateBtn: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
    },
    updateBtnText: { fontSize: 12, fontWeight: '600', color: colors.text },
    section: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textTertiary,
      letterSpacing: 0.5,
      marginBottom: spacing.md,
    },
    cityGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    cityCard: {
      width: CITY_CARD_WIDTH,
      height: CITY_CARD_WIDTH * 1.2,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
    },
    cityCardSelected: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    cityImage: {
      width: '100%',
      height: '100%',
    },
    cityCardOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    cityCardName: {
      fontSize: 16,
      fontWeight: '800',
      color: '#fff',
    },
    cityCardCount: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.85)',
    },
    checkBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: colors.white,
      borderRadius: 12,
    },
    listCityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    listCityImage: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.md,
    },
    placeIcon: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primaryLight + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    listCityName: { fontSize: 15, fontWeight: '600', color: colors.text },
    listCityCount: { fontSize: 12, color: colors.textSecondary },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.xxl,
    },
    areaSheet: {
      flex: 1,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: spacing.xl,
    },
    areaSheetHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: spacing.lg,
    },
    areaSheetTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    areaSheetSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: spacing.xl,
      lineHeight: 20,
    },
    areaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    areaItemText: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
    },
    backBtn: {
      paddingVertical: spacing.lg,
      alignItems: 'center',
    },
    backBtnText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
    },
  });

export default LocationSelector;
