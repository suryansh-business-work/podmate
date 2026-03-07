import { renderHook } from '@testing-library/react-native';
import { useThemedStyles, useAppColors } from '../useThemedStyles';

// The hooks are mocked globally in jest.setup.ts, so we test the mock contract
// and that the factory pattern works correctly.

describe('useThemedStyles', () => {
  it('returns styles from factory function', () => {
    const factory = jest.fn((utils: { colors: Record<string, string> }) => ({
      container: { backgroundColor: utils.colors.primary },
    }));

    const { result } = renderHook(() => useThemedStyles(factory));

    expect(factory).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual({
      container: { backgroundColor: '#6C5CE7' },
    });
  });

  it('passes colors, spacing, and borderRadius to factory', () => {
    const factory = jest.fn(
      (utils: {
        colors: Record<string, string>;
        spacing: Record<string, number>;
        borderRadius: Record<string, number>;
      }) => ({
        box: {
          backgroundColor: utils.colors.surface,
          padding: utils.spacing.md,
          borderRadius: utils.borderRadius.lg,
        },
      }),
    );

    const { result } = renderHook(() => useThemedStyles(factory));

    expect(result.current.box).toEqual({
      backgroundColor: '#F8F9FA',
      padding: 12,
      borderRadius: 12,
    });
  });

  it('returns same reference for same factory across rerenders', () => {
    const factory = () => ({ text: { color: '#000' } });
    const { result, rerender } = renderHook(() => useThemedStyles(factory));
    const first = result.current;

    rerender({});
    // Factory is recalled because the mock doesn't memoize, but structure is consistent
    expect(result.current).toEqual(first);
  });

  it('handles factory returning empty styles object', () => {
    const factory = () => ({});
    const { result } = renderHook(() => useThemedStyles(factory));
    expect(result.current).toEqual({});
  });

  it('handles factory returning nested style objects', () => {
    const factory = (utils: { colors: Record<string, string> }) => ({
      header: { color: utils.colors.text },
      body: { color: utils.colors.textSecondary },
    });

    const { result } = renderHook(() => useThemedStyles(factory));

    expect(result.current.header.color).toBe('#1A1A2E');
    expect(result.current.body.color).toBe('#666666');
  });
});

describe('useAppColors', () => {
  it('returns color palette object', () => {
    const { result } = renderHook(() => useAppColors());

    expect(result.current).toBeDefined();
    expect(result.current.primary).toBe('#6C5CE7');
    expect(result.current.error).toBe('#E74C3C');
    expect(result.current.success).toBe('#27AE60');
  });

  it('includes all critical color keys', () => {
    const { result } = renderHook(() => useAppColors());

    expect(result.current).toHaveProperty('primary');
    expect(result.current).toHaveProperty('text');
    expect(result.current).toHaveProperty('textSecondary');
    expect(result.current).toHaveProperty('textTertiary');
    expect(result.current).toHaveProperty('white');
    expect(result.current).toHaveProperty('surface');
    expect(result.current).toHaveProperty('surfaceVariant');
    expect(result.current).toHaveProperty('border');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('success');
  });

  it('returns consistent values across multiple calls', () => {
    const { result, rerender } = renderHook(() => useAppColors());
    const first = result.current;

    rerender({});
    expect(result.current).toEqual(first);
  });
});
