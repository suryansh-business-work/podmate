import React from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, borderRadius } from '../theme';
import { GET_POD } from '../graphql/queries';
import { JOIN_POD } from '../graphql/mutations';

const { width } = Dimensions.get('window');

interface PodDetailScreenProps {
  podId?: string;
  onBack: () => void;
}

const PodDetailScreen: React.FC<PodDetailScreenProps> = ({ podId, onBack }) => {
  const { data, loading } = useQuery(GET_POD, { variables: { id: podId }, skip: !podId });
  const [joinPod, { loading: joining }] = useMutation(JOIN_POD);

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

  if (loading || !data?.pod) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
              {(pod.attendees ?? []).slice(0, 3).map((a: { id: string; avatar: string }, i: number) => (
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollView: { flex: 1 },
  heroContainer: { height: 280, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  statusContainer: { position: 'absolute', bottom: 0, left: 0 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderTopRightRadius: borderRadius.sm, gap: spacing.xs },
  statusText: { color: colors.white, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  content: { padding: spacing.xl },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: spacing.lg, lineHeight: 34 },
  hostRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xxl },
  hostInfo: {},
  hostedBy: { fontSize: 10, fontWeight: '600', color: colors.textSecondary, letterSpacing: 1, marginBottom: 4 },
  hostNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  hostAvatar: { width: 32, height: 32, borderRadius: 16 },
  hostName: { fontSize: 16, fontWeight: '600', color: colors.text },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingScore: { fontSize: 16, fontWeight: '700', color: colors.text },
  reviewCount: { fontSize: 14, color: colors.textSecondary },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xxl },
  infoCard: { width: (width - spacing.xl * 2 - spacing.md) / 2, padding: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  infoLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 2, marginTop: spacing.sm },
  infoValue: { fontSize: 15, fontWeight: '700', color: colors.text },
  infoSubValue: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  attendeesSection: { marginBottom: spacing.xxl },
  attendeesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  viewAll: { fontSize: 14, fontWeight: '600', color: colors.primary },
  attendeesRow: { flexDirection: 'row', alignItems: 'center' },
  attendeeAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: colors.white },
  moreAttendees: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center', marginLeft: -10 },
  moreAttendeesText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  joiningText: { fontSize: 13, color: colors.textSecondary, marginLeft: spacing.md },
  planSection: { marginBottom: spacing.xxl },
  planText: { fontSize: 15, color: colors.textSecondary, lineHeight: 24, marginTop: spacing.md },
  trustNote: { flexDirection: 'row', backgroundColor: '#EFF6FF', padding: spacing.lg, borderRadius: borderRadius.md, gap: spacing.sm, marginBottom: spacing.xxxl },
  trustText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  trustBold: { fontWeight: '700', color: colors.text },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white },
  priceInfo: {},
  totalLabel: { fontSize: 12, color: colors.textSecondary },
  totalPrice: { fontSize: 22, fontWeight: '700', color: colors.text },
  perPerson: { fontSize: 12, color: colors.textSecondary },
  joinButton: { borderRadius: borderRadius.md, overflow: 'hidden' },
  joinGradient: { paddingHorizontal: spacing.xxl, paddingVertical: spacing.lg, borderRadius: borderRadius.md },
  joinText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});

export default PodDetailScreen;
