import { useCallback, useEffect, useRef, useState } from 'react';
import { isAbort, tailorResume } from '../api/client';
import type { TailorResult } from '../api/types';

export function useTailor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  const run = useCallback(
    async (jobText: string): Promise<TailorResult | null> => {
      controller.current?.abort();
      const current = new AbortController();
      controller.current = current;
      setLoading(true);
      setError(null);
      try {
        return await tailorResume(jobText, current.signal);
      } catch (e) {
        if (!isAbort(e))
          setError(e instanceof Error ? e.message : 'Tailoring failed.');
        return null;
      } finally {
        if (controller.current === current) setLoading(false);
      }
    },
    []
  );

  const cancel = useCallback(() => controller.current?.abort(), []);

  useEffect(() => () => controller.current?.abort(), []);

  return { run, cancel, loading, error };
}
