import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, borderRadius } from '../theme';
import { GET_POLICIES } from '../graphql/queries';
import { GradientButton } from '../components/GradientButton';

interface RegisterPlaceScreenProps {
  onClose: () => void;
}

interface VenueFormValues {
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  capacity: string;
}

interface PolicyItem {
  id: string;
  type: string;
  title: string;
  content: string;
  isActive: boolean;
}

const STEPS = ['Venue Details', 'Documents', 'Policies'];

const venueSchema = Yup.object().shape({
  name: Yup.string().min(3, 'Min 3 characters').required('Venue name required'),
  category: Yup.string().required('Category required'),
  description: Yup.string().min(10, 'Min 10 characters').required('Description required'),
  address: Yup.string().min(5, 'Min 5 characters').required('Address required'),
  city: Yup.string().required('City required'),
  capacity: Yup.number().typeError('Must be a number').min(1, 'Min 1').max(10000, 'Max 10000').required('Capacity required'),
});

const CATEGORIES = ['Bar', 'Club', 'Lounge', 'Restaurant', 'Rooftop', 'Café', 'Pub'];

const RegisterPlaceScreen: React.FC<RegisterPlaceScreenProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [formValues, setFormValues] = useState<VenueFormValues>({
    name: '', category: '', description: '', address: '', city: '', capacity: '',
  });
  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [hasScrolledPolicies, setHasScrolledPolicies] = useState(false);

  const { data: policiesData, loading: policiesLoading } = useQuery(GET_POLICIES, {
    variables: { type: 'VENUE' },
    fetchPolicy: 'cache-and-network',
  });

  const policies: PolicyItem[] = (policiesData?.policies ?? []).filter(
    (p: PolicyItem) => p.isActive,
  );

  const handleStepOneSubmit = (values: VenueFormValues) => {
    setFormValues(values);
    setStep(1);
  };

  const handleStepTwoNext = () => {
    setStep(2);
  };

  const handleFinalSubmit = () => {
    Alert.alert(
      'Registration Submitted',
      `Your venue "${formValues.name}" has been submitted for review. We'll notify you once approved.`,
      [{ text: 'OK', onPress: onClose }],
    );
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
    else onClose();
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((label, i) => (
        <View key={label} style={styles.stepItem}>
          <View style={[styles.stepCircle, i <= step && styles.stepCircleActive]}>
            {i < step ? (
              <MaterialIcons name="check" size={14} color={colors.white} />
            ) : (
              <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, i <= step && styles.stepLabelActive]}>{label}</Text>
          {i < STEPS.length - 1 && (
            <View style={[styles.stepLine, i < step && styles.stepLineActive]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStepOne = () => (
    <Formik
      initialValues={formValues}
      validationSchema={venueSchema}
      onSubmit={handleStepOneSubmit}
      enableReinitialize
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <ScrollView style={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <InputField label="Venue Name" icon="store" value={values.name}
            onChangeText={handleChange('name')} onBlur={handleBlur('name')}
            error={touched.name ? errors.name : undefined} placeholder="e.g. Sky Lounge" />

          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat}
                style={[styles.categoryBtn, values.category === cat && styles.categoryBtnActive]}
                onPress={() => handleChange('category')(cat)}
              >
                <Text style={[styles.categoryBtnText, values.category === cat && styles.categoryBtnTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {touched.category && errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}

          <InputField label="Description" icon="description" value={values.description}
            onChangeText={handleChange('description')} onBlur={handleBlur('description')}
            error={touched.description ? errors.description : undefined}
            placeholder="Describe your venue..." multiline numberOfLines={3} />

          <Text style={styles.sectionTitle}>Location</Text>

          <InputField label="Address" icon="place" value={values.address}
            onChangeText={handleChange('address')} onBlur={handleBlur('address')}
            error={touched.address ? errors.address : undefined} placeholder="Full address" />

          <InputField label="City" icon="location-city" value={values.city}
            onChangeText={handleChange('city')} onBlur={handleBlur('city')}
            error={touched.city ? errors.city : undefined} placeholder="City" />

          <InputField label="Max Capacity" icon="people" value={values.capacity}
            onChangeText={handleChange('capacity')} onBlur={handleBlur('capacity')}
            error={touched.capacity ? errors.capacity : undefined}
            placeholder="e.g. 200" keyboardType="numeric" />

          <View style={styles.btnContainer}>
            <GradientButton title="Continue" onPress={handleSubmit as () => void} />
          </View>
        </ScrollView>
      )}
    </Formik>
  );

  const renderStepTwo = () => (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Upload Documents</Text>
      <Text style={styles.helperText}>
        Upload your business license, food/liquor permits, and venue photos. This helps us verify your venue faster.
      </Text>

      <TouchableOpacity style={styles.uploadBox} activeOpacity={0.7}>
        <MaterialIcons name="cloud-upload" size={36} color={colors.primary} />
        <Text style={styles.uploadTitle}>Business License</Text>
        <Text style={styles.uploadSubtext}>Tap to upload (PDF, JPG, PNG)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.uploadBox} activeOpacity={0.7}>
        <MaterialIcons name="verified-user" size={36} color={colors.primary} />
        <Text style={styles.uploadTitle}>Permits &amp; Licenses</Text>
        <Text style={styles.uploadSubtext}>Food / Liquor / Music permits</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.uploadBox} activeOpacity={0.7}>
        <MaterialIcons name="photo-library" size={36} color={colors.primary} />
        <Text style={styles.uploadTitle}>Venue Photos</Text>
        <Text style={styles.uploadSubtext}>At least 3 photos of your venue</Text>
      </TouchableOpacity>

      <View style={styles.btnContainer}>
        <GradientButton title="Continue" onPress={handleStepTwoNext} />
      </View>
    </ScrollView>
  );

  const renderStepThree = () => (
    <ScrollView
      style={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
        if (isCloseToBottom) setHasScrolledPolicies(true);
      }}
      scrollEventThrottle={400}
    >
      <Text style={styles.sectionTitle}>Venue Policies</Text>
      <Text style={styles.helperText}>
        Please read and accept all venue policies before registering.
      </Text>

      {policiesLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : policies.length === 0 ? (
        <View style={styles.emptyPolicies}>
          <MaterialIcons name="policy" size={40} color={colors.textTertiary} />
          <Text style={styles.emptyPoliciesText}>No policies available at this time.</Text>
        </View>
      ) : (
        policies.map((policy) => (
          <View key={policy.id} style={styles.policyCard}>
            <View style={styles.policyHeader}>
              <MaterialIcons name="article" size={18} color={colors.primary} />
              <Text style={styles.policyTitle}>{policy.title}</Text>
            </View>
            <Text style={styles.policyContent}>{policy.content}</Text>
          </View>
        ))
      )}

      {!policiesLoading && policies.length > 0 && (
        <>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => hasScrolledPolicies && setPoliciesAccepted(!policiesAccepted)}
            activeOpacity={hasScrolledPolicies ? 0.7 : 1}
          >
            <View style={[styles.checkbox, policiesAccepted && styles.checkboxActive]}>
              {policiesAccepted && <MaterialIcons name="check" size={16} color={colors.white} />}
            </View>
            <Text style={[styles.checkboxLabel, !hasScrolledPolicies && styles.checkboxDisabled]}>
              I have read and accept all venue policies
            </Text>
          </TouchableOpacity>
          {!hasScrolledPolicies && (
            <Text style={styles.scrollHint}>
              <MaterialIcons name="info-outline" size={13} color={colors.textTertiary} />
              {' '}Scroll to the bottom to enable acceptance
            </Text>
          )}
        </>
      )}

      <View style={styles.btnContainer}>
        <GradientButton
          title="Submit Registration"
          onPress={handleFinalSubmit}
          disabled={!policiesAccepted && policies.length > 0}
        />
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.headerBtn}>
          <MaterialIcons name={step === 0 ? 'close' : 'arrow-back'} size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Venue</Text>
        <View style={styles.headerBtn} />
      </View>

      {renderStepIndicator()}

      {step === 0 && renderStepOne()}
      {step === 1 && renderStepTwo()}
      {step === 2 && renderStepThree()}
    </SafeAreaView>
  );
};

