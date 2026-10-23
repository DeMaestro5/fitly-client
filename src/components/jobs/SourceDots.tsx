import type { SourceOverview } from '../../api/jobs';
import { SOURCE_LABELS, timeAgo } from '../../lib/format';

export function SourceDots({ sources }: { sources: SourceOverview[] }) {
  return (
    <ul
      aria-label='Source status'
      className='flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-2.5 ring-1 ring-black/[0.06]'
    >
      {sources.map((s) => {
        const color =
          s.ok === null ? 'bg-black/20' : s.ok ? 'bg-emerald-500' : 'bg-danger';
        const detail =
          s.ok === null
            ? 'never run'
            : s.ok
              ? `${s.visibleJobs} jobs, updated ${timeAgo(s.fetchedAt)}`
              : `failed: ${s.error ?? 'unknown error'}`;
        return (
          <li key={s.source} title={`${SOURCE_LABELS[s.source]}: ${detail}`}>
            <span className={`block h-2 w-2 rounded-full ${color}`} />
            <span className='sr-only'>{`${SOURCE_LABELS[s.source]}: ${detail}`}</span>
          </li>
        );
      })}
    </ul>
  );
}
