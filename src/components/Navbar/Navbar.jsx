import { useNavigate } from 'react-router-dom';
import { FiMenu, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import SearchBar from '../SearchBar/index.js';
import ThemeSwitcher from '../ThemeSwitcher/index.js';
import { ROUTE_PATHS } from '../../utils/constants.js';

function Navbar({ isSidebarCollapsed, onToggleCollapse, onToggleMobileSidebar }) {
  const navigate = useNavigate();

  function handleSearchSubmit(query) {
    navigate(`${ROUTE_PATHS.USERS}?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="gd-app-navbar d-flex align-items-center gd-gap-3 px-3">
      <button
        type="button"
        className="gd-btn-icon d-lg-none"
        aria-label="Open navigation menu"
        onClick={onToggleMobileSidebar}
      >
        <FiMenu size={18} aria-hidden="true" />
      </button>

      <button
        type="button"
        className="gd-btn-icon d-none d-lg-inline-flex"
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={onToggleCollapse}
      >
        {isSidebarCollapsed ? (
          <FiChevronsRight size={18} aria-hidden="true" />
        ) : (
          <FiChevronsLeft size={18} aria-hidden="true" />
        )}
      </button>

      <div className="d-none d-sm-flex flex-grow-1 gd-navbar-search">
        <SearchBar
          placeholder="Search GitHub users…"
          ariaLabel="Search GitHub users"
          onSubmit={handleSearchSubmit}
        />
      </div>

      <div className="ms-auto d-flex align-items-center gd-gap-3">
        <ThemeSwitcher />
      </div>
    </header>
  );
}

export default Navbar;
