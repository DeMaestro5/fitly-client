import { useEffect, useState } from 'react';
import { fetchDraftPreview, isAbort } from '../api/client';
import type { MasterResume } from '../api/types';

const DELAY_MS = 500;

/**
 * Renders the unsaved draft on the backend a moment after the last keystroke.
 * The last good preview stays on screen while the draft is incomplete.
 */
export function useDraftPreview(
  resume: MasterResume | null,
  templateId: string | null,
  enabled: boolean
) {
  const [html, setHtml] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !resume || !templateId) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      fetchDraftPreview(resume, templateId, controller.signal)
        .then((next) => {
          setHtml(next);
          setVersion((v) => v + 1);
          setError(null);
        })
        .catch((e: unknown) => {
          if (!isAbort(e))
            setError(e instanceof Error ? e.message : 'Preview failed.');
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [resume, templateId, enabled]);

  return { html, version, loading, error };
}
