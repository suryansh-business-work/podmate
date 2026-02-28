import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../theme';
import { CategoryChip } from '../components/CategoryChip';
import { EventCard } from '../components/EventCard';

const CATEGORIES = ['All', 'Social', 'Learning', 'Outdoor'];

// Seed data matching server store
const MOCK_PODS = [
  {
    id: 'pod-1',
    title: 'Omakase & Sake Night',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
    feePerPerson: 1200,
    maxSeats: 10,
    currentSeats: 8,
    dateTime: '2026-08-12T19:00:00.000Z',
    rating: 4.9,
    status: 'PENDING',
    category: 'Social',
    hostName: 'Sarah L.',
    hostAvatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 'pod-2',
    title: 'Startup Networking Hike',
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    feePerPerson: 500,
    maxSeats: 20,
    currentSeats: 15,
    dateTime: '2026-08-13T06:00:00.000Z',
    rating: 5.0,
    status: 'CONFIRMED',
    category: 'Outdoor',
    hostName: 'Alex D.',
    hostAvatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: 'pod-3',
    title: 'Premium Wine Tasting Evening',
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800',
    feePerPerson: 2500,
    maxSeats: 12,
    currentSeats: 0,
    dateTime: '2026-08-18T18:30:00.000Z',
    rating: 0,
    status: 'NEW',
    category: 'Social',
    hostName: 'Vineet K.',
    hostAvatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: 'pod-4',
    title: 'Tokyo-Style Sushi Masterclass',
    imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800',
    feePerPerson: 1200,
    maxSeats: 10,
    currentSeats: 8,
    dateTime: '2026-08-12T19:00:00.000Z',
    rating: 4.9,
    status: 'PENDING',
    category: 'Learning',
    hostName: 'Chef Kenji',
    hostAvatar: 'https://i.pravatar.cc/150?img=4',
  },
];

interface HomeScreenProps {
  onPodPress: (id: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onPodPress }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPods = MOCK_PODS.filter((pod) => {
    const matchesCategory = selectedCategory === 'All' || pod.category === selectedCategory;
    const matchesSearch = pod.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={[colors.primaryLight, colors.primary]}
            style={styles.headerLogo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.headerLogoIcon}>👥</Text>
          </LinearGradient>
          <Text style={styles.headerTitle}>PartyWings</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Find hiking, dining, tech..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
            />
          ))}
        </ScrollView>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular near you</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        {/* Event Cards */}
        {filteredPods.map((pod) => (
          <EventCard key={pod.id} {...pod} onPress={onPodPress} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogoIcon: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  categoriesContainer: {
    marginBottom: spacing.lg,
  },
  categoriesContent: {
    paddingRight: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: 0.5,
  },
});

export default HomeScreen;
