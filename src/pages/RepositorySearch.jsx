import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFolder, FiX } from 'react-icons/fi';
import { useDebounce } from '../hooks/useDebounce.js';
import { usePagination } from '../hooks/usePagination.js';
import { useGitHubApi } from '../hooks/useGitHubApi.js';
import * as githubApi from '../services/githubApi.js';
import RepoCard from '../components/RepoCard/index.js';
import EmptyState from '../components/EmptyState/index.js';
import ErrorState from '../components/ErrorState/index.js';
import Loader from '../components/Loader/index.js';
import Pagination from '../components/Pagination/index.js';
import { LANGUAGE_COLORS } from '../utils/constants.js';
import { formatCompactNumber } from '../utils/formatters.js';

const LANGUAGE_OPTIONS = Object.keys(LANGUAGE_COLORS).sort();
const STARS_OPTIONS = [
  { value: '', label: 'Any stars' },
  { value: '10', label: '10+' },
  { value: '100', label: '100+' },
  { value: '1000', label: '1,000+' },
  { value: '10000', label: '10,000+' },
];
const SORT_OPTIONS = [
  { value: '', label: 'Best Match' },
  { value: 'stars', label: 'Most Stars' },
  { value: 'forks', label: 'Most Forks' },
  { value: 'updated', label: 'Recently Updated' },
];

function buildSearchQuery({ text, language, minStars }) {
  const parts = [];
  if (text) parts.push(text);
  if (language) parts.push(`language:${language}`);
  if (minStars) parts.push(`stars:>=${minStars}`);
  return parts.join(' ');
}

function RepositorySearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const language = searchParams.get('language') ?? '';
  const minStars = searchParams.get('stars') ?? '';
  const sort = searchParams.get('sort') ?? '';

  const [inputValue, setInputValue] = useState(urlQuery);
  const debouncedInput = useDebounce(inputValue, 400);
  const pagination = usePagination();

  function updateParams(partial) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(partial)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setSearchParams(next, { replace: true });
  }

  useEffect(() => {
    if (debouncedInput !== urlQuery) updateParams({ q: debouncedInput });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

  useEffect(() => {
    setInputValue(urlQuery);
    pagination.resetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery, language, minStars, sort]);

  const finalQuery = buildSearchQuery({ text: urlQuery, language, minStars });

  const { data, error, isLoading, loadingMessage, refetch } = useGitHubApi(
    (signal) =>
      githubApi.searchRepositories(finalQuery, { page: pagination.currentPage, perPage: pagination.perPage, sort: sort || undefined }, signal),
    [finalQuery, sort, pagination.currentPage],
    { enabled: finalQuery.trim().length > 0 },
  );

  useEffect(() => {
    pagination.setTotalItems(data?.total_count ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div>
      <div className="gd-page-header">
        <h1>Repository Search</h1>
      </div>

      <div className="gd-search-bar gd-page-search gd-mb-4">
        <FiSearch className="gd-search-bar__icon" size={16} aria-hidden="true" />
        <label htmlFor="gd-repo-search-input" className="visually-hidden">
          Search repositories
        </label>
        <input
          id="gd-repo-search-input"
          type="search"
          placeholder="Search repositories by name, keyword…"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          autoFocus
        />
        {inputValue && (
          <button
            type="button"
            className="gd-btn-icon gd-search-bar__clear"
            aria-label="Clear search"
            onClick={() => setInputValue('')}
          >
            <FiX size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="d-flex flex-wrap gd-gap-2 gd-mb-6">
        <select
          className="form-select form-select-sm gd-max-w-select"
          aria-label="Filter by language"
          value={language}
          onChange={(event) => updateParams({ language: event.target.value })}
        >
          <option value="">Any language</option>
          {LANGUAGE_OPTIONS.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <select
          className="form-select form-select-sm gd-max-w-select"
          aria-label="Filter by minimum stars"
          value={minStars}
          onChange={(event) => updateParams({ stars: event.target.value })}
        >
          {STARS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className="form-select form-select-sm gd-max-w-select"
          aria-label="Sort results"
          value={sort}
          onChange={(event) => updateParams({ sort: event.target.value })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {!finalQuery ? (
        <div className="gd-card">
          <EmptyState
            icon={FiFolder}
            title="Search for repositories"
            description="Enter a search term or choose a filter above."
          />
        </div>
      ) : isLoading ? (
        <div className="gd-card d-flex justify-content-center">
          <Loader fullScreen={false} visibleMessage={loadingMessage} />
        </div>
      ) : error ? (
        <div className="gd-card">
          <ErrorState
            title={error.isRateLimited ? 'Rate limit exceeded' : 'Couldn’t search repositories'}
            description={
              error.isRateLimited
                ? `You've hit GitHub's API rate limit. Try again after ${error.resetAt ? error.resetAt.toLocaleTimeString() : 'a few minutes'}.`
                : error.message
            }
            onRetry={refetch}
          />
        </div>
      ) : data?.items?.length === 0 ? (
        <div className="gd-card">
          <EmptyState icon={FiFolder} title="No repositories found" description="Try a different search or filters." />
        </div>
      ) : (
        <>
          <p className="gd-text-secondary gd-text-sm gd-mb-3">
            {formatCompactNumber(data?.total_count)} repositories found
          </p>
          <div className="gd-card-grid">
            {data?.items?.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.setPage}
          />
        </>
      )}
    </div>
  );
}

export default RepositorySearch;
