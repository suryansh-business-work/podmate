import React, { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';
import { SkeletonDetail } from '../../components/Skeleton';
import { GET_POD } from '../../graphql/queries';
import { JOIN_POD } from '../../graphql/mutations';
import { PodDetailScreenProps, PodAttendee } from './PodDetail.types';
import styles from './PodDetail.styles';

const PodDetailScreen: React.FC<PodDetailScreenProps> = ({ podId, onBack }) => {
  const { data, loading, error, refetch } = useQuery(GET_POD, { variables: { id: podId }, skip: !podId });
  const [joinPod, { loading: joining }] = useMutation(JOIN_POD);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleJoin = async () => {
    if (!podId) return;
    try {
      await joinPod({ variables: { podId } });
      Alert.alert('Joined!', 'You have successfully joined this pod.');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join pod';
      Alert.alert('Error', errorMessage);
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        >
        <View style={styles.heroContainer}>
          <Image source={{ uri: pod.imageUrl }} style={styles.heroImage} />
          <SafeAreaView style={styles.heroOverlay}>
            <TouchableOpacity style={styles.iconButton} onPress={onBack}>
              <MaterialIcons name="arrow-back" size={20} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
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

      <View style={styles.bottomBar}>
        <View style={styles.priceInfo}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>₹{pod.feePerPerson.toLocaleString()}</Text>
          <Text style={styles.perPerson}>/ person</Text>
        </View>
        <TouchableOpacity style={styles.joinButton} onPress={handleJoin} disabled={joining}>
          <LinearGradient colors={[colors.secondary, '#EF4444']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.joinGradient}>
            <Text style={styles.joinText}>{joining ? 'Joining...' : 'Join Pod →'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PodDetailScreen;
