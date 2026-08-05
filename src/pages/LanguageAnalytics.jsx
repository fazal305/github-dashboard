import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiPieChart, FiBarChart2, FiDisc, FiFolder, FiStar, FiCode, FiDownload } from 'react-icons/fi';
import { useGitHubApi } from '../hooks/useGitHubApi.js';
import { useSearchContext } from '../context/SearchContext.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import * as githubApi from '../services/githubApi.js';
import Breadcrumb from '../components/Breadcrumb/index.js';
import StatisticsCards from '../components/StatisticsCards/index.js';
import LanguageChart from '../components/LanguageChart/index.js';
import EmptyState from '../components/EmptyState/index.js';
import ErrorState from '../components/ErrorState/index.js';
import Loader from '../components/Loader/index.js';
import { DEFAULT_LANGUAGE_COLOR, LANGUAGE_COLORS, ROUTE_PATHS, STORAGE_KEYS } from '../utils/constants.js';
import { aggregateRepoLanguages } from '../utils/formatters.js';
import { exportData } from '../utils/export.js';

const CHART_TYPES = [
  { value: 'doughnut', label: 'Doughnut', icon: FiDisc },
  { value: 'pie', label: 'Pie', icon: FiPieChart },
  { value: 'bar', label: 'Bar', icon: FiBarChart2 },
];
const MAX_CHART_SLICES = 8;

function LanguageAnalytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { recentUsers } = useSearchContext();
  const activeUser = searchParams.get('user') || recentUsers[0]?.login || '';

  const [userInput, setUserInput] = useState(activeUser);
  const [chartType, setChartType] = useState('doughnut');
  const [exportFormat] = useLocalStorage(STORAGE_KEYS.EXPORT_FORMAT, 'json');

  useEffect(() => {
    setUserInput(activeUser);
  }, [activeUser]);

  const { data: repos, error, isLoading, refetch } = useGitHubApi(
    (signal) => githubApi.getUserRepos(activeUser, { perPage: 100, sort: 'updated' }, signal),
    [activeUser],
    { enabled: Boolean(activeUser) },
  );

  const languageStats = useMemo(() => aggregateRepoLanguages(repos ?? []), [repos]);
  const totalClassified = languageStats.reduce((sum, [, count]) => sum + count, 0);

  const chartData = useMemo(() => {
    if (languageStats.length <= MAX_CHART_SLICES) return languageStats;
    const top = languageStats.slice(0, MAX_CHART_SLICES);
    const otherCount = languageStats.slice(MAX_CHART_SLICES).reduce((sum, [, count]) => sum + count, 0);
    return [...top, ['Other', otherCount]];
  }, [languageStats]);

  function handleUserSubmit(event) {
    event.preventDefault();
    if (userInput.trim()) setSearchParams({ user: userInput.trim() });
  }

  const stats = [
    { id: 'repos', label: 'Total Repositories', value: repos?.length ?? 0, icon: FiFolder },
    { id: 'languages', label: 'Languages Used', value: languageStats.length, icon: FiCode },
    { id: 'top', label: 'Top Language', value: languageStats[0]?.[0] ?? '—', icon: FiPieChart },
    {
      id: 'stars',
      label: 'Total Stars',
      value: repos?.reduce((sum, repo) => sum + (repo.stargazers_count ?? 0), 0) ?? 0,
      icon: FiStar,
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Dashboard', path: ROUTE_PATHS.DASHBOARD }, { label: 'Language Analytics' }]} />

      <div className="gd-page-header">
        <h1>Language Analytics</h1>
      </div>

      <form onSubmit={handleUserSubmit} className="d-flex flex-wrap gd-gap-2 gd-mb-6">
        <label htmlFor="gd-lang-user" className="visually-hidden">
          GitHub username
        </label>
        <input
          id="gd-lang-user"
          type="text"
          value={userInput}
          onChange={(event) => setUserInput(event.target.value)}
          placeholder="Enter a GitHub username…"
          className="form-control gd-max-w-input"
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Analyze
        </button>
      </form>

      {!activeUser ? (
        <div className="gd-card">
          <EmptyState
            icon={FiPieChart}
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
      ) : languageStats.length === 0 ? (
        <div className="gd-card">
          <EmptyState icon={FiCode} title="No language data" description={`@${activeUser}'s repositories have no detected language.`} />
        </div>
      ) : (
        <>
          <StatisticsCards stats={stats} />

          <div className="gd-card">
            <div className="gd-page-header">
              <h2>Repositories by Language</h2>
              <div className="d-flex gd-gap-2">
                <div className="btn-group" role="group" aria-label="Chart type">
                  {CHART_TYPES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      className={`btn btn-outline-secondary btn-sm${chartType === value ? ' active' : ''}`}
                      aria-pressed={chartType === value}
                      onClick={() => setChartType(value)}
                    >
                      <span className="d-inline-flex align-items-center gd-gap-1">
                        <Icon size={14} aria-hidden="true" /> {label}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gd-gap-2"
                  onClick={() =>
                    exportData(
                      languageStats.map(([name, count]) => ({
                        language: name,
                        repositories: count,
                        percentage: Number(((count / totalClassified) * 100).toFixed(1)),
                      })),
                      `${activeUser}-language-stats`,
                      exportFormat,
                    )
                  }
                >
                  <FiDownload size={14} aria-hidden="true" /> Export {exportFormat.toUpperCase()}
                </button>
              </div>
            </div>

            <div className="gd-split-layout">
              <LanguageChart
                type={chartType}
                labels={chartData.map(([name]) => name)}
                values={chartData.map(([, count]) => count)}
              />

              <ul className="d-flex flex-column gd-gap-2">
                {languageStats.map(([name, count]) => (
                  <li key={name} className="d-flex align-items-center justify-content-between gd-text-sm">
                    <span className="d-flex align-items-center gd-gap-2">
                      <span
                        className="gd-lang-dot"
                        style={{ backgroundColor: LANGUAGE_COLORS[name] ?? DEFAULT_LANGUAGE_COLOR }}
                        aria-hidden="true"
                      />
                      {name}
                    </span>
                    <span className="gd-text-muted">
                      {count} {count === 1 ? 'repo' : 'repos'} · {((count / totalClassified) * 100).toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default LanguageAnalytics;
