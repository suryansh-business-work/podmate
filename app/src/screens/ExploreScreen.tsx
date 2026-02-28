import React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../theme';

const EXPLORE_DATA = [
  {
    id: '1',
    title: 'Yoga Retreat',
    category: 'Outdoor',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    fee: 800,
  },
  {
    id: '2',
    title: 'Photography Walk',
    category: 'Learning',
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400',
    fee: 300,
  },
  {
    id: '3',
    title: 'Book Club Brunch',
    category: 'Social',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    fee: 600,
  },
  {
    id: '4',
    title: 'Pottery Workshop',
    category: 'Learning',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
    fee: 1500,
  },
  {
    id: '5',
    title: 'Sunset Kayaking',
    category: 'Outdoor',
    image: 'https://images.unsplash.com/photo-1472745433479-4556f22e32c2?w=400',
    fee: 900,
  },
  {
    id: '6',
    title: 'Jazz Night',
    category: 'Social',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400',
    fee: 700,
  },
];

const ExploreScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Explore</Text>
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search pods..."
          placeholderTextColor={colors.textTertiary}
        />
      </View>
      <FlatList
        data={EXPLORE_DATA}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.85}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.cardMeta}>
                <Text style={styles.cardCategory}>{item.category}</Text>
                <Text style={styles.cardFee}>₹{item.fee}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  grid: { paddingHorizontal: spacing.xl },
  row: { gap: spacing.md, marginBottom: spacing.md },
  card: {
    flex: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 120 },
  cardContent: { padding: spacing.md },
  cardTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  cardCategory: { fontSize: 12, color: colors.textSecondary },
  cardFee: { fontSize: 12, fontWeight: '700', color: colors.primary },
});

export default ExploreScreen;
