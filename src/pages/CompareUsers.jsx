import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiUsers, FiRepeat } from 'react-icons/fi';
import { useGitHubApi } from '../hooks/useGitHubApi.js';
import { useSearchContext } from '../context/SearchContext.jsx';
import * as githubApi from '../services/githubApi.js';
import EmptyState from '../components/EmptyState/index.js';
import ErrorState from '../components/ErrorState/index.js';
import Loader from '../components/Loader/index.js';
import LanguageChart from '../components/LanguageChart/index.js';
import { formatCompactNumber, aggregateRepoLanguages } from '../utils/formatters.js';

function useUserComparison(username) {
  const profile = useGitHubApi((signal) => githubApi.getUser(username, signal), [username], {
    enabled: Boolean(username),
  });
  const repos = useGitHubApi(
    (signal) => githubApi.getUserRepos(username, { perPage: 100, sort: 'updated' }, signal),
    [username],
    { enabled: Boolean(profile.data) },
  );
  const totalStars = repos.data?.reduce((sum, repo) => sum + (repo.stargazers_count ?? 0), 0) ?? 0;
  const languages = aggregateRepoLanguages(repos.data ?? []);

  return { ...profile, totalStars, languages };
}

function UserColumn({ username, comparison }) {
  if (!username) {
    return (
      <div className="gd-card">
        <EmptyState icon={FiUsers} title="Enter a username" />
      </div>
    );
  }
  if (comparison.isLoading) {
    return (
      <div className="gd-card d-flex justify-content-center">
        <Loader fullScreen={false} />
      </div>
    );
  }
  if (comparison.error) {
    return (
      <div className="gd-card">
        <ErrorState
          title={comparison.error.status === 404 ? 'User not found' : 'Couldn’t load user'}
          description={comparison.error.status === 404 ? `There's no GitHub user named "${username}".` : comparison.error.message}
          onRetry={comparison.refetch}
        />
      </div>
    );
  }
  if (!comparison.data) return null;

  const user = comparison.data;
  return (
    <div className="gd-card d-flex flex-column align-items-center text-center gd-gap-2">
      <img src={user.avatar_url} alt="" className="gd-avatar gd-avatar--xl" />
      <div className="gd-card-title">{user.name || user.login}</div>
      <div className="gd-card-subtitle">@{user.login}</div>
      {comparison.languages.length > 0 && (
        <LanguageChart
          type="doughnut"
          labels={comparison.languages.slice(0, 6).map(([name]) => name)}
          values={comparison.languages.slice(0, 6).map(([, count]) => count)}
        />
      )}
    </div>
  );
}

function comparisonRow(label, valueA, valueB) {
  const aWins = valueA > valueB;
  const bWins = valueB > valueA;
  return (
    <tr key={label}>
      <td className="gd-text-secondary">{label}</td>
      <td className={aWins ? 'gd-compare-winner' : undefined}>{formatCompactNumber(valueA)}</td>
      <td className={bWins ? 'gd-compare-winner' : undefined}>{formatCompactNumber(valueB)}</td>
    </tr>
  );
}

function CompareUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const usernameA = searchParams.get('userA') ?? '';
  const usernameB = searchParams.get('userB') ?? '';

  const [inputA, setInputA] = useState(usernameA);
  const [inputB, setInputB] = useState(usernameB);
  const { addCompareEntry } = useSearchContext();

  useEffect(() => {
    setInputA(usernameA);
    setInputB(usernameB);
  }, [usernameA, usernameB]);

  const comparisonA = useUserComparison(usernameA);
  const comparisonB = useUserComparison(usernameB);

  useEffect(() => {
    if (comparisonA.data && comparisonB.data) {
      addCompareEntry({
        id: `${comparisonA.data.login}-vs-${comparisonB.data.login}`,
        users: [comparisonA.data.login, comparisonB.data.login],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparisonA.data, comparisonB.data]);

  function handleSubmit(event) {
    event.preventDefault();
    if (inputA.trim() && inputB.trim()) {
      setSearchParams({ userA: inputA.trim(), userB: inputB.trim() });
    }
  }

  const bothLoaded = Boolean(comparisonA.data && comparisonB.data);

  return (
    <div>
      <div className="gd-page-header">
        <h1>Compare Users</h1>
      </div>

      <form onSubmit={handleSubmit} className="d-flex flex-wrap align-items-center gd-gap-2 gd-mb-6">
        <label htmlFor="gd-compare-a" className="visually-hidden">
          First username
        </label>
        <input
          id="gd-compare-a"
          type="text"
          value={inputA}
          onChange={(event) => setInputA(event.target.value)}
          placeholder="First username…"
          className="form-control gd-max-w-input"
        />
        <FiRepeat aria-hidden="true" className="gd-text-muted" />
        <label htmlFor="gd-compare-b" className="visually-hidden">
          Second username
        </label>
        <input
          id="gd-compare-b"
          type="text"
          value={inputB}
          onChange={(event) => setInputB(event.target.value)}
          placeholder="Second username…"
          className="form-control gd-max-w-input"
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Compare
        </button>
      </form>

      {!usernameA && !usernameB ? (
        <div className="gd-card">
          <EmptyState icon={FiRepeat} title="Compare two GitHub users" description="Enter two usernames above to get started." />
        </div>
      ) : (
        <>
          <div className="gd-compare-layout gd-mb-6">
            <UserColumn username={usernameA} comparison={comparisonA} />
            <UserColumn username={usernameB} comparison={comparisonB} />
          </div>

          {bothLoaded && (
            <div className="gd-card gd-table-responsive">
              <table className="table align-middle gd-mb-0">
                <thead>
                  <tr>
                    <th scope="col">Metric</th>
                    <th scope="col">@{comparisonA.data.login}</th>
                    <th scope="col">@{comparisonB.data.login}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRow('Followers', comparisonA.data.followers, comparisonB.data.followers)}
                  {comparisonRow('Following', comparisonA.data.following, comparisonB.data.following)}
                  {comparisonRow('Public Repos', comparisonA.data.public_repos, comparisonB.data.public_repos)}
                  {comparisonRow('Total Stars', comparisonA.totalStars, comparisonB.totalStars)}
                  {comparisonRow('Languages Used', comparisonA.languages.length, comparisonB.languages.length)}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CompareUsers;
