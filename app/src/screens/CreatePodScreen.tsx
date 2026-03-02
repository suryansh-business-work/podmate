import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { colors, spacing, borderRadius } from '../theme';
import { GradientButton } from '../components/GradientButton';
import ContactPicker from '../components/ContactPicker';
import { CREATE_POD } from '../graphql/mutations';
import { GET_PODS } from '../graphql/queries';

interface CreatePodScreenProps {
  onClose: () => void;
}

interface PodFormValues {
  title: string;
  description: string;
  fee: string;
  maxSeats: number;
  location: string;
  locationDetail: string;
  category: string;
}

const CATEGORIES = ['Social', 'Learning', 'Outdoor'];

const podSchema = Yup.object().shape({
  title: Yup.string().min(3, 'Title must be at least 3 characters').required('Title is required'),
  description: Yup.string().min(10, 'Describe your pod in at least 10 characters').required('Description is required'),
  fee: Yup.number().typeError('Must be a number').min(0, 'Fee cannot be negative').required('Fee is required'),
  location: Yup.string().required('Location is required'),
  locationDetail: Yup.string(),
  category: Yup.string().oneOf(CATEGORIES).required('Category is required'),
});

const CreatePodScreen: React.FC<CreatePodScreenProps> = ({ onClose }) => {
  const [showInvite, setShowInvite] = useState(false);
  const [createdPodId, setCreatedPodId] = useState<string>('');
  const [createdTitle, setCreatedTitle] = useState('');
  const [dateTime] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

  const [createPod, { loading }] = useMutation(CREATE_POD, {
    refetchQueries: [{ query: GET_PODS, variables: { page: 1, limit: 20 } }],
  });

  const initialValues: PodFormValues = {
    title: '',
    description: '',
    fee: '1200',
    maxSeats: 10,
    location: '',
    locationDetail: '',
    category: 'Social',
  };

  const handleCreate = async (values: PodFormValues) => {
    const feeNum = parseInt(values.fee, 10) || 0;
    try {
      const result = await createPod({
        variables: {
          input: {
            title: values.title.trim(),
            description: values.description.trim(),
            category: values.category,
            feePerPerson: feeNum,
            maxSeats: values.maxSeats,
            dateTime,
            location: values.location.trim(),
            locationDetail: values.locationDetail.trim() || 'TBD',
          },
        },
      });
      const newPodId = result?.data?.createPod?.id;
      if (newPodId) {
        setCreatedPodId(newPodId);
        setCreatedTitle(values.title);
        Alert.alert('Pod Created!', 'Would you like to invite friends?', [
          { text: 'Skip', onPress: onClose },
          { text: 'Invite Friends', onPress: () => setShowInvite(true) },
        ]);
      } else {
        Alert.alert('Pod Created!', 'Your pod has been created successfully.', [{ text: 'OK', onPress: onClose }]);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create pod';
      Alert.alert('Error', errorMessage);
    }
  };

  if (showInvite && createdPodId) {
    return <ContactPicker podId={createdPodId} podTitle={createdTitle} onDone={onClose} onSkip={onClose} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Host a Pod</Text>
        <View style={{ width: 24 }} />
      </View>

      <Formik initialValues={initialValues} validationSchema={podSchema} onSubmit={handleCreate}>
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid, dirty, setFieldValue }) => {
          const feeNum = parseInt(values.fee, 10) || 0;
          const grossRevenue = feeNum * values.maxSeats;
          const platformFee = grossRevenue * 0.05;
          const netRevenue = grossRevenue - platformFee;

          return (
            <>
              <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Let's set up your Pod.</Text>
                <Text style={styles.subtitle}>Create a space for your micro-community event.</Text>

                <Text style={styles.inputLabel}>POD TITLE</Text>
                <TextInput
                  style={[styles.textInput, touched.title && errors.title ? styles.inputError : undefined]}
                  placeholder="Sushi Masterclass"
                  placeholderTextColor={colors.textTertiary}
                  value={values.title}
                  onChangeText={handleChange('title')}
                  onBlur={handleBlur('title')}
                />
                {touched.title && errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

                <Text style={styles.inputLabel}>THE PLAN</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea, touched.description && errors.description ? styles.inputError : undefined]}
                  placeholder="Describe what you'll be doing..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={values.description}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                />
                {touched.description && errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

                <Text style={styles.inputLabel}>CATEGORY</Text>
                <View style={styles.categoryRow}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryChip, values.category === cat && styles.categoryChipActive]}
                      onPress={() => setFieldValue('category', cat)}
                    >
                      <Text style={[styles.categoryChipText, values.category === cat && styles.categoryChipTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>LOCATION</Text>
                <TextInput
                  style={[styles.textInput, touched.location && errors.location ? styles.inputError : undefined]}
                  placeholder="Venue name"
                  placeholderTextColor={colors.textTertiary}
                  value={values.location}
                  onChangeText={handleChange('location')}
                  onBlur={handleBlur('location')}
                />
                {touched.location && errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

                <Text style={styles.inputLabel}>LOCATION DETAIL</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Area, City"
                  placeholderTextColor={colors.textTertiary}
                  value={values.locationDetail}
                  onChangeText={handleChange('locationDetail')}
                />

                <Text style={styles.sectionTitle}>Logistics</Text>
                <View style={styles.logisticsRow}>
                  <View style={styles.logisticsItem}>
                    <Text style={styles.inputLabel}>FEE PER PERSON</Text>
                    <View style={styles.feeInput}>
                      <Text style={styles.currencySymbol}>₹</Text>
                      <TextInput style={styles.feeTextInput} keyboardType="number-pad" value={values.fee} onChangeText={handleChange('fee')} />
                    </View>
                  </View>
                  <View style={styles.logisticsItem}>
                    <Text style={styles.inputLabel}>MAX SEATS</Text>
                    <View style={styles.counterRow}>
                      <TouchableOpacity style={styles.counterButton} onPress={() => setFieldValue('maxSeats', Math.max(1, values.maxSeats - 1))}>
                        <Text style={styles.counterButtonText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.counterValue}>{values.maxSeats}</Text>
                      <TouchableOpacity style={styles.counterButton} onPress={() => setFieldValue('maxSeats', values.maxSeats + 1)}>
                        <Text style={styles.counterButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <Text style={styles.inputLabel}>WHEN</Text>
                <TouchableOpacity style={styles.datePickerRow}>
                  <MaterialIcons name="event" size={20} color={colors.textSecondary} />
                  <Text style={styles.dateText}>Select Date & Time</Text>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
                </TouchableOpacity>

                <View style={styles.payoutCard}>
                  <View style={styles.payoutHeader}>
                    <MaterialIcons name="attach-money" size={20} color={colors.primary} />
                    <Text style={styles.payoutTitle}>Potential Payout</Text>
                  </View>
                  <View style={styles.payoutRow}>
                    <Text style={styles.payoutLabel}>Gross (₹{feeNum.toLocaleString()} × {values.maxSeats} seats)</Text>
                    <Text style={styles.payoutValue}>₹{grossRevenue.toLocaleString()}</Text>
                  </View>
                  <View style={styles.payoutRow}>
                    <Text style={styles.payoutLabel}>Platform Fee (5%)</Text>
                    <Text style={[styles.payoutValue, styles.payoutFee]}>- ₹{platformFee.toLocaleString()}</Text>
                  </View>
                  <View style={styles.payoutDivider} />
                  <View style={styles.payoutRow}>
                    <Text style={styles.payoutNetLabel}>You Receive</Text>
                    <Text style={styles.payoutNetValue}>₹{netRevenue.toLocaleString()}</Text>
                  </View>
                  <View style={styles.escrowNote}>
                    <MaterialIcons name="lock" size={14} color={colors.textSecondary} />
                    <Text style={styles.escrowText}>Funds held securely in escrow until event completion.</Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.bottom}>
                <GradientButton
                  title={loading ? 'Creating...' : 'Create Pod →'}
                  onPress={() => handleSubmit()}
                  disabled={!isValid || !dirty || loading}
                />
                <View style={styles.verifiedRow}>
                  <MaterialIcons name="check" size={14} color={colors.textSecondary} />
                  <Text style={styles.verifiedText}>Verified Host Status Required</Text>
                </View>
              </View>
            </>
          );
        }}
      </Formik>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  headerTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  scrollView: { flex: 1, paddingHorizontal: spacing.xl },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: spacing.xxl },
  inputLabel: { fontSize: 12, fontWeight: '600', color: colors.text, letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.lg },
  textInput: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.lg, fontSize: 16, color: colors.text, backgroundColor: colors.white },
  textArea: { minHeight: 100 },
  inputError: { borderColor: colors.error },
  errorText: { fontSize: 12, color: colors.error, marginTop: spacing.xs, marginLeft: spacing.xs },
  categoryRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  categoryChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  categoryChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  categoryChipText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  categoryChipTextActive: { color: colors.primary, fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: spacing.xxl, marginBottom: spacing.sm },
  logisticsRow: { flexDirection: 'row', gap: spacing.lg },
  logisticsItem: { flex: 1 },
  feeInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  currencySymbol: { fontSize: 16, color: colors.textSecondary, marginRight: spacing.xs },
  feeTextInput: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text },
  counterRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, overflow: 'hidden' },
  counterButton: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surface },
  counterButtonText: { fontSize: 18, color: colors.textSecondary },
  counterValue: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.text },
  datePickerRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.lg, gap: spacing.md },
  dateText: { flex: 1, fontSize: 15, color: colors.textSecondary },
  payoutCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.xl, marginTop: spacing.xxl, marginBottom: spacing.xxxl },
  payoutHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  payoutTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  payoutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  payoutLabel: { fontSize: 14, color: colors.textSecondary },
  payoutValue: { fontSize: 14, color: colors.text },
  payoutFee: { color: colors.error },
  payoutDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  payoutNetLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  payoutNetValue: { fontSize: 24, fontWeight: '700', color: colors.primary },
  escrowNote: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  escrowText: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  bottom: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, paddingTop: spacing.md },
  verifiedRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md },
  verifiedText: { fontSize: 13, color: colors.textSecondary },
});

export default CreatePodScreen;
