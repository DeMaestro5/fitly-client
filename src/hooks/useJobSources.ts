import { useCallback, useEffect, useState } from 'react';
import {
  getSources,
  refreshJobs,
  type RefreshReport,
  type SourceOverview,
} from '../api/jobs';

export function useJobSources() {
  const [sources, setSources] = useState<SourceOverview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastReports, setLastReports] = useState<RefreshReport[] | null>(null);

  // Used by refresh() after the server has fetched new data.
  const load = useCallback(async () => {
    try {
      setSources(await getSources());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load sources');
    }
  }, []);

  // First load: setState only runs inside the callbacks, once the data has arrived.
  useEffect(() => {
    let cancelled = false;
    getSources()
      .then((list) => {
        if (cancelled) return;
        setSources(list);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Could not load sources');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Returns the reports (or null on failure) so the page can reload the job list after.
  const refresh = useCallback(async (): Promise<RefreshReport[] | null> => {
    setRefreshing(true);
    try {
      const reports = await refreshJobs();
      setLastReports(reports);
      await load();
      return reports;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed');
      return null;
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  return { sources, error, refreshing, lastReports, refresh };
}
