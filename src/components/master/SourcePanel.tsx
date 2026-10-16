import type { Template } from '../../api/types';
import { useIndicator } from '../../hooks/useIndicator';
import { ResumePreview } from '../ResumePreview';

export type View = 'original' | 'live';

interface Props {
  pdfUrl: string | null;
  view: View;
  onView: (view: View) => void;
  templates: Template[];
  templateId: string | null;
  onTemplate: (id: string) => void;
  preview: {
    html: string | null;
    version: number;
    loading: boolean;
    error: string | null;
  };
}

/** Left side: the PDF you uploaded, or a live render of what you are editing. */
export function SourcePanel({
  pdfUrl,
  view,
  onView,
  templates,
  templateId,
  onTemplate,
  preview,
}: Props) {
  const { ref, box, animate } = useIndicator<HTMLDivElement>(view);

  return (
    <section
      className='flex min-h-[70vh] min-w-0 flex-col lg:min-h-0'
      aria-label='Resume view'
    >
      <div className='mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2'>
        <div
          ref={ref}
          role='tablist'
          aria-label='Resume view'
          className='relative flex items-stretch'
        >
          <Tab
            id='original'
            current={view}
            onSelect={onView}
            disabled={!pdfUrl}
          >
            Original PDF
          </Tab>
          <Tab id='live' current={view} onSelect={onView}>
            Live preview
          </Tab>
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

        {view === 'live' && templates.length > 0 && (
          <label className='flex items-center gap-2 text-sm text-muted'>
            Template
            <select
              value={templateId ?? ''}
              onChange={(e) => onTemplate(e.target.value)}
              className='h-9 rounded-lg bg-white px-2 text-sm text-ink outline-none ring-1 ring-inset ring-line transition focus:ring-2'
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {view === 'original' && pdfUrl && (
        <div className='relative flex-1 overflow-hidden rounded-lg bg-white ring-1 ring-black/10'>
          <iframe
            title='Your uploaded resume'
            src={pdfUrl}
            className='h-full w-full'
          />
        </div>
      )}

      {view === 'live' && (
        <>
          {preview.error && (
            <p
              role='status'
              className='mb-3 rounded-md border-l-4 border-amber-500 bg-white px-3 py-2 text-sm text-muted shadow-[0_0_0_1px_rgba(17,24,39,0.06)]'
            >
              Preview paused: {preview.error}
            </p>
          )}
          <ResumePreview
            html={preview.html}
            version={preview.version}
            loading={preview.loading}
          />
        </>
      )}
    </section>
  );
}

function Tab({
  id,
  current,
  onSelect,
  disabled = false,
  children,
}: {
  id: View;
  current: View;
  onSelect: (view: View) => void;
  disabled?: boolean;
  children: string;
}) {
  return (
    <button
      type='button'
      role='tab'
      data-key={id}
      aria-selected={current === id}
      disabled={disabled}
      title={disabled ? 'Upload a PDF to compare with it' : undefined}
      onClick={() => onSelect(id)}
      className={`flex h-10 items-center whitespace-nowrap px-3 text-sm font-medium transition-colors enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 ${
        current === id ? 'text-ink' : 'text-muted'
      }`}
    >
      {children}
    </button>
  );
}
