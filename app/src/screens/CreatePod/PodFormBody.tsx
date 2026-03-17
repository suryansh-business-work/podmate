import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FormikProps } from 'formik';
import { useQuery } from '@apollo/client';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { GradientButton } from '../../components/GradientButton';
import MediaUploader, { MediaItem } from '../../components/MediaUploader';
import {
  GET_APPROVED_PLACES,
  GET_APP_CONFIG,
  GET_ACTIVE_CATEGORIES,
  GET_ACTIVE_CITIES,
} from '../../graphql/queries';
import { useLocation } from '../../hooks/useLocation';
import { useEffectiveFee } from '../../hooks/useEffectiveFee';
import { PodFormValues, ApprovedPlace, ActiveCategory } from './CreatePod.types';
import type { RecurrenceOption } from './CreatePod.types';
import PayoutCard from './PayoutCard';
import LogisticsSection from './LogisticsSection';
import { createStyles } from './CreatePod.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface PodFormBodyProps {
  formik: FormikProps<PodFormValues>;
  dateTime: Date;
  showDatePicker: boolean;
  showTimePicker: boolean;
  mediaItems: MediaItem[];
  loading: boolean;
  startDate: Date;
  endDate: Date;
  showStartDatePicker: boolean;
  showEndDatePicker: boolean;
  onMediaChange: (items: MediaItem[]) => void;
  onShowDatePicker: () => void;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: Date | undefined) => void;
  onDismissDatePicker: () => void;
  onDismissTimePicker: () => void;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onShowStartDatePicker: () => void;
  onShowEndDatePicker: () => void;
  onDismissStartDatePicker: () => void;
  onDismissEndDatePicker: () => void;
}

const RECURRENCE_OPTIONS: { label: string; value: RecurrenceOption }[] = [
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
];

