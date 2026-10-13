import type { ReactNode } from 'react';

interface Props {
  tone: 'error' | 'warning';
  title: string;
  children?: ReactNode;
}

const tones = {
  error: 'border-danger bg-white text-danger',
  warning: 'border-amber-500 bg-white text-ink',
};

export function Alert({ tone, title, children }: Props) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-md border-l-4 px-4 py-3 text-sm shadow-[0_0_0_1px_rgba(17,24,39,0.06)] ${tones[tone]}`}
    >
      <p className='font-medium'>{title}</p>
      {children && <div className='mt-1 text-muted'>{children}</div>}
    </div>
  );
}
