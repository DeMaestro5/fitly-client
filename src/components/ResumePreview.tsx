interface Props {
  html: string | null;
  version: number;
  loading: boolean;
}

/** Shows the HTML the backend rendered. No resume layout lives in the client. */
export function ResumePreview({ html, version, loading }: Props) {
  return (
    <div className='relative flex-1 overflow-hidden rounded-lg ring-1 ring-black/10'>
      {loading && (
        <div className='absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-black/5'>
          <div className='h-full w-2/5 animate-slide bg-ink' />
        </div>
      )}
      {html ? (
        <iframe
          key={version}
          title='Resume preview'
          srcDoc={html}
          sandbox=''
          className={`h-full w-full animate-paper-in bg-desk transition-opacity duration-200 ${
            loading ? 'opacity-60' : 'opacity-100'
          }`}
        />
      ) : (
        <div className='grid h-full place-items-center text-sm text-muted'>
          Preparing preview…
        </div>
      )}
    </div>
  );
}
