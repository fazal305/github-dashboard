import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Loader from '../components/Loader/index.js';
import { ROUTE_PATHS } from '../utils/constants.js';

const Dashboard = lazy(() => import('../pages/Dashboard.jsx'));
const UserSearch = lazy(() => import('../pages/UserSearch.jsx'));
const UserProfile = lazy(() => import('../pages/UserProfile.jsx'));
const Repositories = lazy(() => import('../pages/Repositories.jsx'));
const RepositoryDetails = lazy(() => import('../pages/RepositoryDetails.jsx'));
const RepositorySearch = lazy(() => import('../pages/RepositorySearch.jsx'));
const LanguageAnalytics = lazy(() => import('../pages/LanguageAnalytics.jsx'));
const CompareUsers = lazy(() => import('../pages/CompareUsers.jsx'));
const Organizations = lazy(() => import('../pages/Organizations.jsx'));
const Followers = lazy(() => import('../pages/Followers.jsx'));
const Following = lazy(() => import('../pages/Following.jsx'));
const Activity = lazy(() => import('../pages/Activity.jsx'));
const StarredRepositories = lazy(() => import('../pages/StarredRepositories.jsx'));
const Settings = lazy(() => import('../pages/Settings.jsx'));

function withSuspense(element) {
  return <Suspense fallback={<Loader fullScreen />}>{element}</Suspense>;
}

function NotFound() {
  return (
    <div className="gd-state-panel">
      <h1>404</h1>
      <p className="gd-mb-0">This page doesn't exist.</p>
    </div>
  );
}

function AppRouter() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path={ROUTE_PATHS.DASHBOARD} element={withSuspense(<Dashboard />)} />
        <Route path={ROUTE_PATHS.USERS} element={withSuspense(<UserSearch />)} />
        <Route path={ROUTE_PATHS.USER_PROFILE} element={withSuspense(<UserProfile />)} />
        <Route path={ROUTE_PATHS.REPOSITORIES} element={withSuspense(<Repositories />)} />
        <Route path={ROUTE_PATHS.REPOSITORY_DETAILS} element={withSuspense(<RepositoryDetails />)} />
        <Route path={ROUTE_PATHS.SEARCH} element={withSuspense(<RepositorySearch />)} />
        <Route path={ROUTE_PATHS.LANGUAGES} element={withSuspense(<LanguageAnalytics />)} />
        <Route path={ROUTE_PATHS.COMPARE} element={withSuspense(<CompareUsers />)} />
        <Route path={ROUTE_PATHS.FOLLOWERS} element={withSuspense(<Followers />)} />
        <Route path={ROUTE_PATHS.FOLLOWING} element={withSuspense(<Following />)} />
        <Route path={ROUTE_PATHS.STARRED} element={withSuspense(<StarredRepositories />)} />
        <Route path={ROUTE_PATHS.ACTIVITY} element={withSuspense(<Activity />)} />
        <Route path={ROUTE_PATHS.ORGANIZATIONS} element={withSuspense(<Organizations />)} />
        <Route path={ROUTE_PATHS.SETTINGS} element={withSuspense(<Settings />)} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