interface InputFieldProps {
  label: string;
  icon: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: (e: unknown) => void;
  error?: string;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric';
}

const InputField: React.FC<InputFieldProps> = ({
  label, icon, value, onChangeText, onBlur, error, placeholder, multiline, numberOfLines, keyboardType,
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
      <MaterialIcons name={icon} size={18} color={colors.textTertiary} style={{ marginRight: spacing.sm }} />
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur as () => void}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
      />
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl, paddingBottom: spacing.lg },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' },
  stepCircleActive: { backgroundColor: colors.primary },
  stepNum: { fontSize: 12, fontWeight: '600', color: colors.textTertiary },
  stepNumActive: { color: colors.white },
  stepLabel: { fontSize: 11, color: colors.textTertiary, marginLeft: 4, fontWeight: '500' },
  stepLabelActive: { color: colors.primary },
  stepLine: { width: 24, height: 2, backgroundColor: colors.surfaceVariant, marginHorizontal: 6 },
  stepLineActive: { backgroundColor: colors.primary },
  scrollContent: { flex: 1, paddingHorizontal: spacing.xl },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  helperText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.lg },
  fieldContainer: { marginBottom: spacing.lg },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.sm, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border },
  inputRowError: { borderColor: colors.error },
  input: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 12 },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  errorText: { fontSize: 12, color: colors.error, marginTop: 4 },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  categoryBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  categoryBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryBtnText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  categoryBtnTextActive: { color: colors.white },
  uploadBox: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', borderRadius: borderRadius.md, paddingVertical: spacing.xxl, marginBottom: spacing.lg },
  uploadTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginTop: spacing.sm },
  uploadSubtext: { fontSize: 13, color: colors.textTertiary, marginTop: 2 },
  policyCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg, marginBottom: spacing.md },
  policyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  policyTitle: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1 },
  policyContent: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  emptyPolicies: { alignItems: 'center', paddingVertical: spacing.xxxl },
  emptyPoliciesText: { fontSize: 14, color: colors.textTertiary, marginTop: spacing.md },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, gap: spacing.md },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxLabel: { fontSize: 14, color: colors.text, flex: 1 },
  checkboxDisabled: { color: colors.textTertiary },
  scrollHint: { fontSize: 12, color: colors.textTertiary, marginTop: spacing.xs, marginLeft: 36 },
  btnContainer: { paddingVertical: spacing.xxl },
});

export default RegisterPlaceScreen;
