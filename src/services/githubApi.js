import { getItem, removeItem, setItem } from '../utils/storage.js';
import {
  DEFAULT_PER_PAGE,
  GITHUB_API_BASE_URL,
  GITHUB_API_VERSION,
  MAX_RETRIES,
  RETRY_BASE_DELAY_MS,
  STORAGE_KEYS,
} from '../utils/constants.js';

export class GitHubApiError extends Error {
  constructor(message, { status = null, isRateLimited = false, isNetworkError = false, resetAt = null, cause } = {}) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
    this.isRateLimited = isRateLimited;
    this.isNetworkError = isNetworkError;
    this.resetAt = resetAt;
    if (cause) this.cause = cause;
  }
}

let lastRateLimitInfo = null;

export function getLastRateLimitInfo() {
  return lastRateLimitInfo;
}

export function getToken() {
  return getItem(STORAGE_KEYS.GITHUB_TOKEN, '');
}

export function setToken(token) {
  if (!token) return removeItem(STORAGE_KEYS.GITHUB_TOKEN);
  return setItem(STORAGE_KEYS.GITHUB_TOKEN, token);
}

export function clearToken() {
  return removeItem(STORAGE_KEYS.GITHUB_TOKEN);
}

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function buildUrl(path, params) {
  const url = new URL(`${GITHUB_API_BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    }
  }
  return url;
}

async function safeParseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function recordRateLimitFromHeaders(headers) {
  const limit = headers.get('x-ratelimit-limit');
  const remaining = headers.get('x-ratelimit-remaining');
  const reset = headers.get('x-ratelimit-reset');
  if (limit === null || remaining === null || reset === null) return;
  lastRateLimitInfo = {
    limit: Number(limit),
    remaining: Number(remaining),
    resetAt: new Date(Number(reset) * 1000),
  };
}

function isRetryableStatus(status) {
  return status >= 500 && status < 600;
}

async function request(path, { signal, params, ...fetchOptions } = {}) {
  const url = buildUrl(path, params);
  const token = getToken();
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  };

  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, { ...fetchOptions, headers, signal });
      recordRateLimitFromHeaders(response.headers);

      if ((response.status === 403 || response.status === 429) && response.headers.get('x-ratelimit-remaining') === '0') {
        const resetHeader = response.headers.get('x-ratelimit-reset');
        throw new GitHubApiError('GitHub API rate limit exceeded', {
          status: response.status,
          isRateLimited: true,
          resetAt: resetHeader ? new Date(Number(resetHeader) * 1000) : null,
        });
      }

      if (!response.ok) {
        const body = await safeParseJson(response);
        const message = body?.message || `GitHub API request failed with status ${response.status}`;
        const error = new GitHubApiError(message, { status: response.status });

        if (isRetryableStatus(response.status) && attempt < MAX_RETRIES) {
          lastError = error;
          await delay(RETRY_BASE_DELAY_MS * 2 ** attempt);
          continue;
        }
        throw error;
      }

      if (response.status === 204) return null;
      return await response.json();
    } catch (caughtError) {
      if (caughtError.name === 'AbortError' || caughtError instanceof GitHubApiError) {
        throw caughtError;
      }

      lastError = new GitHubApiError('Network error — check your connection and try again.', {
        isNetworkError: true,
        cause: caughtError,
      });

      if (attempt < MAX_RETRIES) {
        await delay(RETRY_BASE_DELAY_MS * 2 ** attempt);
        continue;
      }
      throw lastError;
    }
  }

  throw lastError;
}

export function getUser(username, signal) {
  return request(`/users/${encodeURIComponent(username)}`, { signal });
}

export function searchUsers(query, { page = 1, perPage = DEFAULT_PER_PAGE } = {}, signal) {
  return request('/search/users', { params: { q: query, page, per_page: perPage }, signal });
}

export function getUserRepos(username, { page = 1, perPage = DEFAULT_PER_PAGE, sort = 'updated' } = {}, signal) {
  return request(`/users/${encodeURIComponent(username)}/repos`, {
    params: { page, per_page: perPage, sort },
    signal,
  });
}

export function getRepo(owner, repo, signal) {
  return request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, { signal });
}

export function getRepoLanguages(owner, repo, signal) {
  return request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`, { signal });
}

export function searchRepositories(query, { page = 1, perPage = DEFAULT_PER_PAGE, sort, order = 'desc' } = {}, signal) {
  return request('/search/repositories', {
    params: { q: query, page, per_page: perPage, sort, order },
    signal,
  });
}

export function getUserFollowers(username, { page = 1, perPage = DEFAULT_PER_PAGE } = {}, signal) {
  return request(`/users/${encodeURIComponent(username)}/followers`, { params: { page, per_page: perPage }, signal });
}

export function getUserFollowing(username, { page = 1, perPage = DEFAULT_PER_PAGE } = {}, signal) {
  return request(`/users/${encodeURIComponent(username)}/following`, { params: { page, per_page: perPage }, signal });
}

export function getUserOrgs(username, signal) {
  return request(`/users/${encodeURIComponent(username)}/orgs`, { signal });
}

export function getOrg(org, signal) {
  return request(`/orgs/${encodeURIComponent(org)}`, { signal });
}

export function getOrgRepos(org, { page = 1, perPage = DEFAULT_PER_PAGE } = {}, signal) {
  return request(`/orgs/${encodeURIComponent(org)}/repos`, { params: { page, per_page: perPage }, signal });
}

export function getOrgMembers(org, { page = 1, perPage = DEFAULT_PER_PAGE } = {}, signal) {
  return request(`/orgs/${encodeURIComponent(org)}/members`, { params: { page, per_page: perPage }, signal });
}

export function getUserStarred(username, { page = 1, perPage = DEFAULT_PER_PAGE, sort = 'created' } = {}, signal) {
  return request(`/users/${encodeURIComponent(username)}/starred`, {
    params: { page, per_page: perPage, sort },
    signal,
  });
}

export function getUserEvents(username, { page = 1, perPage = DEFAULT_PER_PAGE } = {}, signal) {
  return request(`/users/${encodeURIComponent(username)}/events/public`, {
    params: { page, per_page: perPage },
    signal,
  });
}

export function getRateLimit(signal) {
  return request('/rate_limit', { signal });
}
