import { Link } from 'react-router-dom';
import { FiStar, FiGitBranch, FiAlertCircle, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { buildRepositoryDetailsPath, DEFAULT_LANGUAGE_COLOR, LANGUAGE_COLORS } from '../../utils/constants.js';
import { formatCompactNumber, formatRelativeTime } from '../../utils/formatters.js';

const COLUMNS = [
  { key: 'name', label: 'Repository', sortable: false },
  { key: 'language', label: 'Language', sortable: true },
  { key: 'stargazers_count', label: 'Stars', sortable: true },
  { key: 'forks_count', label: 'Forks', sortable: true },
  { key: 'open_issues_count', label: 'Issues', sortable: true },
  { key: 'license', label: 'License', sortable: false },
  { key: 'updated_at', label: 'Updated', sortable: true },
];

function SortableHeader({ column, sortKey, sortDirection, onSortChange }) {
  if (!column.sortable || !onSortChange) {
    return <th scope="col">{column.label}</th>;
  }

  const isActive = sortKey === column.key;
  const ariaSort = isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none';

  return (
    <th scope="col" aria-sort={ariaSort}>
      <button
        type="button"
        className="btn btn-link p-0 text-decoration-none d-flex align-items-center gd-gap-1 gd-text-secondary gd-fw-semibold"
        onClick={() => onSortChange(column.key)}
      >
        {column.label}
        {isActive && (sortDirection === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />)}
      </button>
    </th>
  );
}

function RepositoryTable({ repos = [], sortKey, sortDirection, onSortChange }) {
  return (
    <div className="gd-table-responsive">
      <table className="table table-hover align-middle">
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <SortableHeader
                key={column.key}
                column={column}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSortChange={onSortChange}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {repos.map((repo) => {
            const languageColor = repo.language ? LANGUAGE_COLORS[repo.language] ?? DEFAULT_LANGUAGE_COLOR : null;
            return (
              <tr key={repo.id ?? repo.full_name}>
                <td>
                  <Link
                    to={buildRepositoryDetailsPath(repo.owner?.login, repo.name)}
                    className="gd-fw-medium text-decoration-none"
                  >
                    {repo.full_name ?? repo.name}
                  </Link>
                </td>
                <td>
                  {repo.language ? (
                    <span className="d-flex align-items-center gd-gap-2 gd-text-sm">
                      <span className="gd-lang-dot" style={{ backgroundColor: languageColor }} aria-hidden="true" />
                      {repo.language}
                    </span>
                  ) : (
                    <span className="gd-text-muted gd-text-sm">—</span>
                  )}
                </td>
                <td>
                  <span className="d-flex align-items-center gd-gap-1 gd-text-sm">
                    <FiStar size={14} aria-hidden="true" />
                    {formatCompactNumber(repo.stargazers_count)}
                  </span>
                </td>
                <td>
                  <span className="d-flex align-items-center gd-gap-1 gd-text-sm">
                    <FiGitBranch size={14} aria-hidden="true" />
                    {formatCompactNumber(repo.forks_count)}
                  </span>
                </td>
                <td>
                  <span className="d-flex align-items-center gd-gap-1 gd-text-sm">
                    <FiAlertCircle size={14} aria-hidden="true" />
                    {formatCompactNumber(repo.open_issues_count)}
                  </span>
                </td>
                <td className="gd-text-sm gd-text-muted">{repo.license?.spdx_id ?? repo.license?.name ?? '—'}</td>
                <td className="gd-text-sm gd-text-muted">{formatRelativeTime(repo.updated_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default RepositoryTable;
