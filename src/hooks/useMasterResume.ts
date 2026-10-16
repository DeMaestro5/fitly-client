import { useCallback, useEffect, useState } from 'react';
import { ApiError, fetchMaster, isAbort, saveMaster } from '../api/client';
import type { MasterResume } from '../api/types';

export function useMasterResume() {
  const [master, setMaster] = useState<MasterResume | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchMaster(controller.signal)
      .then((next) => {
        setMaster(next);
        setMissing(false);
      })
      .catch((e: unknown) => {
        if (isAbort(e)) return;
        // The API answers 404 until a master resume has been saved once.
        if (e instanceof ApiError && e.status === 404) setMissing(true);
        else
          setError(
            e instanceof Error
              ? e.message
              : 'Could not load your master resume.'
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  const save = useCallback(async (next: MasterResume) => {
    await saveMaster(next);
    setMaster(next);
    setMissing(false);
  }, []);

  return { master, missing, error, loading, reload, save };
}
