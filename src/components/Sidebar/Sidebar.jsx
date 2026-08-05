import { NavLink } from 'react-router-dom';
import { SiGithub } from 'react-icons/si';
import {
  FiGrid,
  FiUsers,
  FiFolder,
  FiSearch,
  FiPieChart,
  FiRepeat,
  FiUserPlus,
  FiUserCheck,
  FiStar,
  FiActivity,
  FiBriefcase,
  FiSettings,
} from 'react-icons/fi';
import { APP_NAME, NAV_ITEMS } from '../../utils/constants.js';

const ICONS = {
  dashboard: FiGrid,
  users: FiUsers,
  repositories: FiFolder,
  search: FiSearch,
  languages: FiPieChart,
  compare: FiRepeat,
  followers: FiUserPlus,
  following: FiUserCheck,
  starred: FiStar,
  activity: FiActivity,
  organizations: FiBriefcase,
  settings: FiSettings,
};

function Sidebar({ isCollapsed, onNavigate }) {
  return (
    <nav className="gd-app-sidebar" aria-label="Primary">
      <div className="d-flex align-items-center gd-gap-2 px-3" style={{ height: 'var(--navbar-height)' }}>
        <SiGithub size={24} aria-hidden="true" className="gd-text-primary flex-shrink-0" />
        {!isCollapsed && <span className="gd-fw-semibold gd-truncate">{APP_NAME}</span>}
      </div>

      <ul className="d-flex flex-column gd-gap-1 px-2">
        {NAV_ITEMS.map(({ label, path, icon, end }) => {
          const Icon = ICONS[icon];
          return (
            <li key={path}>
              <NavLink
                to={path}
                end={end}
                onClick={onNavigate}
                title={isCollapsed ? label : undefined}
                aria-label={isCollapsed ? label : undefined}
                className={({ isActive }) =>
                  `d-flex align-items-center gd-gap-3 gd-rounded-md gd-p-2 gd-text-sm gd-fw-medium text-decoration-none gd-transition${
                    isActive ? ' gd-nav-link--active' : ' gd-nav-link'
                  }`
                }
              >
                <Icon size={18} aria-hidden="true" className="flex-shrink-0" />
                {!isCollapsed && <span className="gd-truncate">{label}</span>}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default Sidebar;
