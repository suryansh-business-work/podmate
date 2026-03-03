import React, { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, RefreshControl, Platform, Share, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';
import { SkeletonDetail } from '../../components/Skeleton';
import { GET_POD } from '../../graphql/queries';
import { PodDetailScreenProps, PodAttendee } from './PodDetail.types';
import styles from './PodDetail.styles';

const PodDetailScreen: React.FC<PodDetailScreenProps> = ({ podId, onBack, onCheckout }) => {
  const { data, loading, error, refetch } = useQuery(GET_POD, { variables: { id: podId }, skip: !podId });
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 16) : insets.bottom;

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleJoin = () => {
    if (!podId) return;
    if (onCheckout) {
      onCheckout(podId);
    } else {
      Alert.alert('Error', 'Checkout is not available');
    }
  };

  const handleShare = async () => {
    if (!data?.pod) return;
    const p = data.pod;
    try {
      await Share.share({
        message: `Check out "${p.title}" on PartyWings! 🎉\n📍 ${p.location}\n💰 ₹${p.feePerPerson} per person`,
        title: p.title as string,
      });
    } catch {
      Alert.alert('Error', 'Unable to share this pod');
    }
  };

  if (error && !data?.pod) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialIcons name="cloud-off" size={48} color={colors.error} />
        <Text style={{ color: colors.error, fontWeight: '600', marginTop: 12 }}>Failed to load pod</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{error.message}</Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading || !data?.pod) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <SkeletonDetail />
        <TouchableOpacity onPress={onBack} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pod = data.pod;
  const spotsLeft = pod.maxSeats - pod.currentSeats;
  const date = new Date(pod.dateTime);
  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        >
        <View style={styles.heroContainer}>
          <Image source={{ uri: pod.imageUrl }} style={styles.heroImage} />
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
                <Image source={{ uri: pod.host?.avatar }} style={styles.hostAvatar} />
                <Text style={styles.hostName}>{pod.host?.name}</Text>
                {pod.host?.isVerifiedHost && <MaterialIcons name="check-circle" size={16} color={colors.primary} />}
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
            <View style={styles.infoCard}>
              <MaterialIcons name="place" size={22} color={colors.primary} />
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{pod.location}</Text>
              <Text style={styles.infoSubValue}>{pod.locationDetail}</Text>
            </View>
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
          {pod.latitude !== undefined && pod.longitude !== undefined && pod.latitude !== 0 && pod.longitude !== 0 && (
            <View style={{ marginTop: 16, marginBottom: 8 }}>
              <Text style={styles.sectionTitle}>Location</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  const url = Platform.select({
                    ios: `maps:0,0?q=${pod.latitude},${pod.longitude}`,
                    android: `geo:${pod.latitude},${pod.longitude}?q=${pod.latitude},${pod.longitude}(${encodeURIComponent(pod.location)})`,
                  }) ?? `https://maps.google.com/?q=${pod.latitude},${pod.longitude}`;
                  Linking.openURL(url).catch(() => {
                    Linking.openURL(`https://maps.google.com/?q=${pod.latitude},${pod.longitude}`);
                  });
                }}
                style={{ borderRadius: 12, overflow: 'hidden', marginTop: 8 }}
              >
                <Image
                  source={{
                    uri: `https://maps.googleapis.com/maps/api/staticmap?center=${pod.latitude},${pod.longitude}&zoom=15&size=600x200&scale=2&markers=color:red%7C${pod.latitude},${pod.longitude}&key=GOOGLE_MAPS_KEY`,
                  }}
                  style={{ width: '100%', height: 160, borderRadius: 12, backgroundColor: colors.surfaceVariant }}
                  resizeMode="cover"
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <MaterialIcons name="place" size={16} color={colors.primary} />
                  <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500', flex: 1 }}>{pod.location}</Text>
                  <MaterialIcons name="open-in-new" size={14} color={colors.textSecondary} />
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Open in Maps</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.attendeesSection}>
            <View style={styles.attendeesHeader}>
              <Text style={styles.sectionTitle}>Attendees</Text>
              <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
            </View>
            <View style={styles.attendeesRow}>
              {(pod.attendees ?? []).slice(0, 3).map((a: PodAttendee, i: number) => (
                <Image key={a.id} source={{ uri: a.avatar }} style={[styles.attendeeAvatar, { marginLeft: i > 0 ? -10 : 0 }]} />
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
        <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
          <LinearGradient colors={[colors.secondary, '#EF4444']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.joinGradient}>
            <Text style={styles.joinText}>Join Pod →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PodDetailScreen;
