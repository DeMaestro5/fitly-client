import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { TailorResult } from '../api/types';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { DiffView } from '../components/DiffView';
import { MatchSummary } from '../components/MatchSummary';
import { ResumePreview } from '../components/ResumePreview';
import { TemplatePicker } from '../components/TemplatePicker';
import { useDownload } from '../hooks/useDownload';
import { useIndicator } from '../hooks/useIndicator';
import { useMasterResume } from '../hooks/useMasterResume';
import { usePreview } from '../hooks/usePreview';
import { useTemplates } from '../hooks/useTemplates';
import { compareResumes } from '../lib/resume-diff';
import { useResumeSession } from '../state/session';

type Tab = 'preview' | 'changes';

export function ResultPage() {
  const { result } = useResumeSession();
  if (!result) return <Navigate to='/' replace />;
  return <Result result={result} />;
}

function Result({ result }: { result: TailorResult }) {
  const { templateId, setTemplateId } = useResumeSession();
  const { templates, error: templatesError } = useTemplates();
  const {
    master,
    error: masterError,
    loading: masterLoading,
    reload,
  } = useMasterResume();
  const [tab, setTab] = useState<Tab>('preview');
  const { ref, box, animate } = useIndicator<HTMLDivElement>(tab);

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

  const changes = useMemo(
    () =>
      master
        ? compareResumes(master.tailorable, tailorable, master.locked)
        : null,
    [master, tailorable]
  );

  return (
    <main className='mx-auto grid max-w-[90rem] gap-6 px-5 pb-6 pt-6 sm:px-8 lg:h-[calc(100vh-4.625rem)] lg:grid-cols-[21rem_minmax(0,1fr)]'>
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
        className='flex min-h-[75vh] min-w-0 flex-col lg:min-h-0'
        aria-label='Result'
      >
        <div className='mb-3 flex items-center justify-between gap-3'>
          <div
            ref={ref}
            role='tablist'
            aria-label='Result view'
            className='relative flex items-stretch'
          >
            <TabButton id='preview' current={tab} onSelect={setTab}>
              Preview
            </TabButton>
            <TabButton id='changes' current={tab} onSelect={setTab}>
              Changes
              {changes && changes.total > 0 && (
                <span className='ml-2 rounded-full bg-ink px-1.5 py-px text-[11px] font-medium leading-4 text-white'>
                  {changes.total}
                </span>
              )}
            </TabButton>
            {box && (
              <span
                aria-hidden='true'
                className={`pointer-events-none absolute -bottom-px h-0.5 rounded-full bg-ink ${
                  animate
                    ? 'transition-[left,width] duration-300 ease-[cubic-bezier(0.3,0.9,0.3,1)]'
                    : ''
                }`}
                style={{
                  left: box.left + 12,
                  width: Math.max(box.width - 24, 0),
                }}
              />
            )}
          </div>

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

        {tab === 'preview' && (
          <>
            {(pdf.error || preview.error) && (
              <div className='mb-3'>
                <Alert
                  tone='error'
                  title={
                    pdf.error ? "PDF didn't download" : "Preview didn't load"
                  }
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
          </>
        )}

        {tab === 'changes' && (
          <div
            role='tabpanel'
            className='min-h-0 flex-1 lg:overflow-y-auto lg:pr-2'
          >
            {masterLoading && (
              <p className='text-sm text-muted'>Loading your master resume…</p>
            )}
            {masterError && (
              <div className='space-y-3'>
                <Alert tone='error' title="Couldn't load your master resume">
                  {masterError}
                </Alert>
                <Button variant='secondary' onClick={reload}>
                  Try again
                </Button>
              </div>
            )}
            {changes && <DiffView changes={changes} />}
          </div>
        )}
      </section>
    </main>
  );
}

function TabButton({
  id,
  current,
  onSelect,
  children,
}: {
  id: Tab;
  current: Tab;
  onSelect: (tab: Tab) => void;
  children: ReactNode;
}) {
  return (
    <button
      type='button'
      role='tab'
      data-key={id}
      aria-selected={current === id}
      onClick={() => onSelect(id)}
      className={`flex h-10 items-center px-3 text-sm font-medium transition-colors hover:text-ink ${
        current === id ? 'text-ink' : 'text-muted'
      }`}
    >
      {children}
    </button>
  );
}
