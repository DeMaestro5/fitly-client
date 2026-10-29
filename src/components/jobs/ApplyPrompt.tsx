import { CheckCircleIcon } from '../ui/Icons';

interface Props {
  title: string;
  company: string;
  onYes: () => void;
  onNo: () => void;
}

export function ApplyPrompt({ title, company, onYes, onNo }: Props) {
  return (
    <div className='pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-4'>
      <div
        role='dialog'
        aria-label='Confirm application'
        className='fade-up pointer-events-auto w-full max-w-md rounded-2xl border border-black/[0.08] bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.16)]'
      >
        <p className='text-sm text-muted'>Back from the job page?</p>
        <p className='mt-0.5 font-medium text-ink'>
          Did you apply to {title} at {company}?
        </p>
        <div className='mt-3 flex gap-2'>
          <button
            type='button'
            onClick={onYes}
            className='inline-flex h-9 items-center gap-1.5 rounded-xl bg-ink px-3.5 text-sm font-medium text-white transition hover:opacity-90'
          >
            <CheckCircleIcon className='h-4 w-4' />
            Yes, I applied
          </button>
          <button
            type='button'
            onClick={onNo}
            className='h-9 rounded-xl border border-black/[0.08] px-3.5 text-sm font-medium text-ink transition hover:border-black/25'
          >
            Not yet
          </button>
        </div>
      </div>
    </div>
  );
}
