import { useCallback, useEffect, useState } from 'react';
import { getJob, type JobDetail } from '../api/jobs';

export function useJobDetail(id: string | null) {
  // The result remembers which job id it belongs to.
  const [result, setResult] = useState<{
    id: string;
    job: JobDetail | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    getJob(id, controller.signal)
      .then((job) => {
        if (!controller.signal.aborted) setResult({ id, job, error: null });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setResult({
          id,
          job: null,
          error: err instanceof Error ? err.message : 'Could not load this job',
        });
      });
    return () => controller.abort();
  }, [id]);

  // A result only counts if it belongs to the job that is selected right now.
  const current = result && result.id === id ? result : null;

  // Used after a PATCH to show the saved version.
  const setJob = useCallback(
    (job: JobDetail) => setResult({ id: job.id, job, error: null }),
    [],
  );

  return {
    job: current?.job ?? null,
    loading: id !== null && current === null,
    error: current?.error ?? null,
    setJob,
  };
}
