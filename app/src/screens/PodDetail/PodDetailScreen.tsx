import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
  Share,
  Linking,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from '@apollo/client';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MaterialIcons } from '@expo/vector-icons';

import { SkeletonDetail } from '../../components/Skeleton';
import SafeImage from '../../components/SafeImage';
import { GET_POD, GET_ME, GET_APP_CONFIG, GET_PODS } from '../../graphql/queries';
import { DELETE_POD } from '../../graphql/mutations';
import { PodDetailScreenProps, PodAttendee } from './PodDetail.types';
import { createStyles } from './PodDetail.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];
const SCREEN_W = Dimensions.get('window').width;

function isVideoUrl(url: string): boolean {
  const path = url.split('?')[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext));
}

const PodDetailScreen: React.FC<PodDetailScreenProps> = ({
  podId,
  onBack,
  onCheckout,
  onReviews,
  onGoLive,
  onUserProfile,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const { data, loading, error, refetch } = useQuery(GET_POD, {
    variables: { id: podId },
    skip: !podId,
  });
  const { data: meData } = useQuery(GET_ME, { fetchPolicy: 'cache-first' });
  const { data: configData } = useQuery(GET_APP_CONFIG, {
    variables: { keys: ['google_maps_api_key'] },
    fetchPolicy: 'cache-first',
  });
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 16) : insets.bottom;

  // All hooks must be declared before any conditional returns
  const [refreshing, setRefreshing] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [deletePod, { loading: deleting }] = useMutation(DELETE_POD, {
    refetchQueries: [{ query: GET_PODS, variables: { page: 1, limit: 20 } }],
  });

  const pod = data?.pod;
  const currentUserId: string = (meData?.me?.id as string) ?? '';
  const googleMapsApiKey: string =
    (configData?.appConfig as Array<{ key: string; value: string }> | undefined)?.find(
      (c) => c.key === 'google_maps_api_key',
    )?.value ?? '';

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  /* Collect all media (hero image + mediaUrls), filter out empty URIs */
  const allMedia: string[] = useMemo(() => {
    const urls: string[] = [];
    if (pod?.imageUrl && pod.imageUrl.trim().length > 0) urls.push(pod.imageUrl);
    if (pod?.mediaUrls) {
      pod.mediaUrls.forEach((u: string) => {
        if (u && u.trim().length > 0 && !urls.includes(u)) urls.push(u);
      });
    }
    return urls;
  }, [pod?.imageUrl, pod?.mediaUrls]);

  const firstVideoUrl = useMemo(() => allMedia.find((url) => isVideoUrl(url)) ?? null, [allMedia]);
  const videoSource = useMemo(
    () => (firstVideoUrl ? { uri: firstVideoUrl } : null),
    [firstVideoUrl],
  );
  const videoPlayer = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const handleMediaScroll = useCallback((e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setActiveSlide(idx);
  }, []);

  const handleJoin = useCallback(() => {
    if (!podId) return;
    if (onCheckout) {
      onCheckout(podId);
    } else {
      Alert.alert('Error', 'Checkout is not available');
    }
  }, [podId, onCheckout]);

  const handleShare = useCallback(async () => {
    if (!pod) return;
    try {
      await Share.share({
        message: `Check out "${pod.title}" on PartyWings! 🎉\n📍 ${pod.location}\n💰 ₹${pod.feePerPerson} per person`,
        title: pod.title as string,
      });
    } catch {
      Alert.alert('Error', 'Unable to share this pod');
    }
  }, [pod]);
  const handleDeletePod = useCallback(() => {
    if (!pod || !podId) return;
    const hasAttendees = (pod.currentSeats ?? 0) > 0;
    const title = hasAttendees ? 'Delete Pod & Refund Attendees?' : 'Delete Pod?';
    const message = hasAttendees
      ? `This pod has ${pod.currentSeats} attendee(s). Deleting will automatically issue a full refund to all attendees. This action cannot be undone.`
      : 'Are you sure you want to delete this pod? This action cannot be undone.';

    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: hasAttendees ? 'Delete & Refund' : 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePod({ variables: { id: podId } });
            Alert.alert(
              'Pod Deleted',
              hasAttendees
                ? 'The pod has been deleted and refunds have been initiated for all attendees.'
                : 'The pod has been deleted successfully.',
              [{ text: 'OK', onPress: onBack }],
            );
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete pod';
            Alert.alert('Error', errorMessage);
          }
        },
      },
    ]);
  }, [pod, podId, deletePod, onBack]);
  // Conditional returns AFTER all hooks
  if (error && !pod) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialIcons name="cloud-off" size={48} color={colors.error} />
        <Text style={{ color: colors.error, fontWeight: '600', marginTop: 12 }}>
          Failed to load pod
        </Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{error.message}</Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading || !pod) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <SkeletonDetail />
        <TouchableOpacity onPress={onBack} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const spotsLeft = pod.maxSeats - pod.currentSeats;
  const isJoined = currentUserId
    ? (pod.attendees ?? []).some((a: PodAttendee) => a.id === currentUserId)
    : false;
  const date = new Date(pod.dateTime);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.heroContainer}>
          {allMedia.length > 1 ? (
            <>
              <FlatList
                data={allMedia}
                keyExtractor={(uri, idx) => `${uri}-${idx}`}
                renderItem={({ item: uri }) =>
                  isVideoUrl(uri) ? (
                    <View style={[styles.heroImage, { width: SCREEN_W }]}>
                      <VideoView
                        player={videoPlayer}
                        style={{ width: SCREEN_W, height: 280 }}
                        nativeControls
                        contentFit="cover"
                      />
                    </View>
                  ) : (
                    <Image
                      source={{ uri: uri.trim() }}
                      style={[styles.heroImage, { width: SCREEN_W }]}
                    />
                  )
                }
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleMediaScroll}
                bounces={false}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 40,
                  alignSelf: 'center',
                  flexDirection: 'row',
                  gap: 6,
                }}
              >
                {allMedia.map((_, idx) => (
                  <View
                    key={idx}
                    style={{
                      width: activeSlide === idx ? 20 : 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: activeSlide === idx ? colors.white : 'rgba(255,255,255,0.5)',
                    }}
                  />
                ))}
              </View>
            </>
          ) : allMedia.length === 1 && isVideoUrl(allMedia[0]) ? (
            <View style={styles.heroImage}>
              <VideoView
                player={videoPlayer}
                style={{ width: SCREEN_W, height: 280 }}
                nativeControls
                contentFit="cover"
              />
            </View>
          ) : allMedia.length > 0 ? (
            <Image source={{ uri: allMedia[0] }} style={styles.heroImage} />
          ) : (
            <View
              style={[
                styles.heroImage,
                { backgroundColor: colors.darkBg, justifyContent: 'center', alignItems: 'center' },
              ]}
            >
              <MaterialIcons name="celebration" size={80} color={colors.textTertiary} />
            </View>
          )}
          <SafeAreaView style={styles.heroOverlay}>
            <TouchableOpacity style={styles.iconButton} onPress={onBack}>
              <MaterialIcons name="arrow-back" size={20} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
              <MaterialIcons name="share" size={20} color={colors.white} />
            </TouchableOpacity>
          </SafeAreaView>
          <View style={styles.statusContainer}>
            <View style={styles.statusBadge}>
              <MaterialIcons name="flash-on" size={14} color={colors.white} />
              <Text style={styles.statusText}>PENDING: {spotsLeft} SPOTS LEFT</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{pod.title}</Text>

          <View style={styles.hostRow}>
            <View style={styles.hostInfo}>
              <Text style={styles.hostedBy}>HOSTED BY</Text>
              <View style={styles.hostNameRow}>
                <SafeImage
                  uri={pod.host?.avatar}
                  style={styles.hostAvatar}
                  fallbackIcon="person"
                  fallbackIconSize={18}
                />
                <Text style={styles.hostName}>{pod.host?.name}</Text>
                {pod.host?.isVerifiedHost && (
                  <MaterialIcons name="check-circle" size={16} color={colors.primary} />
                )}
              </View>
            </View>
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={18} color={colors.warning} />
              <Text style={styles.ratingScore}>{pod.rating}</Text>
              <Text style={styles.reviewCount}>({pod.reviewCount})</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <MaterialIcons name="event" size={22} color={colors.primary} />
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>{formattedDate}</Text>
              <Text style={styles.infoSubValue}>{formattedTime}</Text>
            </View>
            <TouchableOpacity
              style={styles.infoCard}
              activeOpacity={0.7}
              onPress={() => {
                if (pod.latitude && pod.longitude && pod.latitude !== 0 && pod.longitude !== 0) {
                  const url =
                    Platform.select({
                      ios: `maps:0,0?q=${pod.latitude},${pod.longitude}`,
                      android: `geo:${pod.latitude},${pod.longitude}?q=${pod.latitude},${pod.longitude}(${encodeURIComponent(pod.location)})`,
                    }) ?? `https://maps.google.com/?q=${pod.latitude},${pod.longitude}`;
                  Linking.openURL(url).catch(() => {
                    Linking.openURL(`https://maps.google.com/?q=${pod.latitude},${pod.longitude}`);
                  });
                } else {
                  Linking.openURL(
                    `https://maps.google.com/maps?q=${encodeURIComponent(pod.location)}`,
                  );
                }
              }}
            >
              <MaterialIcons name="place" size={22} color={colors.primary} />
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{pod.location}</Text>
              <Text style={[styles.infoSubValue, { color: colors.primary }]}>Tap to open map</Text>
            </TouchableOpacity>
            <View style={styles.infoCard}>
              <MaterialIcons name="credit-card" size={22} color={colors.primary} />
              <Text style={styles.infoLabel}>Price per person</Text>
              <Text style={styles.infoValue}>₹{pod.feePerPerson.toLocaleString()}</Text>
            </View>
            <View style={styles.infoCard}>
              <MaterialIcons name="verified-user" size={22} color={colors.primary} />
              <Text style={styles.infoLabel}>Policy</Text>
              <Text style={styles.infoValue}>{pod.refundPolicy}</Text>
              <Text style={styles.infoSubValue}>Escrow Secured</Text>
            </View>
          </View>

          {/* Map Preview */}
          {pod.latitude !== undefined &&
            pod.longitude !== undefined &&
            pod.latitude !== 0 &&
            pod.longitude !== 0 &&
            googleMapsApiKey.length > 0 && (
              <View style={{ marginTop: 16, marginBottom: 8 }}>
                <Text style={styles.sectionTitle}>Location</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    const url =
                      Platform.select({
                        ios: `maps:0,0?q=${pod.latitude},${pod.longitude}`,
                        android: `geo:${pod.latitude},${pod.longitude}?q=${pod.latitude},${pod.longitude}(${encodeURIComponent(pod.location)})`,
                      }) ?? `https://maps.google.com/?q=${pod.latitude},${pod.longitude}`;
                    Linking.openURL(url).catch(() => {
                      Linking.openURL(
                        `https://maps.google.com/?q=${pod.latitude},${pod.longitude}`,
                      );
                    });
                  }}
                  style={{ borderRadius: 12, overflow: 'hidden', marginTop: 8 }}
                >
                  <Image
                    source={{
                      uri: `https://maps.googleapis.com/maps/api/staticmap?center=${pod.latitude},${pod.longitude}&zoom=15&size=600x200&scale=2&markers=color:red%7C${pod.latitude},${pod.longitude}&key=${googleMapsApiKey}`,
                    }}
                    style={{
                      width: '100%',
                      height: 160,
                      borderRadius: 12,
                      backgroundColor: colors.surfaceVariant,
                    }}
                    resizeMode="cover"
                  />
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}
                  >
                    <MaterialIcons name="place" size={16} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500', flex: 1 }}>
                      {pod.location}
                    </Text>
                    <MaterialIcons name="open-in-new" size={14} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Open in Maps</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

          <View style={styles.attendeesSection}>
            <View style={styles.attendeesHeader}>
              <Text style={styles.sectionTitle}>Attendees</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.attendeesRow}>
              {(pod.attendees ?? []).slice(0, 3).map((a: PodAttendee, i: number) => (
                <SafeImage
                  key={a.id}
                  uri={a.avatar}
                  style={[styles.attendeeAvatar, { marginLeft: i > 0 ? -10 : 0 }]}
                  fallbackIcon="person"
                  fallbackIconSize={14}
                />
              ))}
              {pod.currentSeats > 3 && (
                <View style={styles.moreAttendees}>
                  <Text style={styles.moreAttendeesText}>+{pod.currentSeats - 3}</Text>
                </View>
              )}
              <Text style={styles.joiningText}>Joining {pod.currentSeats} others</Text>
            </View>
          </View>

          <View style={styles.planSection}>
            <Text style={styles.sectionTitle}>The Plan</Text>
            <Text style={styles.planText}>{pod.description}</Text>
          </View>

          {/* Reviews Section */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 16,
              borderTopWidth: 1,
              borderTopColor: colors.surfaceVariant,
            }}
            onPress={() => onReviews?.('POD', podId ?? '', pod.title as string)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <MaterialIcons name="rate-review" size={22} color={colors.primary} />
              <View>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                  Reviews & Ratings
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <MaterialIcons name="star" size={14} color={colors.warning} />
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    {pod.rating} ({pod.reviewCount} reviews)
                  </Text>
                </View>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.textTertiary} />
          </TouchableOpacity>

          {/* Go Live / View Host Profile */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            {pod.host?.id === currentUserId && (
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: colors.error + '15',
                }}
                onPress={() => onGoLive?.(podId ?? '')}
                activeOpacity={0.7}
              >
                <MaterialIcons name="videocam" size={20} color={colors.error} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.error }}>
                  Go Live
                </Text>
              </TouchableOpacity>
            )}
            {pod.host?.id === currentUserId && (
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: colors.error + '10',
                  borderWidth: 1,
                  borderColor: colors.error + '30',
                }}
                onPress={handleDeletePod}
                disabled={deleting}
                activeOpacity={0.7}
              >
                <MaterialIcons name="delete" size={20} color={colors.error} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.error }}>
                  {deleting ? 'Deleting...' : 'Delete Pod'}
                </Text>
              </TouchableOpacity>
            )}
            {pod.host?.id && pod.host.id !== currentUserId && (
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: colors.primary + '15',
                }}
                onPress={() => onUserProfile?.(pod.host.id)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="person" size={20} color={colors.primary} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                  View Host Profile
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.trustNote}>
            <MaterialIcons name="info" size={18} color={colors.primary} />
            <Text style={styles.trustText}>
              <Text style={styles.trustBold}>Trust Note: </Text>
              Funds are held in escrow until the pod is activated with 5 confirmed members.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: 16 + bottomPadding }]}>
        <View style={styles.priceInfo}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>₹{pod.feePerPerson.toLocaleString()}</Text>
          <Text style={styles.perPerson}>/ person</Text>
        </View>
        {isJoined ? (
          <View
            style={[
              styles.joinButton,
              {
                backgroundColor: colors.success,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 16,
              },
            ]}
          >
            <Text style={[styles.joinText, { color: colors.white }]}>✓ Joined</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
            <LinearGradient
              colors={[colors.secondary, colors.error]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.joinGradient}
            >
              <Text style={styles.joinText}>Join Pod →</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default PodDetailScreen;
