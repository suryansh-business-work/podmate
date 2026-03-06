import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { createStyles } from './CreatePod.styles';
import { useThemedStyles, useAppColors } from '../../hooks/useThemedStyles';

interface LogisticsSectionProps {
  fee: string;
  maxSeats: number;
  dateTime: Date;
  showDatePicker: boolean;
  showTimePicker: boolean;
  onFeeChange: (text: string) => void;
  onMaxSeatsChange: (val: number) => void;
  onShowDatePicker: () => void;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: Date | undefined) => void;
  onDismissDatePicker: () => void;
  onDismissTimePicker: () => void;
}

const LogisticsSection: React.FC<LogisticsSectionProps> = ({
  fee,
  maxSeats,
  dateTime,
  showDatePicker,
  showTimePicker,
  onFeeChange,
  onMaxSeatsChange,
  onShowDatePicker,
  onDateChange,
  onTimeChange,
  onDismissDatePicker,
  onDismissTimePicker,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  return (
    <>
      <Text style={styles.sectionTitle}>Logistics</Text>
      <View style={styles.logisticsRow}>
        <View style={styles.logisticsItem}>
          <Text style={styles.inputLabel}>FEE PER PERSON</Text>
          <View style={styles.feeInput}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.feeTextInput}
              keyboardType="number-pad"
              value={fee}
              onChangeText={onFeeChange}
            />
          </View>
        </View>
        <View style={styles.logisticsItem}>
          <Text style={styles.inputLabel}>MAX SEATS</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => onMaxSeatsChange(Math.max(1, maxSeats - 1))}
            >
              <Text style={styles.counterButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{maxSeats}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => onMaxSeatsChange(maxSeats + 1)}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Text style={styles.inputLabel}>WHEN</Text>
      <TouchableOpacity style={styles.datePickerRow} onPress={onShowDatePicker}>
        <MaterialIcons name="event" size={20} color={colors.primary} />
        <Text style={styles.dateText}>
          {dateTime.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        <MaterialIcons name="edit" size={18} color={colors.textTertiary} />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dateTime}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(_evt: { type: string }, date?: Date) => {
            onDismissDatePicker();
            onDateChange(date);
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={dateTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_evt: { type: string }, time?: Date) => {
            onDismissTimePicker();
            onTimeChange(time);
          }}
        />
      )}
    </>
  );
};

export default LogisticsSection;
