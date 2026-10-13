import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPdf } from '../api/client';
import type { RenderRequest } from '../api/types';

type Status = 'idle' | 'working' | 'done';

export function useDownload() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const reset = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(reset.current), []);

  const download = useCallback(async (request: RenderRequest) => {
    window.clearTimeout(reset.current);
    setStatus('working');
    setError(null);
    try {
      const { blob, fileName } = await fetchPdf(request);
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
  }, []);

  return { status, error, download };
}
