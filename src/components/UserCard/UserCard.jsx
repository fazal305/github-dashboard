import { memo } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiFolder, FiMapPin } from 'react-icons/fi';
import { buildUserProfilePath } from '../../utils/constants.js';
import { formatCompactNumber } from '../../utils/formatters.js';

function UserCard({ user }) {
  const { login, avatar_url: avatarUrl, name, bio, followers, public_repos: publicRepos, location } = user;

  return (
    <Link
      to={buildUserProfilePath(login)}
      className="gd-card gd-card--interactive text-decoration-none d-flex flex-column gd-gap-3"
    >
      <div className="d-flex align-items-center gd-gap-3">
        <img src={avatarUrl} alt="" className="gd-avatar gd-avatar--lg" loading="lazy" />
        <div className="gd-min-w-0">
          <div className="gd-card-title gd-truncate">{name || login}</div>
          <div className="gd-card-subtitle gd-truncate">@{login}</div>
        </div>
      </div>

      {bio && <p className="gd-text-secondary gd-text-sm gd-line-clamp-2 gd-mb-0">{bio}</p>}

      <div className="d-flex flex-wrap gd-gap-3 gd-text-sm gd-text-muted mt-auto">
        {followers !== undefined && (
          <span className="d-flex align-items-center gd-gap-1">
            <FiUsers size={14} aria-hidden="true" />
            {formatCompactNumber(followers)} followers
          </span>
        )}
        {publicRepos !== undefined && (
          <span className="d-flex align-items-center gd-gap-1">
            <FiFolder size={14} aria-hidden="true" />
            {formatCompactNumber(publicRepos)} repos
          </span>
        )}
        {location && (
          <span className="d-flex align-items-center gd-gap-1 gd-truncate">
            <FiMapPin size={14} aria-hidden="true" />
            {location}
          </span>
        )}
      </div>
    </Link>
  );
}

export default memo(UserCard);
