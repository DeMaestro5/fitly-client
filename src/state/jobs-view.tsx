import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_FILTERS, type UiFilters } from '../lib/job-filters';
import { JobsViewContext, type PendingApply } from './jobs-view-context';

const VIEW_KEY = 'fitly.jobs.view.v1';
const SCROLL_KEY = 'fitly.jobs.scroll.v1';

interface StoredView {
  ui: UiFilters;
  selectedId: string | null;
  pending: PendingApply | null;
}

function loadView(): StoredView {
  const fallback: StoredView = {
    ui: DEFAULT_FILTERS,
    selectedId: null,
    pending: null,
  };
  try {
    const raw = localStorage.getItem(VIEW_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<StoredView>;
    const ui = { ...DEFAULT_FILTERS, ...(parsed.ui ?? {}) };
    return {
      ui: { ...ui, page: Math.max(1, Number(ui.page) || 1) },
      selectedId:
        typeof parsed.selectedId === 'string' ? parsed.selectedId : null,
      pending:
        parsed.pending && typeof parsed.pending.id === 'string'
          ? parsed.pending
          : null,
    };
  } catch {
    return fallback;
  }
}

function loadScroll(): number {
  try {
    return Number(localStorage.getItem(SCROLL_KEY)) || 0;
  } catch {
    return 0;
  }
}

// Lives above the routes, so leaving the Jobs tab does not throw this state away.
export function JobsViewProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadView);
  const [initialScroll] = useState(loadScroll);
  const [ui, setUi] = useState<UiFilters>(initial.ui);
  const [selectedId, setSelectedId] = useState<string | null>(
    initial.selectedId,
  );
  const [pending, setPending] = useState<PendingApply | null>(initial.pending);
  const scrollRef = useRef(initialScroll);

  // Saved on every change so a reload picks up where you were.
  useEffect(() => {
    try {
      localStorage.setItem(
        VIEW_KEY,
        JSON.stringify({ ui, selectedId, pending }),
      );
    } catch {
      // storage unavailable (private window): the view just will not survive a reload
    }
  }, [ui, selectedId, pending]);

  const rememberScroll = useCallback((y: number) => {
    scrollRef.current = y;
    try {
      localStorage.setItem(SCROLL_KEY, String(Math.round(y)));
    } catch {
      // see above
    }
  }, []);

  const getScrollY = useCallback(() => scrollRef.current, []);

  const value = useMemo(
    () => ({
      ui,
      setUi,
      selectedId,
      setSelectedId,
      pending,
      setPending,
      getScrollY,
      rememberScroll,
    }),
    [ui, selectedId, pending, getScrollY, rememberScroll],
  );

  return (
    <JobsViewContext.Provider value={value}>
      {children}
    </JobsViewContext.Provider>
  );
}
