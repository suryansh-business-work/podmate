import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';

interface UseAnimatedPressOptions {
  /** Scale value when pressed in – defaults to 0.95 */
  scaleValue?: number;
  /** Whether to trigger haptic feedback on press-in */
  haptics?: boolean;
}

interface UseAnimatedPressReturn {
  /** Current animated scale value – bind to `transform: [{ scale }]` */
  scale: Animated.Value;
  /** Call on `onPressIn` */
  onPressIn: () => void;
  /** Call on `onPressOut` */
  onPressOut: () => void;
}

/**
 * Provides a scale-down micro-interaction for any pressable element.
 *
 * Usage:
 * ```tsx
 * const { scale, onPressIn, onPressOut } = useAnimatedPress();
 * <Animated.View style={{ transform: [{ scale }] }}>
 *   <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} … />
 * </Animated.View>
 * ```
 */
export function useAnimatedPress(
  options: UseAnimatedPressOptions = {},
): UseAnimatedPressReturn {
  const { scaleValue = 0.95, haptics = false } = options;
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: scaleValue,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();

    if (haptics) {
      try {
        // Lazy-require so the app doesn't crash when expo-haptics is not installed
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Haptics = require('expo-haptics') as typeof import('expo-haptics');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // expo-haptics not available – silently ignore
      }
    }
  }, [scale, scaleValue, haptics]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scale]);

  return { scale, onPressIn, onPressOut };
}
