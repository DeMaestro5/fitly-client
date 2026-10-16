import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ImportResult, MasterResume } from '../api/types';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { ResumeForm, type Edit } from '../components/master/ResumeForm';
import { SourcePanel, type View } from '../components/master/SourcePanel';
import { UploadZone } from '../components/master/UploadZone';
import { useDraftPdf } from '../hooks/useDraft';
import { useDraftPreview } from '../hooks/useDraftPreview';
import { useImport } from '../hooks/useImport';
import { useMasterResume } from '../hooks/useMasterResume';
import { useTemplates } from '../hooks/useTemplates';
import { emptyMaster, withoutBlanks } from '../lib/master-draft';
import { useResumeSession } from '../state/session';
import { useConfirm } from '../components/ConfirmDialog';

const MAX_BYTES = 10 * 1024 * 1024;

export function MasterResumePage() {
  const { master, error, loading, reload, save } = useMasterResume();

  if (loading)
    return (
      <Shell>
        <LoadingSheet label='Loading your master resume' />
      </Shell>
    );

  if (error)
    return (
      <Shell>
        <div className='max-w-xl space-y-4'>
          <Alert tone='error' title="Couldn't load your master resume">
            {error}
          </Alert>
          <Button variant='secondary' onClick={reload}>
            Try again
          </Button>
        </div>
      </Shell>
    );

  return <Workspace saved={master} save={save} />;
}

/* ------------------------------------------------------------------ */

