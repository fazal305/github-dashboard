export const APP_NAME = 'GitHub Dashboard';

export const GITHUB_API_BASE_URL = 'https://api.github.com';
export const GITHUB_API_VERSION = '2022-11-28';
export const MAX_RETRIES = 2;
export const RETRY_BASE_DELAY_MS = 500;

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

// Each accent has separate light/dark shades because a single hex can't hit
// the WCAG 4.5:1 text-contrast minimum against both a white and a near-black
// background — light-mode shades are chosen dark enough to read on white,
// dark-mode shades are chosen light enough to read on slate-950.
export const ACCENT_COLORS = [
  {
    id: 'blue',
    name: 'Blue',
    light: { value: '#2563eb', hover: '#1d4ed8' },
    dark: { value: '#3b82f6', hover: '#60a5fa' },
  },
  {
    id: 'violet',
    name: 'Violet',
    light: { value: '#7c3aed', hover: '#6d28d9' },
    dark: { value: '#a78bfa', hover: '#8b5cf6' },
  },
  {
    id: 'green',
    name: 'Green',
    light: { value: '#15803d', hover: '#166534' },
    dark: { value: '#4ade80', hover: '#22c55e' },
  },
  {
    id: 'amber',
    name: 'Amber',
    light: { value: '#b45309', hover: '#92400e' },
    dark: { value: '#fbbf24', hover: '#f59e0b' },
  },
  {
    id: 'red',
    name: 'Red',
    light: { value: '#b91c1c', hover: '#991b1b' },
    dark: { value: '#f87171', hover: '#ef4444' },
  },
  {
    id: 'teal',
    name: 'Teal',
    light: { value: '#0f766e', hover: '#115e59' },
    dark: { value: '#14b8a6', hover: '#2dd4bf' },
  },
];

export const STORAGE_KEYS = {
  THEME: 'gd:theme',
  ACCENT: 'gd:accent-color',
  SIDEBAR_COLLAPSED: 'gd:sidebar-collapsed',
  RECENT_USERS: 'gd:recent-users',
  RECENT_REPOS: 'gd:recent-repos',
  COMPARE_HISTORY: 'gd:compare-history',
  GITHUB_TOKEN: 'gd:github-token',
  PER_PAGE: 'gd:per-page',
  DEFAULT_REPO_SORT: 'gd:default-repo-sort',
  EXPORT_FORMAT: 'gd:export-format',
};

export const MAX_RECENT_ITEMS = 8;

export const DEFAULT_PER_PAGE = 12;
export const PER_PAGE_OPTIONS = [6, 12, 24, 48];

export const REPO_SORT_OPTIONS = [
  { value: 'updated', label: 'Recently Updated' },
  { value: 'pushed', label: 'Recently Pushed' },
  { value: 'created', label: 'Recently Created' },
  { value: 'full_name', label: 'Name' },
];

export const EXPORT_FORMATS = [
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
];

export const ROUTE_PATHS = {
  DASHBOARD: '/',
  USERS: '/users',
  USER_PROFILE: '/user/:username',
  REPOSITORIES: '/repositories',
  REPOSITORY_DETAILS: '/repositories/:owner/:repo',
  SEARCH: '/search',
  LANGUAGES: '/languages',
  COMPARE: '/compare',
  FOLLOWERS: '/followers',
  FOLLOWING: '/following',
  STARRED: '/starred',
  ACTIVITY: '/activity',
  ORGANIZATIONS: '/organizations',
  SETTINGS: '/settings',
};

export function buildUserProfilePath(username) {
  return `/user/${encodeURIComponent(username)}`;
}

export function buildRepositoryDetailsPath(owner, repo) {
  return `/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

export const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C#': '#178600',
  'C++': '#f34b7d',
  C: '#555555',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Shell: '#89e051',
  Jupyter: '#DA5B0B',
  Lua: '#000080',
  Elixir: '#6e4a7e',
  Scala: '#c22d40',
  Haskell: '#5e5086',
};
export const DEFAULT_LANGUAGE_COLOR = '#8b949e';

export const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTE_PATHS.DASHBOARD, icon: 'dashboard', end: true },
  { label: 'Users', path: ROUTE_PATHS.USERS, icon: 'users' },
  { label: 'Repositories', path: ROUTE_PATHS.REPOSITORIES, icon: 'repositories' },
  { label: 'Repo Search', path: ROUTE_PATHS.SEARCH, icon: 'search' },
  { label: 'Languages', path: ROUTE_PATHS.LANGUAGES, icon: 'languages' },
  { label: 'Compare Users', path: ROUTE_PATHS.COMPARE, icon: 'compare' },
  { label: 'Followers', path: ROUTE_PATHS.FOLLOWERS, icon: 'followers' },
  { label: 'Following', path: ROUTE_PATHS.FOLLOWING, icon: 'following' },
  { label: 'Starred', path: ROUTE_PATHS.STARRED, icon: 'starred' },
  { label: 'Activity', path: ROUTE_PATHS.ACTIVITY, icon: 'activity' },
  { label: 'Organizations', path: ROUTE_PATHS.ORGANIZATIONS, icon: 'organizations' },
  { label: 'Settings', path: ROUTE_PATHS.SETTINGS, icon: 'settings' },
];
