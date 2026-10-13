import { useEffect, useState } from 'react';
import { fetchTemplates, isAbort } from '../api/client';
import type { Template } from '../api/types';

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetchTemplates(controller.signal)
      .then(setTemplates)
      .catch((e: unknown) => {
        if (!isAbort(e))
          setError(
            e instanceof Error ? e.message : 'Could not load templates.'
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return { templates, error, loading };
}
