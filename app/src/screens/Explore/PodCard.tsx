import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing } from '../../theme';
import { Pod, CATEGORIES, formatDate, formatTime } from './Explore.types';
import { styles } from './Explore.styles';

interface PodCardProps {
  item: Pod;
  activeCategory: string;
  currentUserId: string;
  onCategoryChange: (cat: string) => void;
  onDetailPress?: (podId: string) => void;
  onJoinPress: (podId: string) => void;
  joiningId: string | null;
}

const PodCard: React.FC<PodCardProps> = ({
  item,
  activeCategory,
  currentUserId,
  onCategoryChange,
  onDetailPress,
  onJoinPress,
  joiningId,
}) => {
  const fillPct = Math.round((item.currentSeats / item.maxSeats) * 100);
  const isFull = item.currentSeats >= item.maxSeats;
  const alreadyJoined = (item.attendees ?? []).some((a) => a.id === currentUserId);

  return (
    <View style={styles.slide}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.bgImage} />
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

      <View style={styles.bottomContent}>
        <View style={styles.hostRow}>
          <Text style={styles.hostName}>@{item.host.name}</Text>
          {item.host.isVerifiedHost && <MaterialIcons name="verified" size={14} color={colors.accent} />}
        </View>

        <Text style={styles.podTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.podDesc} numberOfLines={2}>{item.description}</Text>

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
          <Text style={styles.seatsLabel}>{item.currentSeats}/{item.maxSeats} seats</Text>
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
              disabled={isFull || joiningId === item.id}
            >
              {joiningId === item.id ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <MaterialIcons name={isFull ? 'event-busy' : 'group-add'} size={18} color={colors.white} />
                  <Text style={styles.joinBtnText}>{isFull ? 'Full' : 'Join Pod'}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default PodCard;
