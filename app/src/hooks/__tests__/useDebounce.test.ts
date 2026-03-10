import { renderHook, act } from '@testing-library/react-native';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update debounced value before delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } },
    );

    rerender({ value: 'b', delay: 300 });
    jest.advanceTimersByTime(100);
    expect(result.current).toBe('a');
  });

  it('updates debounced value after delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } },
    );

    rerender({ value: 'b', delay: 300 });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('b');
  });

  it('resets the timer when value changes before delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } },
    );

    rerender({ value: 'b', delay: 300 });
    jest.advanceTimersByTime(200);
    rerender({ value: 'c', delay: 300 });
    jest.advanceTimersByTime(200);
    // 'b' timer expired but 'c' should not have
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('c');
  });

  it('uses default delay of 400ms', () => {
    const { result, rerender } = renderHook(({ value }: { value: string }) => useDebounce(value), {
      initialProps: { value: 'init' },
    });

    rerender({ value: 'updated' });
    jest.advanceTimersByTime(399);
    expect(result.current).toBe('init');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  it('works with numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useDebounce(value, 200),
      { initialProps: { value: 0 } },
    );

    rerender({ value: 42 });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe(42);
  });

  it('handles null values', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string | null }) => useDebounce(value, 100),
      { initialProps: { value: 'hello' as string | null } },
    );

    rerender({ value: null });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBeNull();
  });
});
