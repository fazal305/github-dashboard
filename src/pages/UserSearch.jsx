import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiUsers, FiX } from 'react-icons/fi';
import { useDebounce } from '../hooks/useDebounce.js';
import { usePagination } from '../hooks/usePagination.js';
import { useGitHubApi } from '../hooks/useGitHubApi.js';
import * as githubApi from '../services/githubApi.js';
import UserCard from '../components/UserCard/index.js';
import EmptyState from '../components/EmptyState/index.js';
import ErrorState from '../components/ErrorState/index.js';
import Loader from '../components/Loader/index.js';
import Pagination from '../components/Pagination/index.js';
import { formatCompactNumber } from '../utils/formatters.js';

function UserSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const [inputValue, setInputValue] = useState(urlQuery);
  const debouncedInput = useDebounce(inputValue, 400);
  const pagination = usePagination();

  useEffect(() => {
    if (debouncedInput !== urlQuery) {
      setSearchParams(debouncedInput ? { q: debouncedInput } : {}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

  useEffect(() => {
    setInputValue(urlQuery);
    pagination.resetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  const { data, error, isLoading, loadingMessage, refetch } = useGitHubApi(
    (signal) => githubApi.searchUsers(urlQuery, { page: pagination.currentPage, perPage: pagination.perPage }, signal),
    [urlQuery, pagination.currentPage],
    { enabled: urlQuery.trim().length > 0 },
  );

  useEffect(() => {
    pagination.setTotalItems(data?.total_count ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div>
      <div className="gd-page-header">
        <h1>User Search</h1>
      </div>

      <div className="gd-search-bar gd-page-search gd-mb-6">
        <FiSearch className="gd-search-bar__icon" size={16} aria-hidden="true" />
        <label htmlFor="gd-user-search-input" className="visually-hidden">
          Search GitHub users
        </label>
        <input
          id="gd-user-search-input"
          type="search"
          placeholder="Search GitHub users by username…"
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

      {!urlQuery ? (
        <div className="gd-card">
          <EmptyState icon={FiUsers} title="Search for GitHub users" description="Start typing a username above." />
        </div>
      ) : isLoading ? (
        <div className="gd-card d-flex justify-content-center">
          <Loader fullScreen={false} visibleMessage={loadingMessage} />
        </div>
      ) : error ? (
        <div className="gd-card">
          <ErrorState
            title={error.isRateLimited ? 'Rate limit exceeded' : 'Couldn’t search users'}
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
          <EmptyState icon={FiUsers} title="No users found" description={`No results for "${urlQuery}".`} />
        </div>
      ) : (
        <>
          <p className="gd-text-secondary gd-text-sm gd-mb-3">
            {formatCompactNumber(data?.total_count)} users found
          </p>
          <div className="gd-card-grid">
            {data?.items?.map((user) => (
              <UserCard key={user.login} user={user} />
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

export default UserSearch;
