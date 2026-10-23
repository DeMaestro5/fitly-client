import type { JobSourceId } from '../api/jobs';

export const SOURCE_LABELS: Record<JobSourceId, string> = {
  himalayas: 'Himalayas',
  remoteok: 'Remote OK',
  wwr: 'We Work Remotely',
  remotive: 'Remotive',
  jobicy: 'Jobicy',
  arbeitnow: 'Arbeitnow',
  hn: 'Hacker News',
  ats: 'Company board',
};

// Sources that exist today (shown in the filter).
export const ACTIVE_SOURCES: JobSourceId[] = [
  'himalayas',
  'remoteok',
  'wwr',
  'jobicy',
  'remotive',
  'arbeitnow',
];

export type ScoreBand = 'strong' | 'possible' | 'low';
export const scoreBand = (score: number): ScoreBand =>
  score >= 70 ? 'strong' : score >= 45 ? 'possible' : 'low';

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return 'unknown';
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return 'unknown';
  const minutes = Math.round((Date.now() - time) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(time).toLocaleDateString();
}

// Feeds publish dates in odd formats. If the posted date can't be read,
// say when we first saw the job instead of showing nothing.
export function postedLabel(
  postedAt: string | null,
  firstSeenAt: string,
): string {
  if (postedAt && !Number.isNaN(Date.parse(postedAt)))
    return `posted ${timeAgo(postedAt)}`;
  return `seen ${timeAgo(firstSeenAt)}`;
}

export const SCORE_LABELS = {
  strong: 'Strong',
  possible: 'Possible',
  low: 'Low',
} as const;
