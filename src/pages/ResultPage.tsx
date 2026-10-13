import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import type { TailorResult } from '../api/types';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { MatchSummary } from '../components/MatchSummary';
import { ResumePreview } from '../components/ResumePreview';
import { TemplatePicker } from '../components/TemplatePicker';
import { useDownload } from '../hooks/useDownload';
import { usePreview } from '../hooks/usePreview';
import { useTemplates } from '../hooks/useTemplates';
import { useResumeSession } from '../state/session';

export function ResultPage() {
  const { result } = useResumeSession();
  if (!result) return <Navigate to='/' replace />;
  return <Result result={result} />;
}

function Result({ result }: { result: TailorResult }) {
  const { templateId, setTemplateId } = useResumeSession();
  const { templates, error: templatesError } = useTemplates();

  // Fall back to the first template when nothing (or a removed one) is saved.
  const activeId =
    templates.find((t) => t.id === templateId)?.id ??
    templates.find((t) => t.id === 'classic')?.id ??
    templates[0]?.id ??
    null;

  useEffect(() => {
    if (activeId && activeId !== templateId) setTemplateId(activeId);
  }, [activeId, templateId, setTemplateId]);

  const tailorable = result.tailorable;
  const preview = usePreview(tailorable, activeId);
  const pdf = useDownload();
  const activeName = templates.find((t) => t.id === activeId)?.name;

  return (
    <main className='mx-auto grid max-w-[90rem] gap-6 px-5 pb-6 sm:px-8 lg:h-[calc(100vh-4.5rem)] lg:grid-cols-[21rem_minmax(0,1fr)]'>
      <aside className='space-y-8 lg:overflow-y-auto lg:pb-4 lg:pr-3'>
        {result.gaps && <MatchSummary gaps={result.gaps} />}

        {templatesError ? (
          <Alert tone='error' title="Couldn't load templates">
            {templatesError}
          </Alert>
        ) : (
          <TemplatePicker
            templates={templates}
            value={activeId}
            onChange={setTemplateId}
          />
        )}

        {result.warnings.length > 0 && (
          <Alert
            tone='warning'
            title={`${result.warnings.length} thing${
              result.warnings.length === 1 ? '' : 's'
            } to check`}
          >
            <ul className='list-disc space-y-1 pl-4'>
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </Alert>
        )}
      </aside>

      <section
        className='flex min-h-[75vh] flex-col lg:min-h-0'
        aria-label='Preview'
      >
        <div className='mb-3 flex items-center justify-between gap-3'>
          <p className='text-sm text-muted'>
            {activeName ? (
              <>
                Previewing{' '}
                <span className='font-medium text-ink'>{activeName}</span>
              </>
            ) : (
              'Loading templates…'
            )}
          </p>
          <Button
            disabled={!activeId}
            busy={pdf.status === 'working'}
            onClick={() =>
              activeId && pdf.download({ tailorable, templateId: activeId })
            }
          >
            {pdf.status === 'done' && (
              <svg
                viewBox='0 0 20 20'
                className='size-4 animate-pop'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.4'
                aria-hidden='true'
              >
                <path
                  d='m5 10.5 3.2 3.2L15 6.8'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            )}
            {pdf.status === 'working'
              ? 'Preparing PDF'
              : pdf.status === 'done'
              ? 'Downloaded'
              : 'Download PDF'}
          </Button>
        </div>

        {(pdf.error || preview.error) && (
          <div className='mb-3'>
            <Alert
              tone='error'
              title={pdf.error ? "PDF didn't download" : "Preview didn't load"}
            >
              {pdf.error ?? preview.error}
            </Alert>
          </div>
        )}

        <ResumePreview
          html={preview.html}
          version={preview.version}
          loading={preview.loading}
        />
      </section>
    </main>
  );
}
