import { useState, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { TailoringSheet } from '../components/TailoringSheet';
import { useTailor } from '../hooks/useTailor';
import { useResumeSession } from '../state/session';

const MIN_LENGTH = 40;
const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);

export function TailorPage() {
  const navigate = useNavigate();
  const { jobText, setJobText, result, setResult } = useResumeSession();
  const { run, cancel, loading, error } = useTailor();
  const [clipboardError, setClipboardError] = useState(false);

  const ready = jobText.trim().length >= MIN_LENGTH;

  async function submit() {
    if (!ready || loading) return;
    const next = await run(jobText);
    if (next) {
      setResult(next);
      navigate('/result');
    }
  }

  async function paste() {
    try {
      setJobText(await navigator.clipboard.readText());
      setClipboardError(false);
    } catch {
      setClipboardError(true);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <main className='mx-auto max-w-3xl px-5 pb-16 pt-4 sm:px-8 sm:pt-12'>
      <h1 className='text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl'>
        Tailor your resume to a job
      </h1>
      <p className='mt-4 max-w-xl text-lg text-muted'>
        Paste the whole posting, navigation and footer included. Your name,
        contact details, companies and dates never reach the model and never
        change.
      </p>

      <div className='mt-8'>
        {loading ? (
          <TailoringSheet onCancel={cancel} />
        ) : (
          <>
            {error && (
              <div className='mb-4'>
                <Alert tone='error' title="Tailoring didn't finish">
                  {error}
                </Alert>
              </div>
            )}

            <div className='rounded-lg bg-white shadow-[0_18px_40px_-22px_rgba(17,24,39,0.45)] focus-within:ring-1 '>
              <label htmlFor='job' className='sr-only'>
                Job posting
              </label>
              <textarea
                id='job'
                value={jobText}
                onChange={(event) => setJobText(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder='Paste the job posting here. Fitly finds the job description in the page for you.'
                className='block min-h-[22rem] w-full resize-y rounded-t-lg bg-transparent p-5 text-[15px] leading-relaxed outline-none placeholder:text-muted/70'
              />
              <div className='flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3'>
                <p
                  className='text-sm tabular-nums text-muted'
                  aria-live='polite'
                >
                  {jobText.length.toLocaleString()} characters
                  {jobText.length > 0 && !ready && ' (paste a little more)'}
                </p>
                <div className='flex items-center gap-2'>
                  {jobText ? (
                    <Button variant='ghost' onClick={() => setJobText('')}>
                      Clear
                    </Button>
                  ) : (
                    <Button variant='ghost' onClick={paste}>
                      Paste from clipboard
                    </Button>
                  )}
                  <Button onClick={submit} disabled={!ready}>
                    Tailor resume
                  </Button>
                </div>
              </div>
            </div>

            <div className='mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted'>
              <p>
                {clipboardError
                  ? 'The browser blocked clipboard access. Paste with ' +
                    (isMac ? '⌘V' : 'Ctrl+V') +
                    '.'
                  : `Press ${isMac ? '⌘' : 'Ctrl'}+Enter to tailor.`}
              </p>
              {result && (
                <Link
                  to='/result'
                  className='font-medium text-ink underline underline-offset-4 decoration-marker decoration-2 hover:decoration-ink'
                >
                  Back to your last result
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
