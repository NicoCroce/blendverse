import { useState, useEffect } from 'react';

/**
 * This hook waits for the delay time to change its own state value. If this value does not change, it does not return a new value.
 *
 * @template T
 * @param {T} value
 * @param {number} [delay=400]
 * @returns {T}
 */
export const useDebounce = <T>(value: T, delay: number = 400): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // This clear the timeout if the effect run again before this complete.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
