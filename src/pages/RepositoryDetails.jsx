import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FiStar,
  FiGitBranch,
  FiEye,
  FiAlertCircle,
  FiFileText,
  FiCalendar,
  FiExternalLink,
  FiGlobe,
  FiUser,
} from 'react-icons/fi';
import { useGitHubApi } from '../hooks/useGitHubApi.js';
import { useSearchContext } from '../context/SearchContext.jsx';
import * as githubApi from '../services/githubApi.js';
import Breadcrumb from '../components/Breadcrumb/index.js';
import StatisticsCards from '../components/StatisticsCards/index.js';
import LanguageChart from '../components/LanguageChart/index.js';
import ErrorState from '../components/ErrorState/index.js';
import Loader from '../components/Loader/index.js';
import { buildUserProfilePath, DEFAULT_LANGUAGE_COLOR, LANGUAGE_COLORS, ROUTE_PATHS } from '../utils/constants.js';
import { formatCompactNumber, formatDate } from '../utils/formatters.js';

function RepositoryDetails() {
  const { owner, repo } = useParams();
  const { addRecentRepo } = useSearchContext();

  const {
    data: repository,
    error,
    isLoading,
    refetch,
  } = useGitHubApi((signal) => githubApi.getRepo(owner, repo, signal), [owner, repo]);

  const { data: languages } = useGitHubApi(
    (signal) => githubApi.getRepoLanguages(owner, repo, signal),
    [owner, repo],
    { enabled: Boolean(repository) },
  );

  useEffect(() => {
    if (repository) addRecentRepo(repository);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repository]);

  if (isLoading) {
    return (
      <div className="gd-card d-flex justify-content-center">
        <Loader fullScreen={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="gd-card">
        <ErrorState
          title={error.status === 404 ? 'Repository not found' : 'Couldn’t load this repository'}
          description={error.status === 404 ? `There's no repository at "${owner}/${repo}".` : error.message}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!repository) return null;

  const languageEntries = languages ? Object.entries(languages) : [];
  const stats = [
    { id: 'stars', label: 'Stars', value: repository.stargazers_count, icon: FiStar },
    { id: 'forks', label: 'Forks', value: repository.forks_count, icon: FiGitBranch },
    { id: 'watchers', label: 'Watchers', value: repository.watchers_count, icon: FiEye },
    { id: 'issues', label: 'Open Issues', value: repository.open_issues_count, icon: FiAlertCircle },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: ROUTE_PATHS.DASHBOARD },
          { label: 'Repositories', path: ROUTE_PATHS.REPOSITORIES },
          { label: repository.full_name },
        ]}
      />

      <div className="gd-card gd-mb-6">
        <div className="d-flex flex-wrap justify-content-between align-items-start gd-gap-3">
          <div>
            <h1 className="gd-mb-1">{repository.full_name}</h1>
            <Link to={buildUserProfilePath(owner)} className="d-flex align-items-center gd-gap-1 gd-text-sm">
              <FiUser size={14} aria-hidden="true" />@{owner}
            </Link>
          </div>
          <a href={repository.html_url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm d-inline-flex align-items-center gd-gap-2">
            <FiExternalLink size={14} aria-hidden="true" /> View on GitHub
          </a>
        </div>

        {repository.description && <p className="gd-mt-3 gd-mb-0">{repository.description}</p>}

        {repository.topics?.length > 0 && (
          <div className="d-flex flex-wrap gd-gap-2 gd-mt-3">
            {repository.topics.map((topic) => (
              <span key={topic} className="gd-badge gd-badge--primary">
                {topic}
              </span>
            ))}
          </div>
        )}

        <div className="d-flex flex-wrap gd-gap-3 gd-text-sm gd-text-secondary gd-mt-3">
          {repository.language && (
            <span className="d-flex align-items-center gd-gap-1">
              <span
                className="gd-lang-dot"
                style={{ backgroundColor: LANGUAGE_COLORS[repository.language] ?? DEFAULT_LANGUAGE_COLOR }}
                aria-hidden="true"
              />
              {repository.language}
            </span>
          )}
          {repository.license && (
            <span className="d-flex align-items-center gd-gap-1">
              <FiFileText size={14} aria-hidden="true" />
              {repository.license.spdx_id ?? repository.license.name}
            </span>
          )}
          {repository.homepage && (
            <a href={repository.homepage} target="_blank" rel="noreferrer" className="d-flex align-items-center gd-gap-1">
              <FiGlobe size={14} aria-hidden="true" />
              {repository.homepage}
            </a>
          )}
          <span className="d-flex align-items-center gd-gap-1">
            <FiCalendar size={14} aria-hidden="true" />
            Updated {formatDate(repository.updated_at)}
          </span>
        </div>
      </div>

      <StatisticsCards stats={stats} />

      {languageEntries.length > 0 && (
        <section className="gd-card">
          <h2 className="gd-mb-4">Language Breakdown</h2>
          <div className="gd-split-layout">
            <LanguageChart
              type="doughnut"
              labels={languageEntries.map(([name]) => name)}
              values={languageEntries.map(([, bytes]) => bytes)}
            />
            <ul className="d-flex flex-column gd-gap-2">
              {languageEntries.map(([name, bytes]) => {
                const total = languageEntries.reduce((sum, [, value]) => sum + value, 0);
                const percentage = ((bytes / total) * 100).toFixed(1);
                return (
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
                      {percentage}% · {formatCompactNumber(bytes)} bytes
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

export default RepositoryDetails;
