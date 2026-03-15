import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';

import { GET_MY_PLACES } from '../../graphql/queries/misc.queries';
import { VenueMenuScreenProps, MenuCategory, MENU_CATEGORIES } from './VenueMenus.types';
import { createStyles } from './VenueMenus.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface PlaceOption {
  id: string;
  name: string;
}

const VenueMenusScreen: React.FC<VenueMenuScreenProps> = ({ onBack }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('FOOD');
  const [selectedVenueIdx, setSelectedVenueIdx] = useState(0);

  const { data } = useQuery(GET_MY_PLACES, { fetchPolicy: 'cache-and-network' });
  const venues: PlaceOption[] = (data?.myPlaces ?? []).filter(
    (p: PlaceOption & { status: string }) => p.status === 'APPROVED',
  );

  const selectedVenue = venues[selectedVenueIdx];

  const cycleVenue = () => {
    if (venues.length > 1) {
      setSelectedVenueIdx((prev) => (prev + 1) % venues.length);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menus</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Venue selector */}
      {venues.length > 0 && (
        <TouchableOpacity style={styles.venueSelector} onPress={cycleVenue} activeOpacity={0.7}>
          <MaterialIcons name="store" size={20} color={colors.primary} />
          <Text style={styles.venueSelectorText} numberOfLines={1}>
            {'  '}
            {selectedVenue?.name ?? 'Select Venue'}
          </Text>
          {venues.length > 1 && (
            <MaterialIcons name="swap-horiz" size={20} color={colors.textTertiary} />
          )}
        </TouchableOpacity>
      )}

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {MENU_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryChip, activeCategory === cat.key && styles.categoryChipActive]}
            onPress={() => setActiveCategory(cat.key)}
          >
            <MaterialIcons
              name={cat.icon}
              size={14}
              color={activeCategory === cat.key ? colors.white : colors.textSecondary}
            />
            <Text
              style={[
                styles.categoryChipText,
                activeCategory === cat.key && styles.categoryChipTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Empty state — coming soon since no server API yet */}
      <View style={styles.centered}>
        <MaterialIcons name="restaurant-menu" size={56} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>No menu items yet</Text>
        <Text style={styles.emptySubtitle}>
          Add food & drink packages that hosts can view when booking your venue.
          {'\n'}This feature is coming soon!
        </Text>
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Coming Soon</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VenueMenusScreen;
