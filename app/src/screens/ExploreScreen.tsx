import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Animated as RNAnimated,
} from 'react-native';
import { useMutation, useQuery } from '@apollo/client';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, borderRadius } from '../theme';
import { GET_PODS } from '../graphql/queries';
import { JOIN_POD } from '../graphql/mutations';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const STATUS_BAR_H = StatusBar.currentHeight ?? 44;

interface Pod {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  feePerPerson: number;
  location: string;
  locationDetail: string;
  maxSeats: number;
  currentSeats: number;
  dateTime: string;
  status: string;
  rating: number;
  reviewCount: number;
  host: { id: string; name: string; avatar: string; isVerifiedHost: boolean };
}

interface PodNavigationCallback {
  (podId: string): void;
}

interface ExploreScreenProps {
  onPodPress?: PodNavigationCallback;
}

const CATEGORIES = ['All', 'Social', 'Learning', 'Outdoor'];

const ExploreScreen: React.FC<ExploreScreenProps> = ({ onPodPress }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(GET_PODS, {
    variables: {
      page: 1,
      limit: 50,
      category: activeCategory === 'All' ? undefined : activeCategory,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [joinPodMutation] = useMutation(JOIN_POD);

  const pods: Pod[] = data?.pods?.items ?? [];

  const handleJoin = useCallback(async (podId: string) => {
    setJoiningId(podId);
    try {
      await joinPodMutation({ variables: { podId } });
      await refetch();
    } catch {
      /* handled by Apollo */
    } finally {
      setJoiningId(null);
    }
  }, [joinPodMutation, refetch]);

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatTime = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && pods.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderCard = ({ item }: { item: Pod }) => {
    const fillPct = Math.round((item.currentSeats / item.maxSeats) * 100);
    const isFull = item.currentSeats >= item.maxSeats;

    return (
      <View style={styles.slide}>
        {/* Background image */}
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.bgImage} />
        ) : (
          <View style={[styles.bgImage, { backgroundColor: colors.darkBg }]}>
            <MaterialIcons name="celebration" size={80} color={colors.textTertiary} />
          </View>
        )}

        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
          locations={[0, 0.4, 1]}
          style={styles.gradient}
        />

        {/* Category pills at top */}
        <View style={styles.topBar}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.catPillText, activeCategory === cat && styles.catPillTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Right sidebar actions */}
        <View style={styles.sideActions}>
          <TouchableOpacity style={styles.sideBtn} onPress={() => onPodPress?.(item.id)}>
            <MaterialIcons name="info-outline" size={28} color={colors.white} />
            <Text style={styles.sideBtnText}>Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideBtn}>
            <MaterialIcons name="share" size={28} color={colors.white} />
            <Text style={styles.sideBtnText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideBtn}>
            <MaterialIcons name="bookmark-border" size={28} color={colors.white} />
            <Text style={styles.sideBtnText}>Save</Text>
          </TouchableOpacity>
          {item.host.avatar ? (
            <Image source={{ uri: item.host.avatar }} style={styles.hostAvatarSide} />
          ) : (
            <View style={[styles.hostAvatarSide, { backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
              <MaterialIcons name="person" size={18} color={colors.white} />
            </View>
          )}
        </View>

        {/* Bottom content */}
        <View style={styles.bottomContent}>
          {/* Host info */}
          <View style={styles.hostRow}>
            <Text style={styles.hostName}>@{item.host.name}</Text>
            {item.host.isVerifiedHost && (
              <MaterialIcons name="verified" size={14} color={colors.accent} />
            )}
          </View>

          {/* Title */}
          <Text style={styles.podTitle} numberOfLines={2}>{item.title}</Text>

          {/* Description */}
          <Text style={styles.podDesc} numberOfLines={2}>{item.description}</Text>

          {/* Info chips */}
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <MaterialIcons name="place" size={12} color={colors.white} />
              <Text style={styles.chipText}>{item.location}</Text>
            </View>
            <View style={styles.chip}>
              <MaterialIcons name="event" size={12} color={colors.white} />
              <Text style={styles.chipText}>{formatDate(item.dateTime)}</Text>
            </View>
            <View style={styles.chip}>
              <MaterialIcons name="access-time" size={12} color={colors.white} />
              <Text style={styles.chipText}>{formatTime(item.dateTime)}</Text>
            </View>
          </View>

          {/* Seats progress */}
          <View style={styles.seatsRow}>
            <View style={styles.seatsBarBg}>
              <View style={[styles.seatsBarFill, { width: `${Math.min(fillPct, 100)}%` }]} />
            </View>
            <Text style={styles.seatsLabel}>{item.currentSeats}/{item.maxSeats} seats</Text>
          </View>

          {/* Join + Price bar */}
          <View style={styles.actionRow}>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>₹{item.feePerPerson.toLocaleString()}</Text>
              <Text style={styles.priceSub}>per person</Text>
            </View>

            <TouchableOpacity
              style={[styles.joinBtn, isFull && styles.joinBtnFull]}
              activeOpacity={0.8}
              onPress={() => isFull ? null : handleJoin(item.id)}
              disabled={isFull || joiningId === item.id}
            >
              {joiningId === item.id ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <MaterialIcons
                    name={isFull ? 'event-busy' : 'group-add'}
                    size={18}
                    color={colors.white}
                  />
                  <Text style={styles.joinBtnText}>{isFull ? 'Full' : 'Join Pod'}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <FlatList
        data={pods}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_H}
        decelerationRate="fast"
        ListEmptyComponent={
          <View style={[styles.slide, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.darkBg }]}>
            <MaterialIcons name="explore-off" size={64} color={colors.textTertiary} />
            <Text style={[styles.podTitle, { textAlign: 'center', marginTop: spacing.md }]}>No pods found</Text>
            <Text style={[styles.podDesc, { textAlign: 'center' }]}>Try a different category</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.black },
  slide: { width: SCREEN_W, height: SCREEN_H, position: 'relative' },
  bgImage: { ...StyleSheet.absoluteFillObject, width: SCREEN_W, height: SCREEN_H, justifyContent: 'center', alignItems: 'center' },
  gradient: { ...StyleSheet.absoluteFillObject },

  /* Top category bar */
  topBar: {
    position: 'absolute',
    top: STATUS_BAR_H + 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    zIndex: 10,
  },
  catPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  catPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catPillText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  catPillTextActive: { color: colors.white },

  /* Right sidebar */
  sideActions: {
    position: 'absolute',
    right: spacing.md,
    bottom: 200,
    alignItems: 'center',
    gap: spacing.lg,
    zIndex: 10,
  },
  sideBtn: { alignItems: 'center', gap: 4 },
  sideBtnText: { fontSize: 10, color: colors.white, fontWeight: '500' },
  hostAvatarSide: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: colors.primary },

  /* Bottom content */
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 70,
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
    zIndex: 10,
  },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  hostName: { fontSize: 14, fontWeight: '700', color: colors.white },
  podTitle: { fontSize: 22, fontWeight: '800', color: colors.white, marginBottom: spacing.xs },
  podDesc: { fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 20, marginBottom: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  chipText: { fontSize: 11, color: colors.white, fontWeight: '500' },

  /* Seats */
  seatsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  seatsBarBg: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' },
  seatsBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  seatsLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },

  /* Action row */
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  priceBox: { flex: 1 },
  priceLabel: { fontSize: 22, fontWeight: '800', color: colors.white },
  priceSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  joinBtnFull: { backgroundColor: colors.textTertiary },
  joinBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
});

export default ExploreScreen;
