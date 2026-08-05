import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { useGitHubApi } from '../hooks/useGitHubApi.js';
import { useSearchContext } from '../context/SearchContext.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import * as githubApi from '../services/githubApi.js';
import Breadcrumb from '../components/Breadcrumb/index.js';
import RepoCard from '../components/RepoCard/index.js';
import EmptyState from '../components/EmptyState/index.js';
import ErrorState from '../components/ErrorState/index.js';
import Loader from '../components/Loader/index.js';
import Pagination from '../components/Pagination/index.js';
import { DEFAULT_PER_PAGE, ROUTE_PATHS, STORAGE_KEYS } from '../utils/constants.js';

const SORT_OPTIONS = [
  { value: 'created', label: 'Recently Starred' },
  { value: 'updated', label: 'Recently Updated' },
];

function StarredRepositories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { recentUsers } = useSearchContext();
  const activeUser = searchParams.get('user') || recentUsers[0]?.login || '';
  const [perPage] = useLocalStorage(STORAGE_KEYS.PER_PAGE, DEFAULT_PER_PAGE);

  const [userInput, setUserInput] = useState(activeUser);
  const [sort, setSort] = useState('created');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setUserInput(activeUser);
  }, [activeUser]);

  useEffect(() => {
    setPage(1);
  }, [activeUser, sort]);

  const { data: starred, error, isLoading, refetch } = useGitHubApi(
    (signal) => githubApi.getUserStarred(activeUser, { page, perPage, sort }, signal),
    [activeUser, sort, page, perPage],
    { enabled: Boolean(activeUser) },
  );

  function handleUserSubmit(event) {
    event.preventDefault();
    if (userInput.trim()) setSearchParams({ user: userInput.trim() });
  }

  const hasNextPage = (starred?.length ?? 0) === perPage;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Dashboard', path: ROUTE_PATHS.DASHBOARD }, { label: 'Starred Repositories' }]} />

      <div className="gd-page-header">
        <h1>Starred Repositories</h1>
      </div>

      <form onSubmit={handleUserSubmit} className="d-flex flex-wrap gd-gap-2 gd-mb-6">
        <label htmlFor="gd-starred-user" className="visually-hidden">
          GitHub username
        </label>
        <input
          id="gd-starred-user"
          type="text"
          value={userInput}
          onChange={(event) => setUserInput(event.target.value)}
          placeholder="Enter a GitHub username…"
          className="form-control gd-max-w-input"
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Load Starred
        </button>

        {activeUser && (
          <select
            className="form-select form-select-sm ms-auto gd-max-w-select"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort starred repositories"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </form>

      {!activeUser ? (
        <div className="gd-card">
          <EmptyState
            icon={FiStar}
            title="No user selected"
            description="Enter a GitHub username above, or search for a user first."
          />
        </div>
      ) : isLoading ? (
        <div className="gd-card d-flex justify-content-center">
          <Loader fullScreen={false} />
        </div>
      ) : error ? (
        <div className="gd-card">
          <ErrorState
            title={error.status === 404 ? 'User not found' : 'Couldn’t load starred repositories'}
            description={error.status === 404 ? `There's no GitHub user named "${activeUser}".` : error.message}
            onRetry={refetch}
          />
        </div>
      ) : starred?.length === 0 ? (
        <div className="gd-card">
          <EmptyState
            icon={FiStar}
            title="No starred repositories"
            description={page === 1 ? `@${activeUser} hasn't starred any repositories yet.` : "You've reached the end of the list."}
          />
        </div>
      ) : (
        <>
          <div className="gd-card-grid">
            {starred?.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
          <div className="gd-mt-6">
            <Pagination currentPage={page} totalPages={null} hasNextPage={hasNextPage} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}

export default StarredRepositories;
