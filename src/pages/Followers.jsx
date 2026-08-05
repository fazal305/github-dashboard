import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiUsers } from 'react-icons/fi';
import { useGitHubApi } from '../hooks/useGitHubApi.js';
import { useSearchContext } from '../context/SearchContext.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import * as githubApi from '../services/githubApi.js';
import Breadcrumb from '../components/Breadcrumb/index.js';
import UserCard from '../components/UserCard/index.js';
import EmptyState from '../components/EmptyState/index.js';
import ErrorState from '../components/ErrorState/index.js';
import Loader from '../components/Loader/index.js';
import Pagination from '../components/Pagination/index.js';
import { DEFAULT_PER_PAGE, ROUTE_PATHS, STORAGE_KEYS } from '../utils/constants.js';

function Followers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { recentUsers } = useSearchContext();
  const activeUser = searchParams.get('user') || recentUsers[0]?.login || '';
  const [perPage] = useLocalStorage(STORAGE_KEYS.PER_PAGE, DEFAULT_PER_PAGE);

  const [userInput, setUserInput] = useState(activeUser);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setUserInput(activeUser);
  }, [activeUser]);

  useEffect(() => {
    setPage(1);
  }, [activeUser]);

  const { data: followers, error, isLoading, refetch } = useGitHubApi(
    (signal) => githubApi.getUserFollowers(activeUser, { page, perPage }, signal),
    [activeUser, page, perPage],
    { enabled: Boolean(activeUser) },
  );

  function handleUserSubmit(event) {
    event.preventDefault();
    if (userInput.trim()) setSearchParams({ user: userInput.trim() });
  }

  const hasNextPage = (followers?.length ?? 0) === perPage;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Dashboard', path: ROUTE_PATHS.DASHBOARD }, { label: 'Followers' }]} />

      <div className="gd-page-header">
        <h1>Followers</h1>
      </div>

      <form onSubmit={handleUserSubmit} className="d-flex flex-wrap gd-gap-2 gd-mb-6">
        <label htmlFor="gd-followers-user" className="visually-hidden">
          GitHub username
        </label>
        <input
          id="gd-followers-user"
          type="text"
          value={userInput}
          onChange={(event) => setUserInput(event.target.value)}
          placeholder="Enter a GitHub username…"
          className="form-control gd-max-w-input"
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Load Followers
        </button>
      </form>

      {!activeUser ? (
        <div className="gd-card">
          <EmptyState
            icon={FiUsers}
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
            title={error.status === 404 ? 'User not found' : 'Couldn’t load followers'}
            description={error.status === 404 ? `There's no GitHub user named "${activeUser}".` : error.message}
            onRetry={refetch}
          />
        </div>
      ) : followers?.length === 0 ? (
        <div className="gd-card">
          <EmptyState
            icon={FiUsers}
            title="No followers"
            description={page === 1 ? `@${activeUser} has no followers yet.` : "You've reached the end of the list."}
          />
        </div>
      ) : (
        <>
          <div className="gd-card-grid">
            {followers?.map((follower) => (
              <UserCard key={follower.id} user={follower} />
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

export default Followers;
