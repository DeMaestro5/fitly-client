import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { UiFilters } from '../lib/job-filters';

export interface PendingApply {
  id: string;
  title: string;
  company: string;
}

export interface JobsView {
  ui: UiFilters;
  setUi: Dispatch<SetStateAction<UiFilters>>;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  pending: PendingApply | null;
  setPending: (pending: PendingApply | null) => void;
  getScrollY: () => number;
  rememberScroll: (y: number) => void;
}

export const JobsViewContext = createContext<JobsView | null>(null);

export function useJobsView(): JobsView {
  const value = useContext(JobsViewContext);
  if (!value)
    throw new Error('useJobsView must be used inside JobsViewProvider');
  return value;
}
