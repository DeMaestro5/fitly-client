import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { TailorResult } from '../api/types';

interface Saved {
  jobText: string;
  result: TailorResult | null;
  templateId: string | null;
}

interface Session extends Saved {
  setJobText: (value: string) => void;
  setResult: (value: TailorResult | null) => void;
  setTemplateId: (value: string) => void;
}

const KEY = 'fitly.session.V3';
const EMPTY: Saved = { jobText: '', result: null, templateId: null };

// A tailor run costs model quota, so a refresh should not throw the result away.
function load(): Saved {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Saved>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

const SessionContext = createContext<Session | null>(null);

export function ResumeSessionProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Saved>(load);

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(saved));
    } catch {
      // Storage unavailable; the app still works for this visit.
    }
  }, [saved]);

  const setJobText = useCallback(
    (jobText: string) => setSaved((s) => ({ ...s, jobText })),
    []
  );
  const setResult = useCallback(
    (result: TailorResult | null) => setSaved((s) => ({ ...s, result })),
    []
  );
  const setTemplateId = useCallback(
    (templateId: string) => setSaved((s) => ({ ...s, templateId })),
    []
  );

  const value = useMemo(
    () => ({ ...saved, setJobText, setResult, setTemplateId }),
    [saved, setJobText, setResult, setTemplateId]
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useResumeSession(): Session {
  const session = useContext(SessionContext);
  if (!session)
    throw new Error(
      'useResumeSession must be used inside ResumeSessionProvider'
    );
  return session;
}
