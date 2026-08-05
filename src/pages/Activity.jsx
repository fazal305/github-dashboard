import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FiActivity,
  FiGitCommit,
  FiGitPullRequest,
  FiAlertCircle,
  FiGitBranch,
  FiStar,
  FiPlusCircle,
  FiTrash2,
  FiTag,
  FiMessageSquare,
} from 'react-icons/fi';
import { useGitHubApi } from '../hooks/useGitHubApi.js';
import { useSearchContext } from '../context/SearchContext.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import * as githubApi from '../services/githubApi.js';
import Breadcrumb from '../components/Breadcrumb/index.js';
import EmptyState from '../components/EmptyState/index.js';
import ErrorState from '../components/ErrorState/index.js';
import Loader from '../components/Loader/index.js';
import Pagination from '../components/Pagination/index.js';
import { buildRepositoryDetailsPath, DEFAULT_PER_PAGE, ROUTE_PATHS, STORAGE_KEYS } from '../utils/constants.js';
import { formatRelativeTime } from '../utils/formatters.js';

const EVENT_DESCRIPTORS = {
  PushEvent: {
    icon: FiGitCommit,
    describe: (p) => (p.size || p.commits?.length ? `pushed ${p.size ?? p.commits.length} commit(s) to` : 'pushed to'),
  },
  PullRequestEvent: { icon: FiGitPullRequest, describe: (p) => `${p.action} a pull request in` },
  IssuesEvent: { icon: FiAlertCircle, describe: (p) => `${p.action} an issue in` },
  IssueCommentEvent: { icon: FiMessageSquare, describe: () => 'commented on an issue in' },
  ForkEvent: { icon: FiGitBranch, describe: () => 'forked' },
  WatchEvent: { icon: FiStar, describe: () => 'starred' },
  CreateEvent: { icon: FiPlusCircle, describe: (p) => `created ${p.ref_type}${p.ref ? ` "${p.ref}"` : ''} in` },
  DeleteEvent: { icon: FiTrash2, describe: (p) => `deleted ${p.ref_type} "${p.ref}" in` },
  ReleaseEvent: { icon: FiTag, describe: () => 'published a release in' },
};

function describeEvent(event) {
  const descriptor = EVENT_DESCRIPTORS[event.type];
  if (!descriptor) {
    return { Icon: FiActivity, text: `${event.type.replace('Event', '')} in` };
  }
  return { Icon: descriptor.icon, text: descriptor.describe(event.payload ?? {}) };
}

function Activity() {
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

  const { data: events, error, isLoading, refetch } = useGitHubApi(
    (signal) => githubApi.getUserEvents(activeUser, { page, perPage }, signal),
    [activeUser, page, perPage],
    { enabled: Boolean(activeUser) },
  );

  function handleUserSubmit(event) {
    event.preventDefault();
    if (userInput.trim()) setSearchParams({ user: userInput.trim() });
  }

  const hasNextPage = (events?.length ?? 0) === perPage;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Dashboard', path: ROUTE_PATHS.DASHBOARD }, { label: 'Activity' }]} />

      <div className="gd-page-header">
        <h1>Activity</h1>
      </div>

      <form onSubmit={handleUserSubmit} className="d-flex flex-wrap gd-gap-2 gd-mb-6">
        <label htmlFor="gd-activity-user" className="visually-hidden">
          GitHub username
        </label>
        <input
          id="gd-activity-user"
          type="text"
          value={userInput}
          onChange={(event) => setUserInput(event.target.value)}
          placeholder="Enter a GitHub username…"
          className="form-control gd-max-w-input"
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Load Activity
        </button>
      </form>

      {!activeUser ? (
        <div className="gd-card">
          <EmptyState
            icon={FiActivity}
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
            title={error.status === 404 ? 'User not found' : 'Couldn’t load activity'}
            description={error.status === 404 ? `There's no GitHub user named "${activeUser}".` : error.message}
            onRetry={refetch}
          />
        </div>
      ) : events?.length === 0 ? (
        <div className="gd-card">
          <EmptyState
            icon={FiActivity}
            title="No recent activity"
            description={page === 1 ? `@${activeUser} has no recent public activity.` : "You've reached the end of the list."}
          />
        </div>
      ) : (
        <>
          <ul className="list-group list-group-flush gd-card gd-p-0">
            {events?.map((event) => {
              const { Icon, text } = describeEvent(event);
              const [owner, repoName] = event.repo?.name?.split('/') ?? [];
              return (
                <li key={event.id} className="list-group-item d-flex align-items-center gd-gap-3 bg-transparent">
                  <span className="gd-stat-card__icon flex-shrink-0">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <span className="flex-grow-1 gd-text-sm">
                    <strong>{event.actor?.login}</strong> {text}{' '}
                    {owner && repoName ? (
                      <Link to={buildRepositoryDetailsPath(owner, repoName)}>{event.repo.name}</Link>
                    ) : (
                      event.repo?.name
                    )}
                  </span>
                  <span className="gd-text-muted gd-text-sm flex-shrink-0">{formatRelativeTime(event.created_at)}</span>
                </li>
              );
            })}
          </ul>
          <div className="gd-mt-6">
            <Pagination currentPage={page} totalPages={null} hasNextPage={hasNextPage} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}

export default Activity;
