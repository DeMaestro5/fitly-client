export type JobSourceId =
  | 'himalayas'
  | 'remoteok'
  | 'wwr'
  | 'remotive'
  | 'jobicy'
  | 'arbeitnow'
  | 'hn'
  | 'ats';
export type JobStatus = 'new' | 'saved' | 'applied' | 'skipped';
export type RemoteType = 'remote' | 'hybrid' | 'onsite' | 'unknown';
export type JobScope = 'worldwide' | 'limited' | 'unknown';
export type JobSort = 'score' | 'posted';

export interface JobListItem {
  id: string;
  source: JobSourceId;
  sourceUrl: string;
  applyUrl: string;
  title: string;
  company: string;
  location: string | null;
  regionNote: string | null;
  remoteType: RemoteType;
  employmentType: string | null;
  salaryText: string | null;
  tags: string[];
  postedAt: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  score: number;
  matched: string[];
  status: JobStatus;
  notes: string | null;
  expired: boolean;
  duplicateOf: string | null;
}

export interface JobDetail extends JobListItem {
  descriptionText: string;
}

export interface JobsPage {
  items: JobListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface JobQuery {
  q?: string;
  source?: JobSourceId;
  status?: JobStatus;
  minScore: number;
  sinceDays?: number;
  scope?: JobScope;
  sort: JobSort;
  page: number;
}

export interface SourceOverview {
  source: JobSourceId;
  minIntervalMs: number;
  ok: boolean | null;
  count: number;
  error: string | null;
  fetchedAt: string | null;
  durationMs: number | null;
  visibleJobs: number;
}

export interface RefreshReport {
  source: JobSourceId;
  outcome: 'fetched' | 'skipped' | 'failed';
  fetched: number;
  inserted: number;
  updated: number;
  error: string | null;
  durationMs: number;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const body = (await res.json().catch(() => null)) as
    | (T & { error?: string; message?: string })
    | null;
  if (!res.ok) {
    throw new Error(
      body?.error ?? body?.message ?? `Request failed (${res.status})`,
    );
  }
  return body as T;
}

function toSearch(query: JobQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.source) params.set('source', query.source);
  if (query.status) params.set('status', query.status);
  if (query.sinceDays) params.set('sinceDays', String(query.sinceDays));
  if (query.scope) params.set('scope', query.scope);
  params.set('minScore', String(query.minScore));
  params.set('sort', query.sort);
  params.set('page', String(query.page));
  return params.toString();
}

export const listJobs = (query: JobQuery, signal?: AbortSignal) =>
  request<JobsPage>(`/api/jobs?${toSearch(query)}`, { signal });

// Ids look like "wwr:https://..." so they must be encoded to survive inside a URL.
export const getJob = (id: string, signal?: AbortSignal) =>
  request<JobDetail>(`/api/jobs/${encodeURIComponent(id)}`, { signal });

export const updateJob = (
  id: string,
  patch: { status?: JobStatus; notes?: string | null },
) =>
  request<JobDetail>(`/api/jobs/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });

export const getSources = () =>
  request<{ sources: SourceOverview[] }>('/api/jobs/sources').then(
    (r) => r.sources,
  );

export const refreshJobs = () =>
  request<{ reports: RefreshReport[] }>('/api/jobs/refresh', {
    method: 'POST',
  }).then((r) => r.reports);
