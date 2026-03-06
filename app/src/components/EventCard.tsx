import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme';
import SafeImage from './SafeImage';
import { useThemedStyles, useAppColors, ThemeUtils } from '../hooks/useThemedStyles';

const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];

function isVideoUrl(url: string): boolean {
  const path = url.split('?')[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext));
}

interface EventCardProps {
  id: string;
  title: string;
  imageUrl: string;
  mediaUrls?: string[];
  feePerPerson: number;
  maxSeats: number;
  currentSeats: number;
  dateTime: string;
  rating: number;
  status: string;
  category: string;
  hostName: string;
  hostAvatar: string;
  isJoined?: boolean;
  onPress: (id: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  imageUrl,
  mediaUrls,
  feePerPerson,
  currentSeats,
  maxSeats,
  dateTime,
  rating,
  status,
  hostName,
  hostAvatar,
  isJoined = false,
  onPress,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const date = new Date(dateTime);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const spotsLeft = maxSeats - currentSeats;

  // Detect if the pod has at least one video
  const hasVideo = useMemo(() => {
    const allUrls = [imageUrl, ...(mediaUrls ?? [])].filter(Boolean);
    return allUrls.some((u) => isVideoUrl(u));
  }, [imageUrl, mediaUrls]);

  const getStatusColor = () => {
    switch (status) {
      case 'CONFIRMED':
        return colors.success;
      case 'PENDING':
        return colors.warning;
      case 'NEW':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(id)} activeOpacity={0.85}>
      <View>
        <SafeImage
          uri={imageUrl}
          style={styles.image}
          fallbackIcon="celebration"
          fallbackIconSize={48}
        />
        {hasVideo && (
          <View style={styles.playOverlay} pointerEvents="none">
            <MaterialIcons name="play-circle-filled" size={40} color="rgba(255,255,255,0.85)" />
          </View>
        )}
      </View>

      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>

      {/* Joined Badge */}
      {isJoined && (
        <View style={[styles.statusBadge, { backgroundColor: colors.success, top: 38 }]}>
          <Text style={styles.statusText}>✓ Joined</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.dateText}>📅 {formattedDate}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStar}>★</Text>
            <Text style={styles.ratingText}>{rating > 0 ? rating : 'New'}</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.hostRow}>
            <SafeImage
              uri={hostAvatar}
              style={styles.hostAvatar}
              fallbackIcon="person"
              fallbackIconSize={14}
            />
            <Text style={styles.hostName}>{hostName}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{feePerPerson.toLocaleString()}</Text>
            <Text style={styles.spotsLeft}> · {spotsLeft} spots</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    card: {
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
      marginBottom: spacing.lg,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: 180,
    },
    playOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.overlayLight,
    },
    statusBadge: {
      position: 'absolute',
      top: spacing.md,
      left: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
    },
    statusText: {
      color: colors.white,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    content: {
      padding: spacing.lg,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    dateText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    ratingStar: {
      fontSize: 14,
      color: colors.warning,
    },
    ratingText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    hostRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    hostAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
    },
    hostName: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    price: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
    },
    spotsLeft: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });
