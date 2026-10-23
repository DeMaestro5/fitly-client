import { useCallback, useEffect, useState } from 'react';
import {
  listJobs,
  type JobListItem,
  type JobQuery,
  type JobsPage,
} from '../api/jobs';

export function useJobs(query: JobQuery) {
  const [data, setData] = useState<JobsPage | null>(null);
  // Which request this outcome belongs to, so loading/error can be worked out, not stored.
  const [outcome, setOutcome] = useState<{
    key: string;
    error: string | null;
  } | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // A string key tells the effect "the query really changed" (objects are new on every render).
  const queryKey = JSON.stringify(query);
  const requestKey = `${queryKey}#${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();
    listJobs(JSON.parse(queryKey) as JobQuery, controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return;
        setData(page);
        setOutcome({ key: requestKey, error: null });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return; // a newer request replaced this one
        setOutcome({
          key: requestKey,
          error: err instanceof Error ? err.message : 'Could not load jobs',
        });
      });
    return () => controller.abort(); // cancel the old request when filters change
  }, [queryKey, requestKey]);

  // The latest request has not answered yet -> loading. Old data stays on screen meanwhile.
  const loading = outcome?.key !== requestKey;
  const error = outcome?.key === requestKey ? outcome.error : null;

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  // After a PATCH, update that one row in place instead of reloading the whole page.
  const replaceItem = useCallback((job: JobListItem) => {
    setData((prev) =>
      prev
        ? { ...prev, items: prev.items.map((i) => (i.id === job.id ? job : i)) }
        : prev,
    );
  }, []);

  return { data, loading, error, reload, replaceItem };
}
