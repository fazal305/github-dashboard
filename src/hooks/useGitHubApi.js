import { useCallback, useEffect, useRef, useState } from 'react';
import { onRetry } from '../services/githubApi.js';

// How long a request can be in flight before we tell the user it's still
// working. Retries with backoff can genuinely take a few seconds, so this
// isn't necessarily a sign anything is wrong.
const SLOW_REQUEST_THRESHOLD_MS = 5500;

export function useGitHubApi(fetcher, deps = [], { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [refetchIndex, setRefetchIndex] = useState(0);
  const [retryInfo, setRetryInfo] = useState(null);
  const [isSlow, setIsSlow] = useState(false);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refetch = useCallback(() => setRefetchIndex((prev) => prev + 1), []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    setRetryInfo(null);
    setIsSlow(false);

    // If GitHub's API (or our retry/backoff sequence) is taking a while,
    // surface real retry progress when we have it, otherwise fall back to a
    // flat "still loading" timer.
    const slowTimerId = window.setTimeout(() => setIsSlow(true), SLOW_REQUEST_THRESHOLD_MS);
    const unsubscribeRetry = onRetry((info) => {
      if (controller.signal.aborted) return;
      setRetryInfo(info);
    });

    fetcherRef.current(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
      })
      .catch((caughtError) => {
        if (controller.signal.aborted) return;
        setError(caughtError);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsLoading(false);
      });

    return () => {
      controller.abort();
      window.clearTimeout(slowTimerId);
      unsubscribeRetry();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, refetchIndex, ...deps]);

  const isRetrying = isLoading && retryInfo !== null;
  const showSlowLoadingMessage = isLoading && (isSlow || isRetrying);
  const loadingMessage = !showSlowLoadingMessage
    ? null
    : isRetrying
      ? `Still loading… retrying request (attempt ${retryInfo.attempt} of ${retryInfo.maxRetries})`
      : "Still loading… GitHub's API can be slow at times";

  return { data, error, isLoading, refetch, isRetrying, loadingMessage };
}
