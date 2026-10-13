import { useEffect, useState } from 'react';
import { fetchPreview, isAbort } from '../api/client';
import type { Tailorable } from '../api/types';

/** Loads the backend-rendered HTML for the chosen template. */
export function usePreview(tailorable: Tailorable, templateId: string | null) {
  const [html, setHtml] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchPreview({ tailorable, templateId }, controller.signal)
      .then((next) => {
        setHtml(next);
        setVersion((v) => v + 1);
      })
      .catch((e: unknown) => {
        if (!isAbort(e))
          setError(e instanceof Error ? e.message : 'Preview failed.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [tailorable, templateId]);

  return { html, version, loading, error };
}