function calculateOccurrenceCount(start: Date, end: Date, freq: RecurrenceOption): number {
  if (end <= start) return 0;
  const diffMs = end.getTime() - start.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  switch (freq) {
    case 'DAILY':
      return Math.floor(diffDays) + 1;
    case 'WEEKLY':
      return Math.floor(diffDays / 7) + 1;
    case 'MONTHLY': {
      const months =
        (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      return Math.max(months, 1) + 1;
    }
    default:
      return 0;
  }
}

const PodFormBody: React.FC<PodFormBodyProps> = ({
  formik,
  dateTime,
  showDatePicker,
  showTimePicker,
  mediaItems,
  loading,
  startDate,
  endDate,
  showStartDatePicker,
  showEndDatePicker,
  onMediaChange,
  onShowDatePicker,
  onDateChange,
  onTimeChange,
  onDismissDatePicker,
  onDismissTimePicker,
  onStartDateChange,
  onEndDateChange,
  onShowStartDatePicker,
  onShowEndDatePicker,
  onDismissStartDatePicker,
  onDismissEndDatePicker,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const {
    handleChange,
    handleBlur,
    handleSubmit,
    values,
    errors,
    touched,
    isValid,
    dirty,
    setFieldValue,
  } = formik;

  const [placeModalVisible, setPlaceModalVisible] = useState(false);
  const [placeSearch, setPlaceSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cityPickerVisible, setCityPickerVisible] = useState(false);

  const { data: citiesData } = useQuery<{
    activeCities: { id: string; name: string }[];
  }>(GET_ACTIVE_CITIES, { fetchPolicy: 'cache-and-network' });
  const activeCities = citiesData?.activeCities ?? [];

  const { data: placesData, loading: placesLoading } = useQuery<{
    approvedPlaces: ApprovedPlace[];
  }>(GET_APPROVED_PLACES, {
    variables: { search: placeSearch || undefined, city: selectedCity || undefined },
    fetchPolicy: 'cache-and-network',
  });

  const { data: categoriesData } = useQuery<{ activeCategories: ActiveCategory[] }>(
    GET_ACTIVE_CATEGORIES,
    { fetchPolicy: 'cache-and-network' },
  );
  const dynamicCategories = categoriesData?.activeCategories ?? [];

  const { feePercent: effectiveFeePercent, source: feeSource } = useEffectiveFee({
    entityType: 'USER',
  });

  const { data: configData } = useQuery(GET_APP_CONFIG, {
    variables: { keys: ['google_maps_api_key'] },
    fetchPolicy: 'cache-first',
  });

  const googleMapsApiKey: string =
    (configData?.appConfig as Array<{ key: string; value: string }> | undefined)?.find(
      (c) => c.key === 'google_maps_api_key',
    )?.value ?? '';

  const approvedPlaces = placesData?.approvedPlaces ?? [];

  const { location: _gpsLocation, loading: gpsLoading, requestLocation } = useLocation();

  const handleUseMyLocation = useCallback(async () => {
    const loc = await requestLocation();
    if (loc) {
      setFieldValue('latitude', loc.latitude);
      setFieldValue('longitude', loc.longitude);
      if (loc.address && !values.location) {
        setFieldValue('location', loc.address);
      }
    }
  }, [requestLocation, setFieldValue, values.location]);

  const handleSelectPlace = useCallback(
    (place: ApprovedPlace) => {
      setFieldValue('placeId', place.id);
      setFieldValue('location', place.name);
      setFieldValue('locationDetail', `${place.address}, ${place.city}`);
      setPlaceModalVisible(false);
      setPlaceSearch('');
    },
    [setFieldValue],
  );

  const feeNum = parseInt(values.fee, 10) || 0;

  return (
    <>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      >
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
          style={[
            styles.textInput,
            styles.textArea,
            touched.description && errors.description ? styles.inputError : undefined,
          ]}
          placeholder="Describe what you'll be doing..."
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={values.description}
          onChangeText={handleChange('description')}
          onBlur={handleBlur('description')}
        />
        {touched.description && errors.description && (
          <Text style={styles.errorText}>{errors.description}</Text>
        )}

        <Text style={styles.inputLabel}>CATEGORY</Text>
        <View style={styles.categoryRow}>
          {dynamicCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                values.category === cat.name && styles.categoryChipActive,
              ]}
              onPress={() => setFieldValue('category', cat.name)}
            >
              {cat.iconUrl ? (
                <Image
                  source={{ uri: cat.iconUrl }}
                  style={{ width: 16, height: 16, borderRadius: 8, marginRight: 6 }}
                  resizeMode="contain"
                />
              ) : null}
              <Text
                style={[
                  styles.categoryChipText,
                  values.category === cat.name && styles.categoryChipTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pod Type Toggle */}
        <Text style={styles.inputLabel}>POD TYPE</Text>
        <View style={styles.categoryRow}>
          {(['ONE_TIME', 'OCCURRENCE'] as const).map((pt) => (
            <TouchableOpacity
              key={pt}
              style={[styles.categoryChip, values.podType === pt && styles.categoryChipActive]}
              onPress={() => setFieldValue('podType', pt)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  values.podType === pt && styles.categoryChipTextActive,
                ]}
              >
                {pt === 'ONE_TIME' ? 'One Time' : 'Occurrence'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {values.podType === 'OCCURRENCE' && (
          <View style={{ marginBottom: 12, gap: 10, marginTop: 4 }}>
            <Text style={styles.inputLabel}>RECURRENCE</Text>
            <View style={styles.categoryRow}>
              {RECURRENCE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.categoryChip,
                    values.recurrence === opt.value && styles.categoryChipActive,
                  ]}
                  onPress={() => setFieldValue('recurrence', opt.value)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      values.recurrence === opt.value && styles.categoryChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={[styles.textInput, { flex: 1 }]}
                onPress={onShowStartDatePicker}
              >
                <Text style={{ color: colors.text, fontSize: 14 }}>
                  Start:{' '}
                  {startDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.textInput, { flex: 1 }]}
                onPress={onShowEndDatePicker}
              >
                <Text style={{ color: colors.text, fontSize: 14 }}>
                  End:{' '}
                  {endDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={(_evt: DateTimePickerEvent, date?: Date) => {
                  onDismissStartDatePicker();
                  onStartDateChange(date);
                }}
              />
            )}
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={startDate}
                onChange={(_evt: DateTimePickerEvent, date?: Date) => {
                  onDismissEndDatePicker();
                  onEndDateChange(date);
                }}
              />
            )}

            <View
              style={{
                backgroundColor: colors.primary + '12',
                padding: 12,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <MaterialIcons name="repeat" size={18} color={colors.primary} />
              <Text style={{ color: colors.text, fontSize: 13 }}>
                {calculateOccurrenceCount(startDate, endDate, values.recurrence)} occurrences (
                {values.recurrence.toLowerCase()})
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.inputLabel}>CITY</Text>
        <TouchableOpacity
          style={[
            styles.textInput,
            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
          ]}
          onPress={() => setCityPickerVisible(true)}
          activeOpacity={0.7}
        >
          <Text
            style={{
              color: selectedCity ? colors.text : colors.textTertiary,
              fontSize: 16,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {selectedCity || 'Select a city first'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <Modal visible={cityPickerVisible} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: colors.overlay }}>
            <View
              style={{
                flex: 1,
                marginTop: 200,
                backgroundColor: colors.surface,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.surfaceVariant,
                }}
              >
                <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>
                  Select City
                </Text>
                <TouchableOpacity onPress={() => setCityPickerVisible(false)}>
                  <MaterialIcons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={activeCities}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.surfaceVariant,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      backgroundColor:
                        selectedCity === item.name ? colors.primary + '10' : undefined,
                    }}
                    onPress={() => {
                      setSelectedCity(item.name);
                      setCityPickerVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name="location-city"
                      size={24}
                      color={selectedCity === item.name ? colors.primary : colors.textTertiary}
                    />
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                      {item.name}
                    </Text>
                    {selectedCity === item.name && (
                      <MaterialIcons
                        name="check-circle"
                        size={20}
                        color={colors.primary}
                        style={{ marginLeft: 'auto' }}
                      />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        <Text style={styles.inputLabel}>VENUE</Text>
        <TouchableOpacity
          style={[
            styles.textInput,
            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
            touched.location && errors.location ? styles.inputError : undefined,
          ]}
          onPress={() => setPlaceModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text
            style={{
              color: values.location ? colors.text : colors.textTertiary,
              fontSize: 16,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {values.location || 'Select a registered venue'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        {touched.location && errors.location && (
          <Text style={styles.errorText}>{errors.location}</Text>
        )}

        {values.locationDetail ? (
          <Text
            style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4, marginBottom: 8 }}
          >
            {values.locationDetail}
          </Text>
        ) : null}

        {/* Use My Location Button */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.primary,
            alignSelf: 'flex-start',
            marginTop: 8,
            marginBottom: 4,
          }}
          onPress={handleUseMyLocation}
          disabled={gpsLoading}
          activeOpacity={0.7}
        >
          {gpsLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <MaterialIcons name="my-location" size={18} color={colors.primary} />
          )}
          <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }}>
            {gpsLoading ? 'Getting location...' : 'Use My Location'}
          </Text>
        </TouchableOpacity>

        {/* Map Preview */}
        {values.latitude !== 0 && values.longitude !== 0 && googleMapsApiKey.length > 0 && (
          <View style={{ marginTop: 8, marginBottom: 12, borderRadius: 12, overflow: 'hidden' }}>
            <Image
              source={{
                uri: `https://maps.googleapis.com/maps/api/staticmap?center=${values.latitude},${values.longitude}&zoom=15&size=600x200&scale=2&markers=color:red%7C${values.latitude},${values.longitude}&key=${googleMapsApiKey}`,
              }}
              style={{
                width: '100%',
                height: 140,
                borderRadius: 12,
                backgroundColor: colors.surfaceVariant,
              }}
              resizeMode="cover"
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
              <MaterialIcons name="place" size={14} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {values.latitude.toFixed(4)}, {values.longitude.toFixed(4)}
              </Text>
            </View>
          </View>
        )}

        <Modal visible={placeModalVisible} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: colors.overlay }}>
            <View
              style={{
                flex: 1,
                marginTop: 120,
                backgroundColor: colors.surface,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.surfaceVariant,
                }}
              >
                <TextInput
                  style={{ flex: 1, fontSize: 16, color: colors.text, paddingVertical: 8 }}
                  placeholder="Search venues..."
                  placeholderTextColor={colors.textTertiary}
                  value={placeSearch}
                  onChangeText={setPlaceSearch}
                  autoFocus
                />
                <TouchableOpacity
                  onPress={() => {
                    setPlaceModalVisible(false);
                    setPlaceSearch('');
                  }}
                >
                  <MaterialIcons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              {placesLoading ? (
                <View style={{ padding: 32, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : approvedPlaces.length === 0 ? (
                <View style={{ padding: 32, alignItems: 'center' }}>
                  <MaterialIcons name="location-off" size={48} color={colors.textTertiary} />
                  <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 14 }}>
                    No approved venues found
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={approvedPlaces}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.surfaceVariant,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        backgroundColor: values.placeId === item.id ? colors.surface : colors.white,
                      }}
                      onPress={() => handleSelectPlace(item)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons
                        name="place"
                        size={24}
                        color={values.placeId === item.id ? colors.primary : colors.textTertiary}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                          {item.name}
                        </Text>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                          {item.address}, {item.city}
                        </Text>
                      </View>
                      {values.placeId === item.id && (
                        <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>

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

        <PayoutCard
          feePerPerson={feeNum}
          maxSeats={values.maxSeats}
          platformFeePercent={effectiveFeePercent}
          feeSource={feeSource}
        />
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
