import { useRef, useState, type DragEvent } from 'react';
import { Button } from '../Button';

interface Props {
  onFile: (file: File) => void;
  onScratch: () => void;
  error: string | null;
}

/** Shown until a master resume exists: drop your PDF here, or pick one. */
export function UploadZone({ onFile, onScratch, error }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setOver(false);
    const file = event.dataTransfer.files[0];
    if (file) onFile(file);
  }

  return (
    <div className='mx-auto mt-6 max-w-2xl'>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={`rounded-lg border-2 border-dashed px-6 py-16 text-center transition-colors ${
          over ? 'border-ink bg-white' : 'border-line bg-white/50'
        }`}
      >
        <svg
          viewBox='0 0 24 24'
          className='mx-auto size-9 text-ink'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.6'
          aria-hidden='true'
        >
          <path
            d='M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z'
            strokeLinejoin='round'
          />
          <path
            d='M14 3v5h5M12 17v-6m0 0-2.5 2.5M12 11l2.5 2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
        <h2 className='mt-4 text-xl font-semibold tracking-tight'>
          Upload your resume
        </h2>
        <p className='mx-auto mt-2 max-w-sm text-muted'>
          Drop the PDF you already have. Fitly reads it and fills in every field
          for you to check.
        </p>
        <div className='mt-6 flex flex-wrap items-center justify-center gap-3'>
          <Button onClick={() => input.current?.click()}>Choose PDF</Button>
          <Button variant='ghost' onClick={onScratch}>
            Start from scratch
          </Button>
        </div>
        <p className='mt-4 text-xs text-muted'>
          PDF with selectable text, up to 10 MB
        </p>
        <input
          ref={input}
          type='file'
          accept='application/pdf,.pdf'
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) onFile(file);
          }}
        />
      </div>
      {error && (
        <p role='alert' className='mt-4 text-center text-sm text-danger'>
          {error}
        </p>
      )}
    </div>
  );
}
