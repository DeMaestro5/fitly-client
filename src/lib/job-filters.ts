import type {
  JobQuery,
  JobScope,
  JobSort,
  JobSourceId,
  JobStatus,
} from '../api/jobs';

export interface UiFilters {
  q: string;
  source: JobSourceId | '';
  status: JobStatus | '';
  sinceDays: '' | '1' | '7' | '30';
  scope: JobScope | '';
  bestOnly: boolean;
  sort: JobSort;
  page: number;
}

export const BEST_MATCH_MIN = 45;

export const DEFAULT_FILTERS: UiFilters = {
  q: '',
  source: '',
  status: '',
  sinceDays: '',
  scope: '',
  bestOnly: true,
  sort: 'score',
  page: 1,
};

// "" means "any" in the UI; the API wants the key left out.
export function toQuery(ui: UiFilters, q: string): JobQuery {
  return {
    q: q.trim() || undefined,
    source: ui.source || undefined,
    status: ui.status || undefined,
    minScore: ui.bestOnly ? BEST_MATCH_MIN : 0,
    sinceDays: ui.sinceDays ? Number(ui.sinceDays) : undefined,
    scope: ui.scope || undefined,
    sort: ui.sort,
    page: ui.page,
  };
}
