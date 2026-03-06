import React, { useRef, useCallback, memo } from 'react';
import { StyleSheet, TouchableOpacity, Animated, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

import type { ChatbotFabProps } from './ChatbotFab.types';
import { useThemedStyles, useAppColors, ThemeUtils } from '../../hooks/useThemedStyles';

const ChatbotFab: React.FC<ChatbotFabProps> = memo(function ChatbotFab({ onPress }) {
  const styles = useThemedStyles(createStyles);
  const colors = useAppColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel="Open AI chatbot"
        accessibilityHint="Opens the PartyWings assistant"
      >
        <LinearGradient
          colors={[colors.primaryLight, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <MaterialIcons name="smart-toy" size={18} color={colors.white} />
          <Text style={styles.fabLabel}>Ask PartyWings</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

const createStyles = ({ colors }: ThemeUtils) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 90,
      right: 16,
      zIndex: 999,
      elevation: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    fab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 24,
    },
    fabLabel: {
      color: colors.white,
      fontSize: 12,
      fontWeight: '700',
    },
  });

export default ChatbotFab;
