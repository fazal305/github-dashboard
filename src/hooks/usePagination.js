import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_PER_PAGE, STORAGE_KEYS } from '../utils/constants.js';
import { getItem } from '../utils/storage.js';

export function usePagination({
  initialPage = 1,
  perPage = getItem(STORAGE_KEYS.PER_PAGE, DEFAULT_PER_PAGE),
  totalItems = null,
} = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [total, setTotal] = useState(totalItems);

  const totalPages = useMemo(() => {
    if (total === null || total === undefined) return null;
    return Math.max(1, Math.ceil(total / perPage));
  }, [total, perPage]);

  const setPage = useCallback(
    (page) => {
      setCurrentPage((prev) => {
        const next = typeof page === 'function' ? page(prev) : page;
        const clampedMin = Math.max(1, next);
        return totalPages ? Math.min(clampedMin, totalPages) : clampedMin;
      });
    },
    [totalPages],
  );

  const nextPage = useCallback(() => setPage((prev) => prev + 1), [setPage]);
  const prevPage = useCallback(() => setPage((prev) => prev - 1), [setPage]);
  const resetPage = useCallback(() => setCurrentPage(1), []);

  const hasNextPage = totalPages ? currentPage < totalPages : true;
  const hasPrevPage = currentPage > 1;

  return {
    currentPage,
    perPage,
    totalPages,
    totalItems: total,
    setTotalItems: setTotal,
    setPage,
    nextPage,
    prevPage,
    resetPage,
    hasNextPage,
    hasPrevPage,
  };
}
