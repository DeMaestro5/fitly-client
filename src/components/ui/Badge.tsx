import type { ReactNode } from 'react';

const TONES = {
  neutral: 'bg-black/[0.05] text-muted',
  marker: 'bg-marker text-ink',
  sky: 'bg-sky-100 text-sky-800',
  emerald: 'bg-emerald-100 text-emerald-800',
  amber: 'bg-amber-100 text-amber-800',
} as const;

export type BadgeTone = keyof typeof TONES;

interface Props {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', icon, children }: Props) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}
    >
      {icon}
      <span className='truncate'>{children}</span>
    </span>
  );
}
