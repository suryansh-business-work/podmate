import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../theme';
import { GradientButton } from '../components/GradientButton';

interface RegisterPlaceScreenProps {
  onClose: () => void;
}

const PLACE_CATEGORIES = ['Restaurant', 'Cafe', 'Lounge', 'Outdoor Venue', 'Studio', 'Co-working'];

const RegisterPlaceScreen: React.FC<RegisterPlaceScreenProps> = ({ onClose }) => {
  const [placeName, setPlaceName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [capacity, setCapacity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const handleSubmit = () => {
    if (!placeName || !address || !city || !capacity || !selectedCategory) {
      Alert.alert('Missing Fields', 'Please fill all required fields.');
      return;
    }
    Alert.alert(
      'Registration Submitted',
      'Your place registration has been submitted for review. You will be notified once approved.',
      [{ text: 'OK', onPress: onClose }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Place</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>List your venue</Text>
        <Text style={styles.subtitle}>
          Register your place to host pods and earn from your space.
        </Text>

        {/* Place Name */}
        <Text style={styles.inputLabel}>PLACE NAME *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. The Cozy Kitchen"
          placeholderTextColor={colors.textTertiary}
          value={placeName}
          onChangeText={setPlaceName}
        />

        {/* Category */}
        <Text style={styles.inputLabel}>CATEGORY *</Text>
        <View style={styles.categoryGrid}>
          {PLACE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={styles.inputLabel}>DESCRIPTION</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Describe your place, ambiance, facilities..."
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        {/* Address */}
        <Text style={styles.inputLabel}>ADDRESS *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Full street address"
          placeholderTextColor={colors.textTertiary}
          value={address}
          onChangeText={setAddress}
        />

        {/* City */}
        <Text style={styles.inputLabel}>CITY *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="City name"
          placeholderTextColor={colors.textTertiary}
          value={city}
          onChangeText={setCity}
        />

        {/* Capacity */}
        <Text style={styles.inputLabel}>MAX CAPACITY *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. 50"
          placeholderTextColor={colors.textTertiary}
          keyboardType="number-pad"
          value={capacity}
          onChangeText={setCapacity}
        />

        {/* Contact */}
        <Text style={styles.inputLabel}>CONTACT NUMBER</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Phone number for venue inquiries"
          placeholderTextColor={colors.textTertiary}
          keyboardType="phone-pad"
          value={contactNumber}
          onChangeText={setContactNumber}
        />

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Once registered, your place will be reviewed by our team. Approved venues will be
            upgraded to Place Owner status, enabling pod hosting.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottom}>
        <GradientButton
          title="Submit Registration"
          onPress={handleSubmit}
          disabled={!placeName || !address || !city || !capacity || !selectedCategory}
        />
      </View>
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
    paddingVertical: spacing.md,
  },
  closeIcon: {
    fontSize: 22,
    color: colors.text,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  textArea: {
    minHeight: 100,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoryChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  categoryChipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginTop: spacing.xxl,
    marginBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
});

export default RegisterPlaceScreen;
