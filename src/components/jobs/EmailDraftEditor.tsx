import { useEffect, useRef, useState } from 'react';
import type { JobEmailDraft } from '../../api/client';
import { Button } from '../Button';

interface Props {
  draft: JobEmailDraft;
  onRedraft: () => void;
  onOpenedMail: () => void;
}

const field =
  'w-full rounded-xl bg-white px-3 py-2 text-sm text-ink ring-1 ring-inset ring-line outline-none focus:ring-2 focus:ring-ink/30';

export function EmailDraftEditor({ draft, onRedraft, onOpenedMail }: Props) {
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked by the browser; the text can still be selected by hand.
    }
  };

  const openMail = () => {
    window.location.href = `mailto:${draft.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    onOpenedMail();
  };

  return (
    <div className='space-y-3'>
      <p className='text-sm text-muted'>
        To: <span className='text-ink'>{draft.to}</span>
      </p>
      <input
        aria-label='Email subject'
        className={field}
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        aria-label='Email body'
        className={`${field} resize-y`}
        rows={13}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <p className='text-xs text-muted'>
        A mail link cannot attach files. Download your tailored PDF from the
        Tailor tab and attach it before sending.
      </p>
      <div className='flex flex-wrap gap-2'>
        <Button onClick={openMail}>Open in mail app</Button>
        <Button variant='secondary' onClick={() => void copy()}>
          {copied ? 'Copied' : 'Copy body'}
        </Button>
        <Button variant='ghost' onClick={onRedraft}>
          Redraft
        </Button>
      </div>
    </div>
  );
}
