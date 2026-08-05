import { saveAs } from 'file-saver';

function flattenValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

function toCSV(rows) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (value) => {
    const str = String(flattenValue(value));
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((key) => escape(row[key])).join(','));
  }
  return lines.join('\n');
}

export function exportData(data, filename, format) {
  const rows = Array.isArray(data) ? data : [data];
  if (format === 'csv') {
    const csv = toCSV(rows);
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `${filename}.csv`);
  } else {
    const json = JSON.stringify(data, null, 2);
    saveAs(new Blob([json], { type: 'application/json;charset=utf-8' }), `${filename}.json`);
  }
}

export function buildUserSummary(user) {
  return {
    login: user.login,
    name: user.name,
    bio: user.bio,
    company: user.company,
    location: user.location,
    blog: user.blog,
    twitter: user.twitter_username,
    followers: user.followers,
    following: user.following,
    public_repos: user.public_repos,
    public_gists: user.public_gists,
    created_at: user.created_at,
    profile_url: user.html_url,
  };
}

export function buildRepositorySummary(repo) {
  return {
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    open_issues: repo.open_issues_count,
    license: repo.license?.spdx_id ?? repo.license?.name ?? null,
    updated_at: repo.updated_at,
    url: repo.html_url,
  };
}
