import { useState } from 'react';
import { FiEye, FiEyeOff, FiCheck, FiExternalLink, FiTrash2 } from 'react-icons/fi';
import { useThemeContext } from '../context/ThemeContext.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import * as githubApi from '../services/githubApi.js';
import ThemeSwitcher from '../components/ThemeSwitcher/index.js';
import {
  DEFAULT_PER_PAGE,
  EXPORT_FORMATS,
  PER_PAGE_OPTIONS,
  REPO_SORT_OPTIONS,
  STORAGE_KEYS,
} from '../utils/constants.js';

function SettingsSection({ title, description, children }) {
  return (
    <section className="gd-card gd-mb-6">
      <h2 className="gd-mb-1">{title}</h2>
      {description && <p className="gd-text-secondary gd-text-sm gd-mb-4">{description}</p>}
      {children}
    </section>
  );
}

function Settings() {
  const { accent, resolvedTheme, setAccentId, accentOptions } = useThemeContext();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, false);
  const [perPage, setPerPage] = useLocalStorage(STORAGE_KEYS.PER_PAGE, DEFAULT_PER_PAGE);
  const [defaultSort, setDefaultSort] = useLocalStorage(STORAGE_KEYS.DEFAULT_REPO_SORT, 'updated');
  const [exportFormat, setExportFormat] = useLocalStorage(STORAGE_KEYS.EXPORT_FORMAT, 'json');

  const [tokenInput, setTokenInput] = useState(githubApi.getToken());
  const [showToken, setShowToken] = useState(false);
  const [tokenSaved, setTokenSaved] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  function handleSaveToken(event) {
    event.preventDefault();
    githubApi.setToken(tokenInput.trim());
    setTokenSaved(true);
    setTestResult(null);
    window.setTimeout(() => setTokenSaved(false), 2000);
  }

  function handleClearToken() {
    githubApi.clearToken();
    setTokenInput('');
    setTestResult(null);
  }

  async function handleTestConnection() {
    setIsTesting(true);
    setTestResult(null);
    try {
      const data = await githubApi.getRateLimit();
      setTestResult({ success: true, limit: data.rate.limit, remaining: data.rate.remaining });
    } catch (error) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setIsTesting(false);
    }
  }

  function handleClearAllData() {
    const confirmed = window.confirm('This will clear all saved settings, search history, and your API token from this browser. Continue?');
    if (!confirmed) return;
    for (const key of Object.values(STORAGE_KEYS)) {
      window.localStorage.removeItem(key);
    }
    window.location.reload();
  }

  return (
    <div>
      <div className="gd-page-header">
        <h1>Settings</h1>
      </div>

      <SettingsSection title="Appearance" description="Theme and accent color, applied instantly and remembered across visits.">
        <div className="gd-mb-4">
          <label className="gd-fw-medium gd-text-sm d-block gd-mb-2">Theme</label>
          <ThemeSwitcher />
        </div>
        <div>
          <label className="gd-fw-medium gd-text-sm d-block gd-mb-2">Accent Color</label>
          <div className="d-flex gd-gap-2">
            {accentOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`gd-swatch${accent.id === option.id ? ' gd-swatch--active' : ''}`}
                style={{ backgroundColor: (resolvedTheme === 'dark' ? option.dark : option.light).value }}
                aria-label={option.name}
                aria-pressed={accent.id === option.id}
                title={option.name}
                onClick={() => setAccentId(option.id)}
              />
            ))}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Layout" description="Controls the sidebar's default state.">
        <div className="form-check">
          <input
            id="gd-setting-sidebar"
            type="checkbox"
            className="form-check-input"
            checked={isSidebarCollapsed}
            onChange={(event) => setIsSidebarCollapsed(event.target.checked)}
          />
          <label htmlFor="gd-setting-sidebar" className="form-check-label gd-text-sm">
            Collapse sidebar by default
          </label>
        </div>
      </SettingsSection>

      <SettingsSection title="Data & Pagination" description="Defaults used across search results and repository listings.">
        <div className="d-flex flex-wrap gd-gap-4">
          <div>
            <label htmlFor="gd-setting-per-page" className="gd-fw-medium gd-text-sm d-block gd-mb-2">
              Items per page
            </label>
            <select
              id="gd-setting-per-page"
              className="form-select form-select-sm gd-max-w-select"
              value={perPage}
              onChange={(event) => setPerPage(Number(event.target.value))}
            >
              {PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="gd-setting-sort" className="gd-fw-medium gd-text-sm d-block gd-mb-2">
              Default repository sort
            </label>
            <select
              id="gd-setting-sort"
              className="form-select form-select-sm gd-max-w-select"
              value={defaultSort}
              onChange={(event) => setDefaultSort(event.target.value)}
            >
              {REPO_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Export Preferences" description="Default file format used by every export button in the app.">
        <div className="d-flex gd-gap-4">
          {EXPORT_FORMATS.map((format) => (
            <div key={format.value} className="form-check">
              <input
                id={`gd-export-${format.value}`}
                type="radio"
                name="export-format"
                className="form-check-input"
                checked={exportFormat === format.value}
                onChange={() => setExportFormat(format.value)}
              />
              <label htmlFor={`gd-export-${format.value}`} className="form-check-label gd-text-sm">
                {format.label}
              </label>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="API Access"
        description="Add a GitHub Personal Access Token to raise the API rate limit from 60 to 5,000 requests per hour. The token is stored only in this browser's Local Storage and never sent anywhere except directly to api.github.com."
      >
        <form onSubmit={handleSaveToken} className="d-flex flex-wrap align-items-center gd-gap-2 gd-mb-3">
          <label htmlFor="gd-token-input" className="visually-hidden">
            GitHub Personal Access Token
          </label>
          <input
            id="gd-token-input"
            type={showToken ? 'text' : 'password'}
            className="form-control gd-max-w-token"
            placeholder="ghp_…"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            autoComplete="off"
          />
          <button
            type="button"
            className="gd-btn-icon"
            aria-label={showToken ? 'Hide token' : 'Show token'}
            onClick={() => setShowToken((prev) => !prev)}
          >
            {showToken ? <FiEyeOff size={16} aria-hidden="true" /> : <FiEye size={16} aria-hidden="true" />}
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            {tokenSaved ? (
              <span className="d-inline-flex align-items-center gd-gap-1">
                <FiCheck size={14} aria-hidden="true" /> Saved
              </span>
            ) : (
              'Save Token'
            )}
          </button>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleClearToken}>
            Clear
          </button>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleTestConnection} disabled={isTesting}>
            {isTesting ? 'Testing…' : 'Test Connection'}
          </button>
        </form>

        {testResult && (
          <p className={`gd-text-sm gd-mb-3 ${testResult.success ? 'gd-text-success' : 'gd-text-danger'}`}>
            {testResult.success
              ? `Connected — ${testResult.remaining}/${testResult.limit} requests remaining this hour.`
              : `Connection failed: ${testResult.message}`}
          </p>
        )}

        <a
          href="https://github.com/settings/tokens"
          target="_blank"
          rel="noreferrer"
          className="gd-text-sm d-inline-flex align-items-center gd-gap-1"
        >
          <FiExternalLink size={14} aria-hidden="true" /> Create a token on GitHub
        </a>
      </SettingsSection>

      <SettingsSection title="Danger Zone" description="Clears every saved preference and history item from this browser.">
        <button type="button" className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gd-gap-2" onClick={handleClearAllData}>
          <FiTrash2 size={14} aria-hidden="true" /> Clear All Local Data
        </button>
      </SettingsSection>
    </div>
  );
}

export default Settings;
