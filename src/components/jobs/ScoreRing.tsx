import { SCORE_LABELS, scoreBand } from '../../lib/format';

const STROKES = {
  strong: 'stroke-emerald-500',
  possible: 'stroke-amber-500',
  low: 'stroke-neutral-400',
} as const;

export function ScoreRing({
  score,
  size = 44,
}: {
  score: number;
  size?: number;
}) {
  const band = scoreBand(score);
  return (
    <div
      className='relative shrink-0'
      style={{ width: size, height: size }}
      title={`${score}/100 · ${SCORE_LABELS[band]} match`}
    >
      <svg
        viewBox='0 0 36 36'
        width={size}
        height={size}
        className='-rotate-90'
        aria-hidden='true'
      >
        <circle
          cx='18'
          cy='18'
          r='15.5'
          fill='none'
          strokeWidth='3'
          className='stroke-black/10'
        />
        <circle
          cx='18'
          cy='18'
          r='15.5'
          fill='none'
          strokeWidth='3'
          strokeLinecap='round'
          pathLength={100}
          strokeDasharray={`${score} 100`}
          className={`${STROKES[band]} transition-[stroke-dasharray] duration-700`}
        />
      </svg>
      <span
        className='absolute inset-0 grid place-items-center font-semibold tabular-nums text-ink'
        style={{ fontSize: size >= 56 ? 18 : 12 }}
      >
        {score}
      </span>
    </div>
  );
}
