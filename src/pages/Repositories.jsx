import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiGrid, FiList, FiFolder, FiDownload } from 'react-icons/fi';
import { useGitHubApi } from '../hooks/useGitHubApi.js';
import { useSearchContext } from '../context/SearchContext.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import * as githubApi from '../services/githubApi.js';
import Breadcrumb from '../components/Breadcrumb/index.js';
import RepoCard from '../components/RepoCard/index.js';
import RepositoryTable from '../components/RepositoryTable/index.js';
import EmptyState from '../components/EmptyState/index.js';
import ErrorState from '../components/ErrorState/index.js';
import Loader from '../components/Loader/index.js';
import Pagination from '../components/Pagination/index.js';
import { DEFAULT_PER_PAGE, REPO_SORT_OPTIONS, ROUTE_PATHS, STORAGE_KEYS } from '../utils/constants.js';
import { buildRepositorySummary, exportData } from '../utils/export.js';

function Repositories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { recentUsers } = useSearchContext();
  const activeUser = searchParams.get('user') || recentUsers[0]?.login || '';
  const [perPage] = useLocalStorage(STORAGE_KEYS.PER_PAGE, DEFAULT_PER_PAGE);
  const [defaultSort] = useLocalStorage(STORAGE_KEYS.DEFAULT_REPO_SORT, 'updated');
  const [exportFormat] = useLocalStorage(STORAGE_KEYS.EXPORT_FORMAT, 'json');

  const [userInput, setUserInput] = useState(activeUser);
  const [sort, setSort] = useState(defaultSort);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    setUserInput(activeUser);
  }, [activeUser]);

  useEffect(() => {
    setPage(1);
  }, [activeUser, sort]);

  const { data: repos, error, isLoading, refetch } = useGitHubApi(
    (signal) => githubApi.getUserRepos(activeUser, { page, perPage, sort }, signal),
    [activeUser, sort, page, perPage],
    { enabled: Boolean(activeUser) },
  );

  function handleUserSubmit(event) {
    event.preventDefault();
    if (userInput.trim()) setSearchParams({ user: userInput.trim() });
  }

  const hasNextPage = (repos?.length ?? 0) === perPage;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Dashboard', path: ROUTE_PATHS.DASHBOARD }, { label: 'Repositories' }]} />

      <div className="gd-page-header">
        <h1>Repositories</h1>
      </div>

      <form onSubmit={handleUserSubmit} className="d-flex flex-wrap gd-gap-2 gd-mb-6">
        <label htmlFor="gd-repos-user" className="visually-hidden">
          GitHub username
        </label>
        <input
          id="gd-repos-user"
          type="text"
          value={userInput}
          onChange={(event) => setUserInput(event.target.value)}
          placeholder="Enter a GitHub username…"
          className="form-control gd-max-w-input"
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Load Repositories
        </button>

        {activeUser && (
          <select
            className="form-select form-select-sm ms-auto gd-max-w-select"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort repositories"
          >
            {REPO_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {activeUser && (
          <div className="btn-group" role="group" aria-label="View mode">
            <button
              type="button"
              className={`btn btn-outline-secondary btn-sm${viewMode === 'grid' ? ' active' : ''}`}
              aria-pressed={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
            >
              <FiGrid size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`btn btn-outline-secondary btn-sm${viewMode === 'table' ? ' active' : ''}`}
              aria-pressed={viewMode === 'table'}
              onClick={() => setViewMode('table')}
            >
              <FiList size={14} aria-hidden="true" />
            </button>
          </div>
        )}

        {repos?.length > 0 && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gd-gap-2"
            onClick={() =>
              exportData(repos.map(buildRepositorySummary), `${activeUser}-repositories`, exportFormat)
            }
          >
            <FiDownload size={14} aria-hidden="true" /> Export {exportFormat.toUpperCase()}
          </button>
        )}
      </form>

      {!activeUser ? (
        <div className="gd-card">
          <EmptyState
            icon={FiFolder}
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
            title={error.status === 404 ? 'User not found' : 'Couldn’t load repositories'}
            description={error.status === 404 ? `There's no GitHub user named "${activeUser}".` : error.message}
            onRetry={refetch}
          />
        </div>
      ) : repos?.length === 0 ? (
        <div className="gd-card">
          <EmptyState
            icon={FiFolder}
            title="No repositories"
            description={
              page === 1 ? `@${activeUser} has no public repositories.` : "You've reached the end of the list."
            }
          />
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="gd-card-grid">
              {repos?.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          ) : (
            <RepositoryTable repos={repos} />
          )}

          <div className="gd-mt-6">
            <Pagination currentPage={page} totalPages={null} hasNextPage={hasNextPage} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}

export default Repositories;
