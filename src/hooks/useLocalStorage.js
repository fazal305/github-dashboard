import { useCallback, useEffect, useState } from 'react';
import { getItem, setItem } from '../utils/storage.js';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => getItem(key, initialValue));

  useEffect(() => {
    setItem(key, value);
  }, [key, value]);

  useEffect(() => {
    function handleStorageEvent(event) {
      if (event.key !== key || event.storageArea !== window.localStorage) return;
      setValue(event.newValue === null ? initialValue : JSON.parse(event.newValue));
    }
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [key, initialValue]);

  const updateValue = useCallback((next) => {
    setValue((prev) => (typeof next === 'function' ? next(prev) : next));
  }, []);

  return [value, updateValue];
}
