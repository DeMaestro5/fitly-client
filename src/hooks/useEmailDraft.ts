import { useCallback, useEffect, useRef, useState } from 'react';
import { draftJobEmail, isAbort, type JobEmailDraft } from '../api/client';

interface State {
  jobId: string;
  draft: JobEmailDraft | null;
  error: string | null;
  busy: boolean;
}

export function useEmailDraft(jobId: string) {
  const [state, setState] = useState<State | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // Switching jobs (or leaving the page) cancels a draft still being written.
  useEffect(() => () => controllerRef.current?.abort(), [jobId]);

  const generate = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ jobId, draft: null, error: null, busy: true });
    try {
      const draft = await draftJobEmail(jobId, controller.signal);
      if (!controller.signal.aborted) {
        setState({ jobId, draft, error: null, busy: false });
      }
    } catch (err) {
      if (isAbort(err) || controller.signal.aborted) return;
      setState({
        jobId,
        draft: null,
        error: err instanceof Error ? err.message : 'Could not draft the email',
        busy: false,
      });
    }
  }, [jobId]);

  // A result only counts for the job that is selected right now.
  const current = state && state.jobId === jobId ? state : null;

  return {
    draft: current?.draft ?? null,
    busy: current?.busy ?? false,
    error: current?.error ?? null,
    generate,
  };
}
