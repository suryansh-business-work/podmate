import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';
import { GET_HOST_ANALYTICS, GET_VENUE_ANALYTICS } from '../../graphql/queries';
import AnalyticsCard from './components/AnalyticsCard';
import { createStyles } from './Dashboard.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';
import type { DashboardScreenProps, HostAnalyticsData, VenueAnalyticsData } from './Dashboard.types';

const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onBack,
  onProfilePress,
  onNotificationPress,
  onRegisterVenue,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();

  const {
    data: hostData,
    loading: hostLoading,
    error: hostError,
    refetch: refetchHost,
  } = useQuery<HostAnalyticsData>(GET_HOST_ANALYTICS, {
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: venueData,
    loading: venueLoading,
    error: venueError,
    refetch: refetchVenue,
  } = useQuery<VenueAnalyticsData>(GET_VENUE_ANALYTICS, {
    fetchPolicy: 'cache-and-network',
  });

  const ha = hostData?.hostAnalytics;
  const va = venueData?.venueAnalytics;

  const handleRefresh = async () => {
    await Promise.all([refetchHost(), refetchVenue()]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
            <MaterialIcons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={onNotificationPress}
            activeOpacity={0.7}
          >
            <MaterialIcons name="notifications-none" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={onProfilePress}
            activeOpacity={0.7}
          >
            <MaterialIcons name="person" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Host Analytics */}
        <Text style={styles.sectionTitle}>Host Analytics</Text>
        {hostError && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="cloud-off" size={32} color={colors.error} />
            <Text style={styles.errorText}>{hostError.message}</Text>
          </View>
        )}
        <AnalyticsCard
          icon="groups"
          iconColor="#F50247"
          title="Number of Pod Hosts"
          value={ha?.numberOfPodHosts ?? 0}
          hint="Total number of users hosting pods on the platform"
          loading={hostLoading && !ha}
        />
        <AnalyticsCard
          icon="cancel"
          iconColor="#EF4444"
          title="Cancelled Pods"
          value={ha?.cancelledPods ?? 0}
          hint="Pods that were cancelled by the host or system"
          loading={hostLoading && !ha}
        />
        <AnalyticsCard
          icon="account-balance-wallet"
          iconColor="#10B981"
          title="Total Earning"
          value={ha ? `₹${ha.totalEarning.toLocaleString()}` : '₹0'}
          hint="Cumulative earnings from all hosted pods"
          loading={hostLoading && !ha}
        />
        <AnalyticsCard
          icon="trending-up"
          iconColor="#2563EB"
          title="Per Pod Avg. Earning"
          value={ha ? `₹${ha.perPodAverageEarning.toLocaleString()}` : '₹0'}
          hint="Average revenue generated per pod"
          loading={hostLoading && !ha}
        />
        <AnalyticsCard
          icon="star"
          iconColor="#F59E0B"
          title="Rating"
          value={ha?.rating?.toFixed(1) ?? '0.0'}
          hint="Average rating from pod attendees"
          loading={hostLoading && !ha}
        />
        <AnalyticsCard
          icon="favorite"
          iconColor="#EC4899"
          title="Host Profile Health"
          value={ha ? `${ha.hostProfileHealth}%` : '0%'}
          hint="Profile completeness and engagement score"
          loading={hostLoading && !ha}
        />

        {/* Register A Venue */}
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={onRegisterVenue}
          activeOpacity={0.85}
        >
          <MaterialIcons name="add-business" size={20} color={colors.white} />
          <Text style={styles.registerBtnText}>Register A Venue</Text>
        </TouchableOpacity>

        {/* Venue Analytics */}
        <Text style={styles.sectionTitle}>Venue Analytics</Text>
        {venueError && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="cloud-off" size={32} color={colors.error} />
            <Text style={styles.errorText}>{venueError.message}</Text>
          </View>
        )}
        <AnalyticsCard
          icon="store"
          iconColor="#10B981"
          title="Total Registered Venues"
          value={va?.totalRegisteredVenues ?? 0}
          hint="Number of venues registered under your account"
          loading={venueLoading && !va}
        />
        <AnalyticsCard
          icon="event"
          iconColor="#9333EA"
          title="Total Upcoming Party Requests"
          value={va?.totalUpcomingPartyRequests ?? 0}
          hint="Pending party booking requests for your venues"
          loading={venueLoading && !va}
        />
        <AnalyticsCard
          icon="check-circle"
          iconColor="#2563EB"
          title="Accepted Venue Party Requests"
          value={va?.acceptedVenuePartyRequests ?? 0}
          hint="Party requests you have accepted"
          loading={venueLoading && !va}
        />
        <AnalyticsCard
          icon="block"
          iconColor="#EF4444"
          title="Cancelled Venues"
          value={va?.cancelledVenues ?? 0}
          hint="Venues that were cancelled or deactivated"
          loading={venueLoading && !va}
        />
        <AnalyticsCard
          icon="star-half"
          iconColor="#F59E0B"
          title="Venue Rating"
          value={va?.venueRating?.toFixed(1) ?? '0.0'}
          hint="Average rating across all your venues"
          loading={venueLoading && !va}
        />
        <AnalyticsCard
          icon="payments"
          iconColor="#14B8A6"
          title="Total Earnings"
          value={va ? `₹${va.totalEarnings.toLocaleString()}` : '₹0'}
          hint="Total revenue from all venue bookings"
          loading={venueLoading && !va}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;
