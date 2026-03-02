import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { FormikProps } from 'formik';
import { colors } from '../../theme';
import { GradientButton } from '../../components/GradientButton';
import MediaUploader, { MediaItem } from '../../components/MediaUploader';
import { PodFormValues, CATEGORIES } from './CreatePod.types';
import PayoutCard from './PayoutCard';
import LogisticsSection from './LogisticsSection';
import styles from './CreatePod.styles';

interface PodFormBodyProps {
  formik: FormikProps<PodFormValues>;
  dateTime: Date;
  showDatePicker: boolean;
  showTimePicker: boolean;
  mediaItems: MediaItem[];
  loading: boolean;
  onMediaChange: (items: MediaItem[]) => void;
  onShowDatePicker: () => void;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: Date | undefined) => void;
  onDismissDatePicker: () => void;
  onDismissTimePicker: () => void;
}

const PodFormBody: React.FC<PodFormBodyProps> = ({
  formik,
  dateTime,
  showDatePicker,
  showTimePicker,
  mediaItems,
  loading,
  onMediaChange,
  onShowDatePicker,
  onDateChange,
  onTimeChange,
  onDismissDatePicker,
  onDismissTimePicker,
}) => {
  const {
    handleChange, handleBlur, handleSubmit, values,
    errors, touched, isValid, dirty, setFieldValue,
  } = formik;

  const feeNum = parseInt(values.fee, 10) || 0;

  return (
    <>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Let&apos;s set up your Pod.</Text>
        <Text style={styles.subtitle}>Create a space for your micro-community event.</Text>

        <Text style={styles.inputLabel}>MEDIA</Text>
        <MediaUploader
          mediaItems={mediaItems}
          onMediaChange={onMediaChange}
          folder="/pods"
          maxItems={10}
        />

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
              <Text style={[styles.categoryChipText, values.category === cat && styles.categoryChipTextActive]}>
                {cat}
              </Text>
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

        <LogisticsSection
          fee={values.fee}
          maxSeats={values.maxSeats}
          dateTime={dateTime}
          showDatePicker={showDatePicker}
          showTimePicker={showTimePicker}
          onFeeChange={handleChange('fee')}
          onMaxSeatsChange={(val) => setFieldValue('maxSeats', val)}
          onShowDatePicker={onShowDatePicker}
          onDateChange={onDateChange}
          onTimeChange={onTimeChange}
          onDismissDatePicker={onDismissDatePicker}
          onDismissTimePicker={onDismissTimePicker}
        />

        <PayoutCard feePerPerson={feeNum} maxSeats={values.maxSeats} />
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
};

export default PodFormBody;
