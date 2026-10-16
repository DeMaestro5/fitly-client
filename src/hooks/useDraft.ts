import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchDraftPdf } from '../api/client';
import type { MasterResume } from '../api/types';

type Status = 'idle' | 'working' | 'done';

/** Downloads the unsaved draft as a PDF in the chosen template. */
export function useDraftPdf() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const reset = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(reset.current), []);

  const download = useCallback(
    async (resume: MasterResume, templateId: string) => {
      window.clearTimeout(reset.current);
      setStatus('working');
      setError(null);
      try {
        const { blob, fileName } = await fetchDraftPdf(resume, templateId);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        setStatus('done');
        reset.current = window.setTimeout(() => setStatus('idle'), 2600);
      } catch (e) {
        setStatus('idle');
        setError(e instanceof Error ? e.message : 'Download failed.');
      }
    },
    []
  );

  return { status, error, download };
}
