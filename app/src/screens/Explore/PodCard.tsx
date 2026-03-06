import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useMutation } from '@apollo/client';

import { Pod, CATEGORIES, formatDate, formatTime } from './Explore.types';
import { createStyles, SCREEN_W } from './Explore.styles';
import { SAVE_POD, UNSAVE_POD } from '../../graphql/mutations';
import SafeImage from '../../components/SafeImage';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];

function isVideoUrl(url: string): boolean {
  const path = url.split('?')[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext));
}

interface PodCardProps {
  item: Pod;
  activeCategory: string;
  currentUserId: string;
  savedPodIds: string[];
  onCategoryChange: (cat: string) => void;
  onDetailPress?: (podId: string) => void;
  onJoinPress: (podId: string) => void;
  slideHeight: number;
}

const PodCard: React.FC<PodCardProps> = ({
  item,
  activeCategory,
  currentUserId,
  savedPodIds,
  onCategoryChange,
  onDetailPress,
  onJoinPress,
  slideHeight,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const fillPct = Math.round((item.currentSeats / item.maxSeats) * 100);
  const isFull = item.currentSeats >= item.maxSeats;
  const alreadyJoined = (item.attendees ?? []).some((a) => a.id === currentUserId);
  const isSaved = savedPodIds.includes(item.id);
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef<FlatList<string>>(null);

  const [savePodMutation] = useMutation(SAVE_POD);
  const [unsavePodMutation] = useMutation(UNSAVE_POD);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out "${item.title}" on PartyWings! 🎉\n📍 ${item.location}\n📅 ${formatDate(item.dateTime)} at ${formatTime(item.dateTime)}\n💰 ₹${item.feePerPerson.toLocaleString()} per person`,
        title: item.title,
      });
    } catch {
      Alert.alert('Error', 'Unable to share this pod');
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        await unsavePodMutation({ variables: { podId: item.id } });
      } else {
        await savePodMutation({ variables: { podId: item.id } });
      }
    } catch {
      Alert.alert('Error', 'Unable to save this pod');
    }
  };

  const allImages: string[] = (() => {
    const urls: string[] = [];
    if (item.imageUrl && item.imageUrl.trim().length > 0) urls.push(item.imageUrl);
    if (item.mediaUrls) {
      item.mediaUrls.forEach((url) => {
        if (url && url.trim().length > 0 && !urls.includes(url)) urls.push(url);
      });
    }
    return urls;
  })();

  const handleSliderScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setActiveSlide(idx);
  }, []);

  /* First video URL for autoplay in the list card */
  const firstVideoUrl = useMemo(
    () => allImages.find((url) => isVideoUrl(url)) ?? null,
    [allImages],
  );
  const videoSource = useMemo(
    () => (firstVideoUrl ? { uri: firstVideoUrl } : null),
    [firstVideoUrl],
  );
  const videoPlayer = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const renderSliderItem = useCallback(
    ({ item: uri }: { item: string }) => {
      if (isVideoUrl(uri)) {
        return (
          <View
            style={[styles.bgImage, { width: SCREEN_W, height: slideHeight, position: 'relative' }]}
          >
            <VideoView
              player={videoPlayer}
              style={{ width: SCREEN_W, height: slideHeight }}
              nativeControls={false}
              contentFit="cover"
            />
            <View
              style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 12,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <MaterialIcons name="videocam" size={16} color={colors.white} />
            </View>
          </View>
        );
      }
      return (
        <Image
          source={{ uri }}
          style={[styles.bgImage, { width: SCREEN_W, height: slideHeight, position: 'relative' }]}
          resizeMode="cover"
        />
      );
    },
    [slideHeight, videoPlayer],
  );

  return (
    <View style={[styles.slide, { height: slideHeight }]}>
      {allImages.length > 1 ? (
        <>
          <FlatList
            ref={sliderRef}
            data={allImages}
            keyExtractor={(uri, idx) => `${uri}-${idx}`}
            renderItem={renderSliderItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleSliderScroll}
            style={[styles.bgImage, { height: slideHeight }]}
            bounces={false}
          />
          {allImages.length > 1 && (
            <View style={styles.paginationDots}>
              {allImages.map((_, idx) => (
                <View key={idx} style={[styles.dot, activeSlide === idx && styles.dotActive]} />
              ))}
            </View>
          )}
        </>
      ) : allImages.length === 1 ? (
        isVideoUrl(allImages[0]) ? (
          <View style={[styles.bgImage, { height: slideHeight }]}>
            <VideoView
              player={videoPlayer}
              style={{ width: SCREEN_W, height: slideHeight }}
              nativeControls={false}
              contentFit="cover"
            />
            <View
              style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 12,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <MaterialIcons name="videocam" size={16} color={colors.white} />
            </View>
          </View>
        ) : (
          <Image source={{ uri: allImages[0] }} style={[styles.bgImage, { height: slideHeight }]} />
        )
      ) : (
        <View style={[styles.bgImage, { backgroundColor: colors.darkBg }]}>
          <MaterialIcons name="celebration" size={80} color={colors.textTertiary} />
        </View>
      )}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.4, 1]}
        style={styles.gradient}
      />

      <View style={styles.topBar}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
            onPress={() => onCategoryChange(cat)}
          >
            <Text style={[styles.catPillText, activeCategory === cat && styles.catPillTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sideActions}>
        <TouchableOpacity style={styles.sideBtn} onPress={() => onDetailPress?.(item.id)}>
          <MaterialIcons name="info-outline" size={28} color={colors.white} />
          <Text style={styles.sideBtnText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sideBtn} onPress={handleShare}>
          <MaterialIcons name="share" size={28} color={colors.white} />
          <Text style={styles.sideBtnText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sideBtn} onPress={handleSave}>
          <MaterialIcons
            name={isSaved ? 'bookmark' : 'bookmark-border'}
            size={28}
            color={isSaved ? colors.accent : colors.white}
          />
          <Text style={styles.sideBtnText}>{isSaved ? 'Saved' : 'Save'}</Text>
        </TouchableOpacity>
        <SafeImage
          uri={item.host.avatar}
          style={styles.hostAvatarSide}
          fallbackIcon="person"
          fallbackIconSize={18}
          fallbackStyle={{ backgroundColor: colors.primary }}
        />
      </View>

      <View style={styles.bottomContent}>
        <View style={styles.hostRow}>
          <Text style={styles.hostName}>@{item.host.name}</Text>
          {item.host.isVerifiedHost && (
            <MaterialIcons name="verified" size={14} color={colors.accent} />
          )}
        </View>

        <Text style={styles.podTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.podDesc} numberOfLines={2}>
          {item.description}
        </Text>

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

        <View style={styles.seatsRow}>
          <View style={styles.seatsBarBg}>
            <View style={[styles.seatsBarFill, { width: `${Math.min(fillPct, 100)}%` }]} />
          </View>
          <Text style={styles.seatsLabel}>
            {item.currentSeats}/{item.maxSeats} seats
          </Text>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>₹{item.feePerPerson.toLocaleString()}</Text>
            <Text style={styles.priceSub}>per person</Text>
          </View>
          {alreadyJoined ? (
            <View style={[styles.joinBtn, { backgroundColor: colors.success }]}>
              <MaterialIcons name="check-circle" size={18} color={colors.white} />
              <Text style={styles.joinBtnText}>Joined</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.joinBtn, isFull && styles.joinBtnFull]}
              activeOpacity={0.8}
              onPress={() => (isFull ? null : onJoinPress(item.id))}
              disabled={isFull}
            >
              <MaterialIcons
                name={isFull ? 'event-busy' : 'group-add'}
                size={18}
                color={colors.white}
              />
              <Text style={styles.joinBtnText}>{isFull ? 'Full' : 'Join Pod'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default PodCard;
