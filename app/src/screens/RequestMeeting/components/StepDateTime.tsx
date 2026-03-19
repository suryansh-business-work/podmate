import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';

import { GET_BOOKED_SLOTS, GET_AVAILABLE_MEETING_SLOTS } from '../../../graphql/queries';
import { createStyles } from '../RequestMeeting.styles';
import { useThemedStyles, useAppColors } from '../../../hooks/useThemedStyles';
import type { BookedSlot } from '../RequestMeeting.types';

interface StepDateTimeProps {
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onContinue: () => void;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    d.getDay()
  ];
  const monthName = MONTH_NAMES[d.getMonth()];
  return `${dayName}, ${monthName} ${d.getDate()}`;
}

function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'pm' : 'am';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHour}:${String(minutes).padStart(2, '0')}${suffix}`;
}

const StepDateTime: React.FC<StepDateTimeProps> = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  onContinue,
}) => {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const { data: slotsData } = useQuery<{ availableMeetingSlots: string[] }>(
    GET_AVAILABLE_MEETING_SLOTS,
    { fetchPolicy: 'cache-first' },
  );

  const { data: bookedData, loading: bookedLoading } = useQuery<{
    bookedSlots: BookedSlot[];
  }>(GET_BOOKED_SLOTS, {
    variables: { meetingDate: selectedDate },
    skip: !selectedDate,
    fetchPolicy: 'network-only',
  });

  const availableSlots = slotsData?.availableMeetingSlots ?? [];
  const bookedSlots = useMemo(() => {
    const set = new Set<string>();
    (bookedData?.bookedSlots ?? []).forEach((s) => set.add(s.meetingTime));
    return set;
  }, [bookedData]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const handlePrevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }, [viewMonth, viewYear]);

  const handleNextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }, [viewMonth, viewYear]);

  const isPastMonth =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth <= today.getMonth());

  const calendarDays = useMemo(() => {
    const days: Array<{ day: number; disabled: boolean; isToday: boolean }> = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, disabled: true, isToday: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const isPast = date < today;
      const isToday = date.getTime() === today.getTime();
      // Disable weekends (Saturday=6, Sunday=0)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      days.push({ day: d, disabled: isPast || isWeekend, isToday });
    }

    return days;
  }, [viewYear, viewMonth, firstDay, daysInMonth, today]);

  const canContinue = selectedDate !== '' && selectedTime !== '';

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Select a Date & Time</Text>
      <Text style={styles.helperText}>
        Choose a convenient date and time for your 1:1 meeting with our team.
      </Text>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            style={styles.calendarNavBtn}
            onPress={handlePrevMonth}
            disabled={isPastMonth}
          >
            <MaterialIcons
              name="chevron-left"
              size={24}
              color={isPastMonth ? colors.textTertiary : colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.calendarMonthText}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Text>
          <TouchableOpacity style={styles.calendarNavBtn} onPress={handleNextMonth}>
            <MaterialIcons name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Weekday headers */}
        <View style={styles.calendarWeekRow}>
          {WEEKDAYS.map((day) => (
            <Text key={day} style={styles.calendarWeekDay}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((item, index) => {
            if (item.day === 0) {
              return <View key={`empty-${index}`} style={styles.calendarDayCell} />;
            }
            const dateStr = formatDate(viewYear, viewMonth, item.day);
            const isSelected = dateStr === selectedDate;

            return (
              <View key={dateStr} style={styles.calendarDayCell}>
                <TouchableOpacity
                  style={[
                    styles.calendarDay,
                    item.isToday && styles.calendarDayToday,
                    isSelected && styles.calendarDaySelected,
                    item.disabled && styles.calendarDayDisabled,
                  ]}
                  onPress={() => {
                    if (!item.disabled) {
                      onDateChange(dateStr);
                      onTimeChange('');
                    }
                  }}
                  disabled={item.disabled}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      isSelected && styles.calendarDayTextSelected,
                      item.disabled && styles.calendarDayTextDisabled,
                    ]}
                  >
                    {item.day}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      {/* Selected date display */}
      {selectedDate !== '' && (
        <>
          <Text style={styles.selectedDateText}>{formatDisplayDate(selectedDate)}</Text>

          {/* Time slots */}
          <Text style={styles.timeSlotsTitle}>Available Time Slots</Text>

          {bookedLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.timeSlotsContainer}>
              {availableSlots.map((slot) => {
                const isBooked = bookedSlots.has(slot);
                const isSelected = selectedTime === slot;

                return (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.timeSlot,
                      isSelected && styles.timeSlotSelected,
                      isBooked && styles.timeSlotDisabled,
                    ]}
                    onPress={() => !isBooked && onTimeChange(slot)}
                    disabled={isBooked}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        isSelected && styles.timeSlotTextSelected,
                        isBooked && styles.timeSlotTextDisabled,
                      ]}
                    >
                      {formatTimeDisplay(slot)}
                      {isBooked ? ' (Booked)' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </>
      )}

      <View style={styles.btnContainer}>
        <TouchableOpacity
          style={[styles.submitBtn, !canContinue && styles.submitBtnDisabled]}
          onPress={onContinue}
          disabled={!canContinue}
        >
          <Text style={styles.submitBtnText}>Confirm Meeting</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default StepDateTime;
