import { useState, useEffect } from 'react';

/**
 * Debounce a value by the given delay (ms).
 * Returns the debounced value — only updates after the caller stops changing it.
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
