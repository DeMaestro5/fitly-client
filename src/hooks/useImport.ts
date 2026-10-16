import { useCallback, useEffect, useRef, useState } from 'react';
import { importResume, isAbort } from '../api/client';
import type { ImportResult } from '../api/types';

export function useImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const run = useCallback(async (file: File): Promise<ImportResult | null> => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setLoading(true);
    setError(null);
    try {
      return await importResume(file, current.signal);
    } catch (e) {
      if (!isAbort(e))
        setError(
          e instanceof Error ? e.message : 'Could not read that resume.'
        );
      return null;
    } finally {
      if (!current.signal.aborted) setLoading(false);
    }
  }, []);

  return { run, loading, error };
}
