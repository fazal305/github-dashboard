import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FiMapPin,
  FiBriefcase,
  FiLink2,
  FiTwitter,
  FiCalendar,
  FiExternalLink,
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiFolder,
  FiBookOpen,
  FiDownload,
} from 'react-icons/fi';
import { useGitHubApi } from '../hooks/useGitHubApi.js';
import { useSearchContext } from '../context/SearchContext.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import * as githubApi from '../services/githubApi.js';
import Breadcrumb from '../components/Breadcrumb/index.js';
import StatisticsCards from '../components/StatisticsCards/index.js';
import RepoCard from '../components/RepoCard/index.js';
import EmptyState from '../components/EmptyState/index.js';
import ErrorState from '../components/ErrorState/index.js';
import Loader from '../components/Loader/index.js';
import { ROUTE_PATHS, STORAGE_KEYS } from '../utils/constants.js';
import { formatDate } from '../utils/formatters.js';
import { buildUserSummary, exportData } from '../utils/export.js';

function UserProfile() {
  const { username } = useParams();
  const { addRecentUser } = useSearchContext();
  const [exportFormat] = useLocalStorage(STORAGE_KEYS.EXPORT_FORMAT, 'json');

  const {
    data: user,
    error: userError,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useGitHubApi((signal) => githubApi.getUser(username, signal), [username]);

  const { data: reposData, isLoading: isReposLoading } = useGitHubApi(
    (signal) => githubApi.getUserRepos(username, { perPage: 6, sort: 'updated' }, signal),
    [username],
    { enabled: Boolean(user) },
  );

  useEffect(() => {
    if (user) addRecentUser(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (isUserLoading) {
    return (
      <div className="gd-card d-flex justify-content-center">
        <Loader fullScreen={false} />
      </div>
    );
  }

  if (userError) {
    return (
      <div className="gd-card">
        <ErrorState
          title={userError.status === 404 ? 'User not found' : 'Couldn’t load this profile'}
          description={
            userError.status === 404
              ? `There's no GitHub user named "${username}".`
              : userError.message
          }
          onRetry={refetchUser}
        />
      </div>
    );
  }

  if (!user) return null;

  const stats = [
    { id: 'followers', label: 'Followers', value: user.followers, icon: FiUsers },
    { id: 'following', label: 'Following', value: user.following, icon: FiUserPlus },
    { id: 'repos', label: 'Public Repos', value: user.public_repos, icon: FiFolder },
    { id: 'gists', label: 'Public Gists', value: user.public_gists, icon: FiBookOpen },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: ROUTE_PATHS.DASHBOARD },
          { label: 'Users', path: ROUTE_PATHS.USERS },
          { label: user.login },
        ]}
      />

      <div className="gd-card gd-mb-6">
        <div className="d-flex flex-wrap gd-gap-4">
          <img src={user.avatar_url} alt="" className="gd-avatar gd-avatar--xl" />
          <div className="flex-grow-1 gd-min-w-0">
            <h1 className="gd-mb-1">{user.name || user.login}</h1>
            <p className="gd-text-secondary gd-mb-2">@{user.login}</p>
            {user.bio && <p className="gd-mb-3">{user.bio}</p>}

            <div className="d-flex flex-wrap gd-gap-3 gd-text-sm gd-text-secondary">
              {user.company && (
                <span className="d-flex align-items-center gd-gap-1">
                  <FiBriefcase size={14} aria-hidden="true" />
                  {user.company}
                </span>
              )}
              {user.location && (
                <span className="d-flex align-items-center gd-gap-1">
                  <FiMapPin size={14} aria-hidden="true" />
                  {user.location}
                </span>
              )}
              {user.blog && (
                <a
                  href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                  target="_blank"
                  rel="noreferrer"
                  className="d-flex align-items-center gd-gap-1"
                >
                  <FiLink2 size={14} aria-hidden="true" />
                  {user.blog}
                </a>
              )}
              {user.twitter_username && (
                <a
                  href={`https://twitter.com/${user.twitter_username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="d-flex align-items-center gd-gap-1"
                >
                  <FiTwitter size={14} aria-hidden="true" />@{user.twitter_username}
                </a>
              )}
              <span className="d-flex align-items-center gd-gap-1">
                <FiCalendar size={14} aria-hidden="true" />
                Joined {formatDate(user.created_at)}
              </span>
            </div>

            <div className="d-flex flex-wrap gd-gap-3 gd-mt-4">
              <Link to={`${ROUTE_PATHS.FOLLOWERS}?user=${user.login}`} className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gd-gap-2">
                <FiUsers size={14} aria-hidden="true" /> Followers
              </Link>
              <Link to={`${ROUTE_PATHS.FOLLOWING}?user=${user.login}`} className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gd-gap-2">
                <FiUserCheck size={14} aria-hidden="true" /> Following
              </Link>
              <a
                href={user.html_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-sm d-inline-flex align-items-center gd-gap-2"
              >
                <FiExternalLink size={14} aria-hidden="true" /> View on GitHub
              </a>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gd-gap-2"
                onClick={() => exportData(buildUserSummary(user), `${user.login}-summary`, exportFormat)}
              >
                <FiDownload size={14} aria-hidden="true" /> Export {exportFormat.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      </div>

      <StatisticsCards stats={stats} />

      <section>
        <div className="gd-page-header">
          <h2>Repositories</h2>
          <Link to={`${ROUTE_PATHS.REPOSITORIES}?user=${user.login}`}>View all</Link>
        </div>
        {isReposLoading ? (
          <div className="gd-card d-flex justify-content-center">
            <Loader fullScreen={false} />
          </div>
        ) : reposData?.length === 0 ? (
          <div className="gd-card">
            <EmptyState icon={FiFolder} title="No public repositories" />
          </div>
        ) : (
          <div className="gd-card-grid">
            {reposData?.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default UserProfile;
