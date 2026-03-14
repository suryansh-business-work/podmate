import React, { useCallback, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, FlatList, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useMutation } from '@apollo/client';

import { LIKE_MOMENT, UNLIKE_MOMENT, DELETE_MOMENT } from '../../graphql/mutations';
import { GET_MOMENTS } from '../../graphql/queries';
import SafeImage from '../../components/SafeImage';
import type { MomentItem } from './Moments.types';
import { createStyles } from './Moments.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MEDIA_WIDTH = SCREEN_WIDTH - 32; // card marginHorizontal 16 each side

interface MomentCardProps {
  item: MomentItem;
  currentUserId: string;
  onCommentPress: (momentId: string) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

const MomentCard: React.FC<MomentCardProps> = ({ item, currentUserId, onCommentPress }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const isOwner = item.user.id === currentUserId;
  const [activeSlide, setActiveSlide] = useState(0);

  const [likeMoment] = useMutation(LIKE_MOMENT, {
    variables: { momentId: item.id },
    refetchQueries: [{ query: GET_MOMENTS }],
  });

  const [unlikeMoment] = useMutation(UNLIKE_MOMENT, {
    variables: { momentId: item.id },
    refetchQueries: [{ query: GET_MOMENTS }],
  });

  const [deleteMoment] = useMutation(DELETE_MOMENT, {
    variables: { id: item.id },
    refetchQueries: [{ query: GET_MOMENTS }],
  });

  const handleLikeToggle = useCallback(async () => {
    if (item.isLiked) {
      await unlikeMoment();
    } else {
      await likeMoment();
    }
  }, [item.isLiked, likeMoment, unlikeMoment]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Moment', 'Are you sure you want to delete this moment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMoment(),
      },
    ]);
  }, [deleteMoment]);

  const onScrollEnd = useCallback((e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / MEDIA_WIDTH);
    setActiveSlide(idx);
  }, []);

  const hasMultipleMedia = item.mediaUrls.length > 1;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.95}
      onPress={() => onCommentPress(item.id)}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        {item.user.avatar ? (
          <SafeImage uri={item.user.avatar} style={styles.cardAvatar} />
        ) : (
          <View style={[styles.cardAvatar, { justifyContent: 'center', alignItems: 'center' }]}>
            <MaterialIcons name="person" size={18} color={colors.textTertiary} />
          </View>
        )}
        <View style={styles.cardUserInfo}>
          <Text style={styles.cardUserName}>{item.user.name}</Text>
          <Text style={styles.cardTime}>{timeAgo(item.createdAt)}</Text>
        </View>
        {isOwner && (
          <TouchableOpacity onPress={handleDelete} style={styles.cardDeleteBtn}>
            <MaterialIcons name="more-vert" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Media Slider (Instagram-like) */}
      {item.mediaUrls.length > 0 && (
        <View>
          {hasMultipleMedia ? (
            <>
              <FlatList
                data={item.mediaUrls}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onScrollEnd}
                keyExtractor={(_, i) => `moment-media-${item.id}-${i}`}
                renderItem={({ item: uri }) => (
                  <Image source={{ uri }} style={styles.cardMediaSlide} resizeMode="cover" />
                )}
              />
              <View style={styles.mediaDots}>
                {item.mediaUrls.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.mediaDot,
                      {
                        backgroundColor: i === activeSlide ? colors.primary : colors.textTertiary,
                      },
                    ]}
                  />
                ))}
              </View>
            </>
          ) : (
            <Image
              source={{ uri: item.mediaUrls[0] }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          )}
        </View>
      )}

      {/* Footer */}
      <View style={styles.cardFooter}>
        {item.caption.length > 0 && <Text style={styles.cardCaption}>{item.caption}</Text>}
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLikeToggle}>
            <MaterialIcons
              name={item.isLiked ? 'favorite' : 'favorite-border'}
              size={22}
              color={item.isLiked ? colors.primary : colors.textTertiary}
            />
            <Text style={styles.actionCount}>{item.likeCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onCommentPress(item.id)}>
            <MaterialIcons name="chat-bubble-outline" size={20} color={colors.textTertiary} />
            <Text style={styles.actionCount}>{item.commentCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MomentCard;
