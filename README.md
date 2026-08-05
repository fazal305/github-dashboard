# GitHub Dashboard

**🔗 Live demo: [fazal305.github.io/github-dashboard](https://fazal305.github.io/github-dashboard/)**

A professional developer platform for exploring GitHub data — users, repositories, languages, organizations, and activity — built as a modular React + Vite single-page application.

This isn't a simple GitHub profile viewer. It's architected as a real SaaS-style product: a fully token-driven design system with light/dark/auto theming and user-selectable accent colors, a resilient API layer with retry and rate-limit handling, persisted search history and settings, and 14 fully data-backed pages, all verified against the live GitHub REST API rather than mocked data.

## Overview

GitHub Dashboard lets you search and explore any public GitHub user or repository, compare two users side by side, visualize a user's language usage across Pie/Bar/Doughnut charts, browse organizations and their members, follow a user's recent public activity, and export any of it as JSON or CSV — all from a responsive, accessible, keyboard-navigable interface that remembers your preferences between visits.

## Features

- **User Search** — debounced, paginated search of GitHub users
- **User Profile** — avatar, bio, company, location, blog, Twitter, follower/repo/gist stats, recent repositories
- **Repository Explorer** — a user's repositories with sort, grid/table view toggle, and pagination
- **Repository Details** — stars, forks, watchers, issues, topics, license, and a live per-repo language breakdown chart
- **Repository Search** — full-text search with language and minimum-stars filters, plus sort
- **Language Analytics** — aggregate language usage across a user's repositories, switchable between Doughnut, Pie, and Bar charts
- **Compare Users** — side-by-side followers/following/repos/stars/languages with the higher value highlighted per row
- **Followers / Following** — paginated card grids for any user
- **Starred Repositories** — a user's stars, sortable by recently-starred or recently-updated
- **Activity** — a readable timeline of a user's recent public events (pushes, PRs, issues, forks, releases, and more)
- **Organizations** — browse a user's public orgs, or jump straight to any org's profile, repositories, and members
- **Dashboard** — quick stats, recently-viewed users/repos, live trending repositories, and quick navigation
- **Settings** — theme, accent color, layout, items-per-page, default sort, export format, and GitHub API token, all persisted locally
- **Export** — user summaries, repository lists, and language statistics as JSON or CSV
- **Search history** — recently viewed users/repos and comparison history persisted to Local Storage

## Folder Structure

```
github-dashboard/
├── src/
│   ├── assets/styles/       # variables, global, layout, components, utilities (design tokens)
│   ├── components/          # 15 reusable, presentation-only components (each its own folder)
│   ├── layouts/              # DashboardLayout — the app shell (navbar/sidebar/main/footer)
│   ├── hooks/                # useGitHubApi, useDebounce, usePagination, useLocalStorage,
│   │                          # useTheme, useSearchHistory
│   ├── services/              # githubApi.js — the single GitHub REST client
│   ├── context/                # ThemeContext, SearchContext
│   ├── utils/                   # constants, formatters, storage, export
│   ├── pages/                    # 14 route-level pages, one per feature
│   ├── router/                    # AppRouter — route table with lazy-loaded pages
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

Every component folder follows the same shape: `ComponentName.jsx` (implementation) + `index.js` (barrel export), so imports read as `components/UserCard` rather than reaching into implementation files.

## Screenshots

> _Add screenshots here before publishing — e.g. Dashboard (light + dark), User Profile, Language Analytics with chart, Compare Users, Repository Explorer table view, Settings._

| Dashboard | User Profile | Language Analytics |
| --- | --- | --- |
| _screenshot_ | _screenshot_ | _screenshot_ |

## Technologies Used

- **[React 19](https://react.dev/)** + **[Vite](https://vite.dev/)** — UI rendering, component state, application logic
- **[React Router 7](https://reactrouter.com/)** — client-side routing, code-split per page
- **[Bootstrap 5](https://getbootstrap.com/)** — grid, flex, and form utilities, layered under a custom token-driven design system (`gd-` prefixed classes) so nothing collides with Bootstrap's own component classes
- **[Chart.js](https://www.chartjs.org/)** + **react-chartjs-2** — Pie/Bar/Doughnut charts, themed via CSS custom properties so they stay correct across light/dark/accent changes
- **[file-saver](https://github.com/eligrey/FileSaver.js)** — client-side JSON/CSV export downloads
- **[react-icons](https://react-icons.github.io/react-icons/)** (Feather set) — iconography
- **[oxlint](https://oxc.rs/)** — linting

**On jQuery:** the brief allowed jQuery for legacy DOM utilities where it would genuinely improve productivity. It doesn't appear anywhere in this codebase — every interaction here is state-driven through React, and reaching for direct DOM manipulation would have fought the framework rather than helped it. It was evaluated and deliberately not used, not forgotten.

## API Information

All data comes from the [GitHub REST API](https://docs.github.com/en/rest) via a single service module, [`src/services/githubApi.js`](src/services/githubApi.js):

- **Request abstraction** — one `request()` function all 19 endpoint calls route through
- **Retry logic** — transient 5xx and network failures retry with exponential backoff (`MAX_RETRIES = 2`); rate-limit responses are never auto-retried, they surface immediately
- **Rate-limit detection** — every response's `x-ratelimit-*` headers are parsed and tracked; `GitHubApiError` carries `isRateLimited` and `resetAt` so the UI can show a precise "try again at…" message
- **Optional authentication** — add a GitHub Personal Access Token in Settings to raise the limit from 60 to 5,000 requests/hour; the token lives only in this browser's Local Storage and is sent only to `api.github.com`

Unauthenticated, you get 60 requests/hour, shared across all unauthenticated apps on your network — expect to hit the limit during heavy testing. Settings → API Access → Test Connection shows your current quota live.

## Installation

```bash
git clone <your-repo-url>
cd github-dashboard
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

## Configuration

No environment variables or build-time configuration are required — the app works immediately against the public, unauthenticated GitHub API. Everything user-configurable lives in the **Settings** page and persists to Local Storage:

| Setting | Effect |
| --- | --- |
| Theme (light/dark/auto) | Applied instantly via `data-theme`/`data-bs-theme` |
| Accent color | Recolors links, active states, and Bootstrap primary buttons app-wide |
| Sidebar collapsed by default | Controls the initial sidebar width |
| Items per page | Used by every paginated list and search page |
| Default repository sort | Initial sort on the Repositories page |
| Export format | Default format (JSON/CSV) for every export button |
| GitHub API token | Optional PAT to raise the rate limit |

"Clear All Local Data" in Settings resets everything above back to defaults.

## Deployment

Deployed on **GitHub Pages** at **[fazal305.github.io/github-dashboard](https://fazal305.github.io/github-dashboard/)**. To redeploy after making changes:

```bash
npm run deploy
```

That builds the app and pushes `dist/` to a `gh-pages` branch via the `gh-pages` package. A few things make a client-routed SPA work correctly on Pages, which has no server-side rewrites:

- `vite.config.js` sets `base: '/github-dashboard/'` for production builds only (dev stays at `/`)
- `App.jsx` passes `basename={import.meta.env.BASE_URL}` to `BrowserRouter` so routes resolve under that subpath
- `public/404.html` + a small decode script in `index.html` implement the standard [spa-github-pages](https://github.com/rafgraph/spa-github-pages) redirect trick, so a direct load of e.g. `/github-dashboard/users` (not just `/`) works instead of 404ing

(Pages is already enabled on this repo, sourced from the `gh-pages` branch — Settings → Pages, if you need to check or change it.)

If you rename the repository, update the `base` in `vite.config.js` and `segmentsToKeep`-relative path in `public/404.html` to match.

## Performance

- **Code splitting** — every page is `React.lazy`-loaded per route; nothing outside the active page's chunk is downloaded
- **Delayed loading overlay** — the full-screen loader only renders if a request is still pending after 200ms, so fast responses never flash a spinner
- **Debounced search** — User Search and Repository Search wait 400ms after typing stops before firing a request
- **Memoization** — `UserCard` and `RepoCard`, the components rendered in largest numbers (grids of up to dozens of items), are wrapped in `React.memo`
- **Abort on unmount/refetch** — `useGitHubApi` cancels in-flight requests via `AbortController` whenever its dependencies change or the component unmounts, preventing race conditions and wasted work

## Accessibility

- Skip-to-content link, semantic landmarks (`header`, `nav`, `main`, `footer`), and a logical heading hierarchy on every page
- Full keyboard navigation with visible focus rings on every interactive element
- `aria-label`, `aria-pressed`, `aria-current`, and `aria-sort` applied throughout (theme switcher, pagination, sortable table headers, collapsed sidebar links)
- All six accent colors, and the muted-text token, are tuned separately for light and dark mode to independently clear the WCAG AA 4.5:1 text-contrast minimum against their actual background — a single fixed hex can't pass both a white and a near-black background
- `prefers-reduced-motion` is honored globally
- Chart components expose a text-equivalent data summary via `role="img"`/`aria-label` for screen readers, since canvas-rendered charts have no native text alternative

## Future Roadmap

- Contribution calendar and pinned repositories (require the GitHub GraphQL API; this app is REST-only by design)
- Byte-weighted language analytics across a user's full repository set (currently repo-count-based to stay within the unauthenticated rate limit)
- Saved/favorited users distinct from recently-viewed history
- Offline support via a service worker
- E2E test coverage

## License

MIT — see [LICENSE](LICENSE).
