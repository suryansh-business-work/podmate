import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';

import { GET_MOMENTS } from '../../graphql/queries';
import { GET_MY_PLACES } from '../../graphql/queries/misc.queries';
import { VenueMomentsScreenProps, MomentItem } from './VenueMoments.types';
import { createStyles } from './VenueMoments.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface PlaceOption {
  id: string;
  name: string;
  status: string;
}

const VenueMomentsScreen: React.FC<VenueMomentsScreenProps> = ({ onBack }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVenueIdx, setSelectedVenueIdx] = useState(-1); // -1 = All

  const { data: placesData } = useQuery(GET_MY_PLACES, { fetchPolicy: 'cache-and-network' });
  const venues: PlaceOption[] = (placesData?.myPlaces ?? []).filter(
    (p: PlaceOption) => p.status === 'APPROVED',
  );

  const { data: momentsData, refetch } = useQuery(GET_MOMENTS, {
    variables: { page: 1, limit: 50 },
    fetchPolicy: 'cache-and-network',
  });

  const moments: MomentItem[] = momentsData?.moments?.items ?? [];

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const cycleVenue = () => {
    if (venues.length === 0) return;
    setSelectedVenueIdx((prev) => {
      if (prev >= venues.length - 1) return -1;
      return prev + 1;
    });
  };

  const selectedVenueName =
    selectedVenueIdx === -1 ? 'All Venues' : (venues[selectedVenueIdx]?.name ?? 'All Venues');

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderMoment = ({ item }: { item: MomentItem }) => (
    <View style={styles.momentCard}>
      {item.mediaUrls?.[0] ? (
        <Image source={{ uri: item.mediaUrls[0] }} style={styles.momentImage} />
      ) : (
        <View style={styles.momentImagePlaceholder}>
          <MaterialIcons name="image" size={40} color={colors.textTertiary} />
        </View>
      )}
      <View style={styles.momentBody}>
        <View style={styles.momentUserRow}>
          {item.user?.avatar ? (
            <Image source={{ uri: item.user.avatar }} style={styles.momentAvatar} />
          ) : (
            <View style={styles.momentAvatarPlaceholder}>
              <MaterialIcons name="person" size={16} color={colors.textTertiary} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.momentUserName}>{item.user?.name ?? 'User'}</Text>
            <Text style={styles.momentDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        {item.caption ? (
          <Text style={styles.momentCaption} numberOfLines={3}>
            {item.caption}
          </Text>
        ) : null}
        <View style={styles.momentActions}>
          <View style={styles.momentActionBtn}>
            <MaterialIcons
              name={item.isLiked ? 'favorite' : 'favorite-border'}
              size={18}
              color={item.isLiked ? colors.primary : colors.textSecondary}
            />
            <Text style={styles.momentActionText}>{item.likeCount}</Text>
          </View>
          <View style={styles.momentActionBtn}>
            <MaterialIcons name="chat-bubble-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.momentActionText}>{item.commentCount}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Venues Moments</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Venue filter */}
      {venues.length > 0 && (
        <TouchableOpacity style={styles.venueSelector} onPress={cycleVenue} activeOpacity={0.7}>
          <MaterialIcons name="store" size={20} color={colors.primary} />
          <Text style={styles.venueSelectorText} numberOfLines={1}>
            {'  '}
            {selectedVenueName}
          </Text>
          <MaterialIcons name="swap-horiz" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      )}

      {moments.length === 0 ? (
        <View style={styles.centered}>
          <MaterialIcons name="auto-awesome" size={56} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No moments yet</Text>
          <Text style={styles.emptySubtitle}>
            Moments will appear here when users post from your venues.
          </Text>
        </View>
      ) : (
        <FlatList
          data={moments}
          keyExtractor={(item) => item.id}
          renderItem={renderMoment}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default VenueMomentsScreen;
