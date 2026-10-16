import type { Fit, Verdict } from '../api/types';

const tones: Record<Verdict, { label: string; bar: string }> = {
  apply: { label: 'Worth applying', bar: 'border-emerald-600' },
  maybe: { label: 'Borderline', bar: 'border-amber-500' },
  skip: { label: 'Probably skip', bar: 'border-danger' },
};

export function FitVerdict({
  fit,
  constraints,
}: {
  fit: Fit;
  constraints: string[];
}) {
  const tone = tones[fit.verdict];

  return (
    <section
      aria-label='Is this job worth applying to?'
      className={`rounded-md border-l-4 bg-white px-4 py-3 text-sm shadow-[0_0_0_1px_rgba(17,24,39,0.06)] ${tone.bar}`}
    >
      <p className='text-xs font-medium uppercase tracking-wide text-muted'>
        Worth applying?
      </p>
      <p className='mt-0.5 text-lg font-semibold tracking-tight'>
        {tone.label}
      </p>
      <p className='mt-1 text-muted'>{fit.reason}</p>

      {constraints.length > 0 && (
        <>
          <p className='mt-3 font-medium'>The posting also requires</p>
          <ul className='mt-1 list-disc space-y-1 pl-4 text-muted'>
            {constraints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className='mt-2 text-[13px] text-muted'>
            Fitly can't check these against your resume. Make sure you meet
            them.
          </p>
        </>
      )}
    </section>
  );
}
