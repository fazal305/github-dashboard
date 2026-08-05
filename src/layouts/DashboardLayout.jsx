import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar/index.js';
import Sidebar from '../components/Sidebar/index.js';
import Footer from '../components/Footer/index.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { STORAGE_KEYS } from '../utils/constants.js';

function DashboardLayout() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useLocalStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const shellClassName = [
    'gd-app-shell',
    isCollapsed ? 'gd-sidebar-collapsed' : '',
    isMobileOpen ? 'gd-sidebar-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClassName}>
      <a href="#gd-main-content" className="visually-hidden-focusable gd-skip-link">
        Skip to main content
      </a>

      <Navbar
        isSidebarCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        onToggleMobileSidebar={() => setIsMobileOpen((prev) => !prev)}
      />

      <Sidebar isCollapsed={isCollapsed} onNavigate={() => setIsMobileOpen(false)} />

      <div className="gd-sidebar-backdrop" onClick={() => setIsMobileOpen(false)} aria-hidden="true" />

      <main id="gd-main-content" className="gd-app-main" tabIndex={-1}>
        <div key={location.pathname} className="gd-page-container gd-page-transition">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default DashboardLayout;
