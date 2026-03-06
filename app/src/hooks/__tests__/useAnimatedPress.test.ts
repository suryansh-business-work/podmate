import { renderHook } from '@testing-library/react-native';
import { useAnimatedPress } from '../useAnimatedPress';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

describe('useAnimatedPress', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns scale, onPressIn, and onPressOut', () => {
    const { result } = renderHook(() => useAnimatedPress());
    expect(result.current.scale).toBeDefined();
    expect(typeof result.current.onPressIn).toBe('function');
    expect(typeof result.current.onPressOut).toBe('function');
  });

  it('initial scale value is 1', () => {
    const { result } = renderHook(() => useAnimatedPress());
    // Animated.Value stores current value as _value
    expect((result.current.scale as unknown as { _value: number })._value).toBe(1);
  });

  it('onPressIn and onPressOut do not throw', () => {
    const { result } = renderHook(() => useAnimatedPress());
    expect(() => result.current.onPressIn()).not.toThrow();
    expect(() => result.current.onPressOut()).not.toThrow();
  });

  it('accepts custom scaleValue option', () => {
    const { result } = renderHook(() => useAnimatedPress({ scaleValue: 0.8 }));
    expect(result.current.scale).toBeDefined();
  });

  it('calls haptics when haptics option is true', () => {
    const Haptics = require('expo-haptics');
    const { result } = renderHook(() => useAnimatedPress({ haptics: true }));
    result.current.onPressIn();
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('does not call haptics when haptics option is false', () => {
    const Haptics = require('expo-haptics');
    const { result } = renderHook(() => useAnimatedPress({ haptics: false }));
    result.current.onPressIn();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it('does not call haptics by default', () => {
    const Haptics = require('expo-haptics');
    const { result } = renderHook(() => useAnimatedPress());
    result.current.onPressIn();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });
});
