import { memo } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiGitBranch } from 'react-icons/fi';
import { buildRepositoryDetailsPath, DEFAULT_LANGUAGE_COLOR, LANGUAGE_COLORS } from '../../utils/constants.js';
import { formatCompactNumber, formatRelativeTime } from '../../utils/formatters.js';

function RepoCard({ repo }) {
  const {
    name,
    owner,
    description,
    language,
    stargazers_count: stars,
    forks_count: forks,
    topics = [],
    updated_at: updatedAt,
  } = repo;

  const ownerLogin = owner?.login;
  const languageColor = language ? LANGUAGE_COLORS[language] ?? DEFAULT_LANGUAGE_COLOR : null;

  return (
    <Link
      to={buildRepositoryDetailsPath(ownerLogin, name)}
      className="gd-card gd-card--interactive text-decoration-none d-flex flex-column gd-gap-3"
    >
      <div>
        <div className="gd-card-title gd-truncate">{name}</div>
        {ownerLogin && <div className="gd-card-subtitle gd-truncate">{ownerLogin}</div>}
      </div>

      {description && <p className="gd-text-secondary gd-text-sm gd-line-clamp-2 gd-mb-0">{description}</p>}

      {topics.length > 0 && (
        <div className="d-flex flex-wrap gd-gap-2">
          {topics.slice(0, 4).map((topic) => (
            <span key={topic} className="gd-badge gd-badge--primary">
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="d-flex flex-wrap align-items-center gd-gap-3 gd-text-sm gd-text-muted mt-auto">
        {language && (
          <span className="d-flex align-items-center gd-gap-1">
            <span className="gd-lang-dot" style={{ backgroundColor: languageColor }} aria-hidden="true" />
            {language}
          </span>
        )}
        <span className="d-flex align-items-center gd-gap-1">
          <FiStar size={14} aria-hidden="true" />
          {formatCompactNumber(stars)}
        </span>
        <span className="d-flex align-items-center gd-gap-1">
          <FiGitBranch size={14} aria-hidden="true" />
          {formatCompactNumber(forks)}
        </span>
        {updatedAt && <span className="ms-auto">Updated {formatRelativeTime(updatedAt)}</span>}
      </div>
    </Link>
  );
}

export default memo(RepoCard);
