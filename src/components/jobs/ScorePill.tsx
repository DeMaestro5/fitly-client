import { SCORE_LABELS, scoreBand } from '../../lib/format';

const STYLES = {
  strong: 'bg-emerald-100 text-emerald-800',
  possible: 'bg-amber-100 text-amber-800',
  low: 'bg-neutral-100 text-neutral-600',
} as const;

export function ScorePill({ score }: { score: number }) {
  const band = scoreBand(score);
  return (
    <span
      title={`${score}/100 · ${SCORE_LABELS[band]} match`}
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${STYLES[band]}`}
    >
      {score}
    </span>
  );
}
