import { useEffect, useState } from 'react';
import { Button } from './Button';

// Widths of the placeholder lines, grouped like resume sections.
const LINES = [
  [92, 78, 85],
  [88, 94, 70, 82],
  [90, 76, 86],
  [64, 80],
];

const STAGES = [
  { from: 0, label: 'Reading the posting' },
  { from: 8, label: 'Rewriting your resume for the role' },
  { from: 24, label: 'Checking every line against your original' },
];

export function TailoringSheet({ onCancel }: { onCancel: () => void }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const active = STAGES.reduce(
    (index, stage, i) => (seconds >= stage.from ? i : index),
    0
  );
  let line = 0;

  return (
    <div
      role='status'
      aria-live='polite'
      className='grid items-center gap-8 sm:grid-cols-[15rem_1fr]'
    >
      <div
        aria-hidden='true'
        className='mx-auto w-full max-w-[15rem] rounded-sm bg-white p-5 shadow-[0_18px_40px_-18px_rgba(17,24,39,0.45)]'
      >
        <div className='mb-1.5 h-3 w-2/3 rounded-sm bg-ink' />
        <div className='mb-5 h-[5px] w-1/2 rounded-sm bg-gray-300' />
        {LINES.map((group, g) => (
          <div key={g} className='mb-4 space-y-2'>
            <div className='mb-3 h-[5px] w-1/4 rounded-sm bg-gray-400' />
            {group.map((width) => (
              <div
                key={width + '-' + line}
                className='sheet-line'
                style={{
                  width: `${width}%`,
                  ['--d' as string]: `${(line++ * 0.28).toFixed(2)}s`,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div>
        <ol className='space-y-2.5'>
          {STAGES.map((stage, i) => (
            <li
              key={stage.label}
              className={`flex items-center gap-3 text-lg transition-colors duration-300 ${
                i < active
                  ? 'text-muted'
                  : i === active
                  ? 'font-medium text-ink'
                  : 'text-muted/50'
              }`}
            >
              <span className='grid size-5 place-items-center'>
                {i < active ? (
                  <svg
                    viewBox='0 0 20 20'
                    className='size-5 animate-pop'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2.2'
                  >
                    <path
                      d='m5 10.5 3.2 3.2L15 6.8'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                ) : i === active ? (
                  <span className='size-2.5 animate-pulse rounded-full bg-ink' />
                ) : (
                  <span className='size-2 rounded-full bg-current' />
                )}
              </span>
              {stage.label}
            </li>
          ))}
        </ol>
        <p className='mt-5 max-w-sm text-sm text-muted'>
          This usually takes under a minute. The free model tier can add a short
          wait.
        </p>
        <div className='mt-5 flex items-center gap-4'>
          <Button variant='secondary' onClick={onCancel}>
            Cancel
          </Button>
          <span className='text-sm tabular-nums text-muted'>{seconds}s</span>
        </div>
      </div>
    </div>
  );
}
