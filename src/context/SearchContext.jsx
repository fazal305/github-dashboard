import { createContext, useContext, useMemo } from 'react';
import { useSearchHistory } from '../hooks/useSearchHistory.js';
import { STORAGE_KEYS } from '../utils/constants.js';

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const recentUsers = useSearchHistory(STORAGE_KEYS.RECENT_USERS);
  const recentRepos = useSearchHistory(STORAGE_KEYS.RECENT_REPOS);
  const compareHistory = useSearchHistory(STORAGE_KEYS.COMPARE_HISTORY, {
    getKey: (item) => item.id,
  });

  const value = useMemo(
    () => ({
      recentUsers: recentUsers.items,
      addRecentUser: recentUsers.addItem,
      removeRecentUser: recentUsers.removeItem,
      clearRecentUsers: recentUsers.clear,

      recentRepos: recentRepos.items,
      addRecentRepo: recentRepos.addItem,
      removeRecentRepo: recentRepos.removeItem,
      clearRecentRepos: recentRepos.clear,

      compareHistory: compareHistory.items,
      addCompareEntry: compareHistory.addItem,
      removeCompareEntry: compareHistory.removeItem,
      clearCompareHistory: compareHistory.clear,
    }),
    [recentUsers, recentRepos, compareHistory],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}
