import { useEffect, useRef } from 'react';

export function useAutosave<T>(value: T, onSave: (value: T) => void, delay = 2000) {
  const savedValueRef = useRef<T>(value);
  const valueRef = useRef<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    // Only save if value has changed
    if (value === savedValueRef.current) {
        return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSave(valueRef.current);
      savedValueRef.current = valueRef.current;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, onSave]);
}
