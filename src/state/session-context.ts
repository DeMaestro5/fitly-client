import { createContext, useContext } from 'react';
import type { TailorResult } from '../api/types';

export interface Saved {
  jobText: string;
  result: TailorResult | null;
  templateId: string | null;
}

export interface Session extends Saved {
  setJobText: (value: string) => void;
  setResult: (value: TailorResult | null) => void;
  setTemplateId: (value: string) => void;
}

export const SessionContext = createContext<Session | null>(null);

export function useResumeSession(): Session {
  const session = useContext(SessionContext);
  if (!session)
    throw new Error(
      'useResumeSession must be used inside ResumeSessionProvider',
    );
  return session;
}
