import type { JobListItem } from '../../api/jobs';
import { SOURCE_LABELS, postedLabel } from '../../lib/format';
import { Badge } from '../ui/Badge';
import { ScorePill } from './ScorePill';
import { StatusBadge } from './StatusBadge';

interface Props {
  job: JobListItem;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
}

const MAX_SKILLS = 4;

export function JobRow({ job, index, selected, onSelect }: Props) {
  const skills = job.matched.slice(0, MAX_SKILLS);
  const extra = job.matched.length - skills.length;
  return (
    <button
      type='button'
      aria-pressed={selected}
      onClick={() => onSelect(job.id)}
      style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
      className={`fade-up relative block w-full rounded-xl border bg-white/90 px-4 py-3 text-left outline-none transition duration-150 hover:border-black/25 focus-visible:ring-4 focus-visible:ring-black/[0.08] ${
        selected ? 'border-ink shadow-sm' : 'border-black/[0.07]'
      } ${job.status === 'skipped' ? 'opacity-60 hover:opacity-100' : ''}`}
    >
      {selected && (
        <span
          aria-hidden='true'
          className='absolute inset-y-2.5 left-0 w-1 rounded-r-full bg-marker'
        />
      )}

      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h3 className='truncate text-[15px] font-semibold text-ink'>
            {job.title}
          </h3>
          <p className='mt-0.5 truncate text-sm text-muted'>
            {job.company} · {SOURCE_LABELS[job.source]} ·{' '}
            {postedLabel(job.postedAt, job.firstSeenAt)}
          </p>
        </div>
        <ScorePill score={job.score} />
      </div>

      {/* One line only: overflow is clipped instead of wrapping, so every card is the same height. */}
      <div className='mt-2.5 flex items-center gap-1.5 overflow-hidden'>
        <span className='shrink-0'>
          <StatusBadge status={job.status} />
        </span>
        {job.regionNote && (
          <span className='min-w-0 max-w-[11rem] shrink'>
            <Badge tone='amber'>{job.regionNote}</Badge>
          </span>
        )}
        {skills.map((skill) => (
          <span
            key={skill}
            className='shrink-0 rounded-md bg-black/[0.04] px-2 py-0.5 text-xs font-medium text-muted'
          >
            {skill}
          </span>
        ))}
        {extra > 0 && (
          <span className='shrink-0 text-xs text-muted'>+{extra}</span>
        )}
      </div>
    </button>
  );
}
