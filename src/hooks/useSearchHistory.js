import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { MAX_RECENT_ITEMS } from '../utils/constants.js';

function defaultGetKey(item) {
  return item.id ?? item.login ?? item.full_name;
}

export function useSearchHistory(storageKey, { maxItems = MAX_RECENT_ITEMS, getKey = defaultGetKey } = {}) {
  const [items, setItems] = useLocalStorage(storageKey, []);

  const addItem = useCallback(
    (item) => {
      setItems((prev) => {
        const withoutDuplicate = prev.filter((existing) => getKey(existing) !== getKey(item));
        return [{ ...item, viewedAt: Date.now() }, ...withoutDuplicate].slice(0, maxItems);
      });
    },
    [setItems, getKey, maxItems],
  );

  const removeItem = useCallback(
    (key) => {
      setItems((prev) => prev.filter((existing) => getKey(existing) !== key));
    },
    [setItems, getKey],
  );

  const clear = useCallback(() => setItems([]), [setItems]);

  return { items, addItem, removeItem, clear };
}