interface ImportNote {
  fileName: string;
  issues: ImportResult['issues'];
  warnings: string[];
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function Workspace({
  saved,
  save,
}: {
  saved: MasterResume | null;
  save: (next: MasterResume) => Promise<void>;
}) {
  const { templateId, setTemplateId } = useResumeSession();
  const { templates } = useTemplates();
  const importer = useImport();
  const { confirm, dialog } = useConfirm();
  const pdf = useDraftPdf();
  const fileInput = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState<MasterResume | null>(() =>
    saved ? structuredClone(saved) : null
  );
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [view, setView] = useState<View>('live');
  const [note, setNote] = useState<ImportNote | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const activeId =
    templates.find((t) => t.id === templateId)?.id ??
    templates.find((t) => t.id === 'classic')?.id ??
    templates[0]?.id ??
    null;

  // What is previewed, downloaded and saved: trimmed, with blank rows dropped.
  const clean = useMemo(() => (draft ? withoutBlanks(draft) : null), [draft]);
  const dirty = useMemo(
    () =>
      clean
        ? JSON.stringify(clean) !==
          JSON.stringify(saved ? withoutBlanks(saved) : null)
        : false,
    [clean, saved]
  );

  const preview = useDraftPreview(clean, activeId, view === 'live');

  useEffect(
    () => () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    },
    [pdfUrl]
  );

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (saveState !== 'saved') return;
    const timer = window.setTimeout(() => setSaveState('idle'), 2200);
    return () => window.clearTimeout(timer);
  }, [saveState]);

  const edit: Edit = useCallback((change) => {
    setDraft((current) => {
      if (!current) return current;
      const next = structuredClone(current);
      change(next);
      return next;
    });
    setSaveState((state) => (state === 'saving' ? state : 'idle'));
  }, []);

  async function onFile(file: File) {
    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      setFileError('Choose a PDF file.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setFileError('That PDF is over 10 MB.');
      return;
    }
    if (dirty) {
      const replace = await confirm({
        title: 'Replace your unsaved edits?',
        message:
          'You have changes that are not saved. Reading this PDF will overwrite them.',
        confirmLabel: 'Replace',
        cancelLabel: 'Keep editing',
      });
      if (!replace) return;
    }

    setFileError(null);
    setNote(null);
    setPdfUrl(URL.createObjectURL(file));
    setView('original');

    const result = await importer.run(file);
    if (result) {
      setDraft(result.draft);
      setNote({
        fileName: file.name,
        issues: result.issues,
        warnings: result.warnings,
      });
      setSaveState('idle');
    }
  }

  async function onSave() {
    if (!clean) return;
    setSaveState('saving');
    setSaveError(null);
    try {
      await save(clean);
      setDraft(clean);
      setSaveState('saved');
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : 'Could not save your changes.'
      );
      setSaveState('error');
    }
  }

  function onDiscard() {
    setDraft(saved ? structuredClone(saved) : null);
    setNote(null);
    setSaveState('idle');
    setSaveError(null);
  }

  const picker = (
    <input
      ref={fileInput}
      type='file'
      accept='application/pdf,.pdf'
      hidden
      onChange={(e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (file) void onFile(file);
      }}
    />
  );

  const actions = (
    <div className='flex items-center gap-2'>
      <Button
        variant='secondary'
        busy={importer.loading}
        onClick={() => fileInput.current?.click()}
      >
        {importer.loading ? 'Reading PDF' : 'Upload resume'}
      </Button>
      <Button
        variant='secondary'
        disabled={!clean || !activeId || importer.loading}
        busy={pdf.status === 'working'}
        onClick={() => clean && activeId && void pdf.download(clean, activeId)}
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
      {picker}
    </div>
  );

  // Nothing yet: a drop zone is the whole screen.
  if (!draft && !importer.loading && !importer.error) {
    return (
      <Shell actions={null}>
        <UploadZone
          onFile={(file) => void onFile(file)}
          onScratch={() => setDraft(emptyMaster())}
          error={fileError}
        />
      </Shell>
    );
  }

  return (
    <Shell actions={actions}>
      {dialog}
      <div className='grid min-h-0 flex-1 gap-6 lg:grid-cols-2'>
        <SourcePanel
          pdfUrl={pdfUrl}
          view={pdfUrl ? view : 'live'}
          onView={setView}
          templates={templates}
          templateId={activeId}
          onTemplate={setTemplateId}
          preview={preview}
        />

        <section
          className='flex min-h-0 min-w-0 flex-col'
          aria-label='Edit your resume'
        >
          <div className='min-h-0 flex-1 space-y-4 lg:overflow-y-auto lg:pb-4 lg:pr-2'>
            {fileError && (
              <Alert tone='error' title="That file can't be used">
                {fileError}
              </Alert>
            )}
            {pdf.error && (
              <Alert tone='error' title="PDF didn't download">
                {pdf.error}
              </Alert>
            )}

            {importer.loading && (
              <LoadingSheet
                label='Reading your resume'
                message='This takes up to a minute.'
              />
            )}

            {!importer.loading && importer.error && (
              <div className='space-y-4'>
                <Alert tone='error' title="Couldn't read that resume">
                  {importer.error}
                </Alert>
                {!draft && (
                  <Button
                    variant='secondary'
                    onClick={() => setDraft(emptyMaster())}
                  >
                    Start from scratch
                  </Button>
                )}
              </div>
            )}

            {!importer.loading && note && (
              <ImportBanner note={note} onDismiss={() => setNote(null)} />
            )}

            {!importer.loading && draft && (
              <ResumeForm draft={draft} edit={edit} />
            )}
          </div>

          {draft && !importer.loading && (
            <SaveFooter
              dirty={dirty}
              hasSaved={saved !== null}
              state={saveState}
              error={saveError}
              onSave={() => void onSave()}
              onDiscard={onDiscard}
            />
          )}
        </section>
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */

function Shell({
  actions,
  children,
}: {
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className='mx-auto flex max-w-[96rem] flex-col gap-5 px-5 pb-5 pt-5 sm:px-8 lg:h-[calc(100vh-4.625rem)]'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
            Master resume
          </h1>
          <p className='mt-1 text-sm text-muted'>
            The source every tailored resume starts from. Tailoring can reorder
            and trim it, never add to it.
          </p>
        </div>
        {actions}
      </div>
      {children}
    </main>
  );
}

const label = (path: string) =>
  path
    .replace(/^(locked|tailorable)\./, '')
    .split('.')
    .join(' › ');

function ImportBanner({
  note,
  onDismiss,
}: {
  note: ImportNote;
  onDismiss: () => void;
}) {
  const attention = [
    ...note.warnings,
    ...note.issues.map((issue) => `${label(issue.path)}: ${issue.message}`),
  ];
  const shown = attention.slice(0, 8);

  return (
    <div className='animate-paper-in rounded-md border-l-4 border-marker bg-white px-4 py-3 text-sm shadow-[0_0_0_1px_rgba(17,24,39,0.06)]'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='font-medium'>Read from {note.fileName}</p>
          <p className='mt-1 text-muted'>
            The model can misread a resume. Check every field against the
            original PDF on the left, then save.
          </p>
        </div>
        <button
          type='button'
          onClick={onDismiss}
          className='shrink-0 rounded-md px-2 py-1 text-muted transition hover:bg-black/5 hover:text-ink'
        >
          Dismiss
        </button>
      </div>
      {shown.length > 0 && (
        <>
          <p className='mt-3 font-medium'>Needs your attention</p>
          <ul className='mt-1 list-disc space-y-1 pl-4 text-muted'>
            {shown.map((item) => (
              <li key={item}>{item}</li>
            ))}
            {attention.length > shown.length && (
              <li>and {attention.length - shown.length} more</li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}

function SaveFooter({
  dirty,
  hasSaved,
  state,
  error,
  onSave,
  onDiscard,
}: {
  dirty: boolean;
  hasSaved: boolean;
  state: SaveState;
  error: string | null;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className='sticky bottom-3 z-10 lg:static'>
      {state === 'error' && error && (
        <div className='mb-2'>
          <Alert tone='error' title="Couldn't save">
            {error}
          </Alert>
        </div>
      )}
      <div className='flex items-center justify-between gap-3 rounded-lg bg-ink px-4 py-3 text-white shadow-[0_18px_40px_-14px_rgba(17,24,39,0.6)]'>
        <p className='flex items-center gap-2 text-sm' aria-live='polite'>
          {state === 'saved' ? (
            <>
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
              Saved
            </>
          ) : dirty ? (
            hasSaved ? (
              'Unsaved changes'
            ) : (
              'Not saved yet'
            )
          ) : (
            <span className='text-white/60'>All changes saved</span>
          )}
        </p>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            onClick={onDiscard}
            disabled={!dirty || state === 'saving'}
            className='text-white/70 hover:bg-white/10 hover:text-white'
          >
            Discard
          </Button>
          <Button
            variant='secondary'
            onClick={onSave}
            busy={state === 'saving'}
            disabled={!dirty}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

function LoadingSheet({ label, message }: { label: string; message?: string }) {
  return (
    <div className='space-y-4' aria-busy='true' aria-label={label}>
      <p className='text-sm text-muted'>
        <span className='font-medium text-ink'>{label}…</span> {message}
      </p>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className='rounded-lg bg-white/60 p-5 shadow-[0_0_0_1px_rgba(17,24,39,0.06)]'
        >
          <div
            className='sheet-line w-1/4'
            style={{ ['--d' as string]: `${i * 0.3}s` }}
          />
          <div className='mt-5 space-y-3'>
            <div
              className='sheet-line w-full'
              style={{ ['--d' as string]: `${i * 0.3 + 0.15}s` }}
            />
            <div
              className='sheet-line w-5/6'
              style={{ ['--d' as string]: `${i * 0.3 + 0.3}s` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
