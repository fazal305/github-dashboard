import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiBriefcase, FiMapPin, FiLink2, FiExternalLink, FiUsers, FiFolder } from 'react-icons/fi';
import { useGitHubApi } from '../hooks/useGitHubApi.js';
import { useSearchContext } from '../context/SearchContext.jsx';
import * as githubApi from '../services/githubApi.js';
import Breadcrumb from '../components/Breadcrumb/index.js';
import StatisticsCards from '../components/StatisticsCards/index.js';
import RepoCard from '../components/RepoCard/index.js';
import UserCard from '../components/UserCard/index.js';
import EmptyState from '../components/EmptyState/index.js';
import ErrorState from '../components/ErrorState/index.js';
import Loader from '../components/Loader/index.js';
import { ROUTE_PATHS } from '../utils/constants.js';

function OrgPicker({ activeUser }) {
  const [orgInput, setOrgInput] = useState('');
  const [, setSearchParams] = useSearchParams();

  const { data: orgs, isLoading } = useGitHubApi(
    (signal) => githubApi.getUserOrgs(activeUser, signal),
    [activeUser],
    { enabled: Boolean(activeUser) },
  );

  function handleSubmit(event) {
    event.preventDefault();
    if (orgInput.trim()) setSearchParams({ org: orgInput.trim() });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="d-flex flex-wrap gd-gap-2 gd-mb-6">
        <label htmlFor="gd-org-input" className="visually-hidden">
          Organization name
        </label>
        <input
          id="gd-org-input"
          type="text"
          value={orgInput}
          onChange={(event) => setOrgInput(event.target.value)}
          placeholder="Enter an organization name…"
          className="form-control gd-max-w-input"
        />
        <button type="submit" className="btn btn-primary btn-sm">
          View Organization
        </button>
      </form>

      {activeUser && (
        <>
          <h2 className="gd-mb-3">@{activeUser}'s Organizations</h2>
          {isLoading ? (
            <div className="gd-card d-flex justify-content-center">
              <Loader fullScreen={false} />
            </div>
          ) : orgs?.length === 0 ? (
            <div className="gd-card">
              <EmptyState icon={FiBriefcase} title="No organizations" description={`@${activeUser} isn't a member of any public organizations.`} />
            </div>
          ) : (
            <div className="gd-card-grid">
              {orgs?.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  className="gd-card gd-card--interactive text-decoration-none d-flex align-items-center gd-gap-3 text-start border-0"
                  onClick={() => setSearchParams({ org: org.login })}
                >
                  <img src={org.avatar_url} alt="" className="gd-avatar gd-avatar--md" />
                  <span className="gd-fw-medium">{org.login}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {!activeUser && (
        <div className="gd-card">
          <EmptyState
            icon={FiBriefcase}
            title="No organization selected"
            description="Enter an organization name above, or search for a user first to see their organizations."
          />
        </div>
      )}
    </div>
  );
}

function OrganizationDetails({ org: orgLogin }) {
  const { data: org, error, isLoading, refetch } = useGitHubApi((signal) => githubApi.getOrg(orgLogin, signal), [orgLogin]);

  const { data: repos, isLoading: isReposLoading } = useGitHubApi(
    (signal) => githubApi.getOrgRepos(orgLogin, { perPage: 12 }, signal),
    [orgLogin],
    { enabled: Boolean(org) },
  );

  const { data: members, isLoading: isMembersLoading } = useGitHubApi(
    (signal) => githubApi.getOrgMembers(orgLogin, { perPage: 12 }, signal),
    [orgLogin],
    { enabled: Boolean(org) },
  );

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
          title={error.status === 404 ? 'Organization not found' : 'Couldn’t load this organization'}
          description={error.status === 404 ? `There's no GitHub organization named "${orgLogin}".` : error.message}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!org) return null;

  const stats = [
    { id: 'repos', label: 'Public Repos', value: org.public_repos, icon: FiFolder },
    { id: 'followers', label: 'Followers', value: org.followers, icon: FiUsers },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: ROUTE_PATHS.DASHBOARD },
          { label: 'Organizations', path: ROUTE_PATHS.ORGANIZATIONS },
          { label: org.login },
        ]}
      />

      <div className="gd-card gd-mb-6">
        <div className="d-flex flex-wrap gd-gap-4">
          <img src={org.avatar_url} alt="" className="gd-avatar gd-avatar--xl" />
          <div className="flex-grow-1 gd-min-w-0">
            <h1 className="gd-mb-1">{org.name || org.login}</h1>
            <p className="gd-text-secondary gd-mb-2">@{org.login}</p>
            {org.description && <p className="gd-mb-3">{org.description}</p>}
            <div className="d-flex flex-wrap gd-gap-3 gd-text-sm gd-text-secondary gd-mb-3">
              {org.location && (
                <span className="d-flex align-items-center gd-gap-1">
                  <FiMapPin size={14} aria-hidden="true" />
                  {org.location}
                </span>
              )}
              {org.blog && (
                <a href={org.blog.startsWith('http') ? org.blog : `https://${org.blog}`} target="_blank" rel="noreferrer" className="d-flex align-items-center gd-gap-1">
                  <FiLink2 size={14} aria-hidden="true" />
                  {org.blog}
                </a>
              )}
            </div>
            <a href={org.html_url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm d-inline-flex align-items-center gd-gap-2">
              <FiExternalLink size={14} aria-hidden="true" /> View on GitHub
            </a>
          </div>
        </div>
      </div>

      <StatisticsCards stats={stats} />

      <section className="gd-mb-6">
        <div className="gd-page-header">
          <h2>Repositories</h2>
        </div>
        {isReposLoading ? (
          <div className="gd-card d-flex justify-content-center">
            <Loader fullScreen={false} />
          </div>
        ) : repos?.length === 0 ? (
          <div className="gd-card">
            <EmptyState icon={FiFolder} title="No public repositories" />
          </div>
        ) : (
          <div className="gd-card-grid">
            {repos?.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="gd-page-header">
          <h2>Members</h2>
        </div>
        {isMembersLoading ? (
          <div className="gd-card d-flex justify-content-center">
            <Loader fullScreen={false} />
          </div>
        ) : members?.length === 0 ? (
          <div className="gd-card">
            <EmptyState icon={FiUsers} title="Members not available" description="This organization's member list is private." />
          </div>
        ) : (
          <div className="gd-card-grid">
            {members?.map((member) => (
              <UserCard key={member.id} user={member} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Organizations() {
  const [searchParams] = useSearchParams();
  const { recentUsers } = useSearchContext();
  const orgLogin = searchParams.get('org') ?? '';
  const activeUser = recentUsers[0]?.login ?? '';

  return (
    <div>
      {!orgLogin && (
        <div className="gd-page-header">
          <h1>Organizations</h1>
        </div>
      )}
      {orgLogin ? <OrganizationDetails org={orgLogin} /> : <OrgPicker activeUser={activeUser} />}
    </div>
  );
}

export default Organizations;
