import { useEffect, useState } from 'react';
import type { Gaps } from '../api/types';

export function MatchSummary({ gaps }: { gaps: Gaps }) {
  const [filled, setFilled] = useState(0);
  const coverage = gaps.coverage;

  // Start at 0 and let the bar grow once, so the number reads as a result.
  useEffect(() => {
    if (coverage === null) return;
    const id = requestAnimationFrame(() => setFilled(coverage));
    return () => cancelAnimationFrame(id);
  }, [coverage]);

  return (
    <section aria-labelledby='match-title'>
      <div className='flex items-baseline justify-between'>
        <h2 id='match-title' className='text-sm font-semibold'>
          Skills match
        </h2>
        {coverage !== null && (
          <p className='text-sm tabular-nums text-muted'>
            <span className='text-2xl font-semibold tracking-tight text-ink'>
              {coverage}%
            </span>{' '}
            of required skills
          </p>
        )}
      </div>

      {coverage !== null && (
        <div
          role='meter'
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={coverage}
          aria-label='Skills coverage'
          className='mt-2 h-1.5 overflow-hidden rounded-full bg-white'
        >
          <div
            className='h-full rounded-full bg-ink transition-[width] duration-700 ease-out'
            style={{ width: `${filled}%` }}
          />
        </div>
      )}

      {gaps.matched.length > 0 && (
        <ul className='mt-4 flex flex-wrap gap-1.5' aria-label='On your resume'>
          {gaps.matched.map((skill) => (
            <li
              key={skill}
              className='rounded-sm bg-marker px-1.5 py-0.5 text-[13px] font-medium'
            >
              {skill}
            </li>
          ))}
        </ul>
      )}

      {gaps.missing.length > 0 && (
        <>
          <ul
            className='mt-3 flex flex-wrap gap-1.5'
            aria-label='Not on your resume'
          >
            {gaps.missing.map((skill) => (
              <li
                key={skill}
                className='rounded-sm border border-dashed border-gray-400 px-1.5 py-0.5 text-[13px] text-muted'
              >
                {skill}
              </li>
            ))}
          </ul>
          <p className='mt-2 text-[13px] text-muted'>
            Dashed skills aren't on your resume, so they stay off it.
          </p>
        </>
      )}
    </section>
  );
}
