import React, { memo, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useMutation } from '@apollo/client';
import SafeImage from './SafeImage';
import { FOLLOW_USER, UNFOLLOW_USER } from '../graphql/mutations';
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
  location?: string;
  hostName: string;
  hostAvatar: string;
  hostId?: string;
  isJoined?: boolean;
  isFollowing?: boolean;
  onPress: (id: string) => void;
}

export const EventCard: React.FC<EventCardProps> = memo(function EventCard({
  id,
  title,
  imageUrl,
  mediaUrls,
  currentSeats,
  maxSeats,
  dateTime,
  rating,
  status,
  location,
  hostName,
  hostAvatar,
  hostId,
  isJoined = false,
  isFollowing = false,
  onPress,
}) {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const date = new Date(dateTime);
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = date.getDate();
  const spotsLeft = maxSeats - currentSeats;

  // Auto-follow if joined => show "Following"
  const effectiveFollowing = isJoined || isFollowing;

  const [followUser] = useMutation(FOLLOW_USER);
  const [unfollowUser] = useMutation(UNFOLLOW_USER);

  const handleFollowToggle = useCallback(() => {
    if (!hostId) return;
    if (effectiveFollowing) {
      if (!isJoined) {
        unfollowUser({ variables: { userId: hostId } });
      }
    } else {
      followUser({ variables: { userId: hostId } });
    }
  }, [hostId, effectiveFollowing, isJoined, followUser, unfollowUser]);

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
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(id)}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${month} ${day}, ${spotsLeft} spots left, rated ${rating}`}
      accessibilityHint="Opens pod details"
    >
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

      {isJoined && (
        <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
          <Text style={styles.statusText}>✓ Joined</Text>
        </View>
      )}

      <View style={styles.contentRow}>
        {/* Date block on left */}
        <View style={[styles.dateBlock, { backgroundColor: getStatusColor() + '15' }]}>
          <Text style={[styles.dateMonth, { color: getStatusColor() }]}>{month}</Text>
          <Text style={[styles.dateDay, { color: getStatusColor() }]}>{day}</Text>
        </View>

        {/* Info on right */}
        <View style={styles.infoBlock}>
          {location ? (
            <View style={styles.locationRow}>
              <MaterialIcons name="place" size={12} color={colors.textTertiary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {location}
              </Text>
            </View>
          ) : null}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.bottomRow}>
            <View style={styles.hostRow}>
              <SafeImage
                uri={hostAvatar}
                style={styles.hostAvatar}
                fallbackIcon="person"
                fallbackIconSize={12}
              />
              <Text style={styles.hostName} numberOfLines={1}>
                {hostName}
              </Text>
            </View>
            <View style={styles.metaRight}>
              {rating > 0 && (
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingStar}>★</Text>
                  <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                </View>
              )}
              <Text style={styles.spotsLeft}>{spotsLeft > 0 ? `${spotsLeft} spots` : 'Full'}</Text>
            </View>
          </View>
          {hostId && (
            <TouchableOpacity
              style={[styles.followBtn, effectiveFollowing && styles.followBtnActive]}
              onPress={handleFollowToggle}
              disabled={isJoined}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={effectiveFollowing ? 'check' : 'person-add'}
                size={14}
                color={effectiveFollowing ? colors.success : colors.primary}
              />
              <Text
                style={[styles.followBtnText, effectiveFollowing && styles.followBtnTextActive]}
              >
                {effectiveFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const createStyles = ({ colors, spacing, borderRadius }: ThemeUtils) =>
  StyleSheet.create({
    card: {
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
      marginBottom: spacing.lg,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: 170,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
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
    contentRow: {
      flexDirection: 'row',
      padding: spacing.md,
      gap: spacing.md,
    },
    dateBlock: {
      width: 52,
      height: 56,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dateMonth: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    dateDay: {
      fontSize: 22,
      fontWeight: '800',
      lineHeight: 26,
    },
    infoBlock: {
      flex: 1,
      justifyContent: 'center',
      gap: 2,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    locationText: {
      fontSize: 11,
      color: colors.textTertiary,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 2,
    },
    hostRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flex: 1,
    },
    hostAvatar: {
      width: 20,
      height: 20,
      borderRadius: 10,
    },
    hostName: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    metaRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    ratingStar: {
      fontSize: 12,
      color: colors.warning,
    },
    ratingText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.text,
    },
    spotsLeft: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    followBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 4,
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary,
      marginTop: spacing.sm,
    },
    followBtnActive: {
      borderColor: colors.success,
      backgroundColor: colors.success + '10',
    },
    followBtnText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.primary,
    },
    followBtnTextActive: {
      color: colors.success,
    },
  });
