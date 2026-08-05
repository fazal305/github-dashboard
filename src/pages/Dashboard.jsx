import { Link } from 'react-router-dom';
import { FiUsers, FiFolder, FiRepeat, FiActivity, FiTrendingUp, FiSearch, FiPieChart, FiStar } from 'react-icons/fi';
import { useSearchContext } from '../context/SearchContext.jsx';
import { useGitHubApi } from '../hooks/useGitHubApi.js';
import * as githubApi from '../services/githubApi.js';
import StatisticsCards from '../components/StatisticsCards/index.js';
import UserCard from '../components/UserCard/index.js';
import RepoCard from '../components/RepoCard/index.js';
import EmptyState from '../components/EmptyState/index.js';
import ErrorState from '../components/ErrorState/index.js';
import Loader from '../components/Loader/index.js';
import { ROUTE_PATHS } from '../utils/constants.js';

const QUICK_LINKS = [
  { label: 'Search Users', path: ROUTE_PATHS.USERS, icon: FiUsers },
  { label: 'Explore Repositories', path: ROUTE_PATHS.REPOSITORIES, icon: FiFolder },
  { label: 'Search Repositories', path: ROUTE_PATHS.SEARCH, icon: FiSearch },
  { label: 'Language Analytics', path: ROUTE_PATHS.LANGUAGES, icon: FiPieChart },
  { label: 'Compare Users', path: ROUTE_PATHS.COMPARE, icon: FiRepeat },
  { label: 'Starred Repositories', path: ROUTE_PATHS.STARRED, icon: FiStar },
];

function trendingQuery() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return `created:>${sevenDaysAgo} stars:>50`;
}

function Dashboard() {
  const { recentUsers, recentRepos, compareHistory } = useSearchContext();

  const { data: rateLimitData } = useGitHubApi((signal) => githubApi.getRateLimit(signal), []);

  const {
    data: trendingData,
    error: trendingError,
    isLoading: isTrendingLoading,
    refetch: refetchTrending,
  } = useGitHubApi(
    (signal) => githubApi.searchRepositories(trendingQuery(), { sort: 'stars', order: 'desc', perPage: 6 }, signal),
    [],
  );

  const stats = [
    { id: 'users', label: 'Recent Users', value: recentUsers.length, icon: FiUsers },
    { id: 'repos', label: 'Recent Repos', value: recentRepos.length, icon: FiFolder },
    { id: 'compares', label: 'Comparisons', value: compareHistory.length, icon: FiRepeat },
    { id: 'rate', label: 'API Requests Left', value: rateLimitData?.rate?.remaining ?? '—', icon: FiActivity },
  ];

  return (
    <div>
      <div className="gd-page-header">
        <h1>Dashboard</h1>
      </div>

      <StatisticsCards stats={stats} />

      <section className="gd-mb-6">
        <div className="gd-page-header">
          <h2>Quick Navigation</h2>
        </div>
        <div className="gd-card-grid">
          {QUICK_LINKS.map(({ label, path, icon: Icon }) => (
            <Link key={path} to={path} className="gd-card gd-card--interactive text-decoration-none d-flex align-items-center gd-gap-3">
              <span className="gd-stat-card__icon">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="gd-fw-medium gd-text-base">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="gd-mb-6">
        <div className="gd-page-header">
          <h2>Recently Viewed Users</h2>
          {recentUsers.length > 0 && <Link to={ROUTE_PATHS.USERS}>View all</Link>}
        </div>
        {recentUsers.length === 0 ? (
          <div className="gd-card">
            <EmptyState
              icon={FiUsers}
              title="No recent users"
              description="Search for a GitHub user to see them appear here."
            />
          </div>
        ) : (
          <div className="gd-card-grid">
            {recentUsers.slice(0, 4).map((user) => (
              <UserCard key={user.login} user={user} />
            ))}
          </div>
        )}
      </section>

      <section className="gd-mb-6">
        <div className="gd-page-header">
          <h2>Recently Viewed Repositories</h2>
          {recentRepos.length > 0 && <Link to={ROUTE_PATHS.REPOSITORIES}>View all</Link>}
        </div>
        {recentRepos.length === 0 ? (
          <div className="gd-card">
            <EmptyState
              icon={FiFolder}
              title="No recent repositories"
              description="Browse a repository to see it appear here."
            />
          </div>
        ) : (
          <div className="gd-card-grid">
            {recentRepos.slice(0, 4).map((repo) => (
              <RepoCard key={repo.id ?? repo.full_name} repo={repo} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="gd-page-header">
          <h2 className="d-flex align-items-center gd-gap-2">
            <FiTrendingUp aria-hidden="true" /> Trending Repositories
          </h2>
        </div>
        {isTrendingLoading ? (
          <div className="gd-card d-flex justify-content-center">
            <Loader fullScreen={false} />
          </div>
        ) : trendingError ? (
          <div className="gd-card">
            <ErrorState description="Couldn't load trending repositories." onRetry={refetchTrending} />
          </div>
        ) : trendingData?.items?.length ? (
          <div className="gd-card-grid">
            {trendingData.items.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        ) : (
          <div className="gd-card">
            <EmptyState icon={FiTrendingUp} title="No trending repositories found" />
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
