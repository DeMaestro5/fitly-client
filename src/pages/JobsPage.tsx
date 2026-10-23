import { useMemo, useState } from 'react';
import { updateJob, type JobStatus } from '../api/jobs';
import { JobDetailPanel } from '../components/jobs/JobDetailPanel';
import { JobFilters } from '../components/jobs/JobFilters';
import { JobRow } from '../components/jobs/JobRow';
import { SourceDots } from '../components/jobs/SourceDots';
import { RefreshIcon, SearchIcon } from '../components/ui/icons';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useJobDetail } from '../hooks/useJobDetail';
import { useJobSources } from '../hooks/useJobSources';
import { useJobs } from '../hooks/useJobs';
import { timeAgo } from '../lib/format';
import { DEFAULT_FILTERS, toQuery, type UiFilters } from '../lib/job-filters';

const pagerButton =
  'inline-flex h-9 items-center rounded-xl border border-black/[0.08] bg-white/80 px-3.5 text-sm font-medium text-ink transition hover:border-black/25 disabled:opacity-40';

export function JobsPage() {
  const [ui, setUi] = useState<UiFilters>(DEFAULT_FILTERS);
  const debouncedQ = useDebouncedValue(ui.q);
  const query = useMemo(() => toQuery(ui, debouncedQ), [ui, debouncedQ]);

  const jobs = useJobs(query);
  const sources = useJobSources();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detail = useJobDetail(selectedId);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Any filter change goes back to page 1; a page change passes page explicitly.
  const update = (patch: Partial<UiFilters>) =>
    setUi((prev) => ({ ...prev, page: 1, ...patch }));

  const listItem = jobs.data?.items.find((j) => j.id === selectedId) ?? null;

  async function save(patch: { status?: JobStatus; notes?: string | null }) {
    if (!selectedId) return;
    setSaving(true);
    setActionError(null);
    try {
      const updated = await updateJob(selectedId, patch);
      detail.setJob(updated);
      jobs.replaceItem(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  async function handleRefresh() {
    const reports = await sources.refresh();
    if (reports) jobs.reload();
  }

  const reports = sources.lastReports;
  const refreshNote = reports
    ? `${reports.filter((r) => r.outcome === 'fetched').length} fetched, ` +
      `${reports.filter((r) => r.outcome === 'skipped').length} still fresh, ` +
      `${reports.filter((r) => r.outcome === 'failed').length} failed, ` +
      `${reports.reduce((sum, r) => sum + r.inserted, 0)} new jobs`
    : null;

  const fetchTimes = sources.sources
    .map((s) => (s.fetchedAt ? Date.parse(s.fetchedAt) : 0))
    .filter(Boolean);
  const lastUpdated = fetchTimes.length
    ? timeAgo(new Date(Math.max(...fetchTimes)).toISOString())
    : 'never';

  const failedSources = sources.sources.filter((s) => s.ok === false);
  const data = jobs.data;

  return (
    <div className='mx-auto max-w-7xl px-5 py-8 sm:px-8'>
      <header className='mb-6 flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-muted ring-1 ring-black/[0.06]'>
            <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
            {data ? `${data.total} jobs` : 'Loading'} · updated {lastUpdated}
          </p>
          <h1 className='text-3xl font-semibold tracking-tight text-ink'>
            Jobs
          </h1>
          <p className='mt-2 max-w-xl text-[15px] text-muted'>
            Remote roles from free sources, ranked by how well they fit your
            stack.
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <SourceDots sources={sources.sources} />
          <button
            type='button'
            onClick={handleRefresh}
            disabled={sources.refreshing}
            className='inline-flex h-9 items-center gap-2 rounded-xl bg-ink px-3.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60'
          >
            <RefreshIcon
              className={`h-4 w-4 ${sources.refreshing ? 'animate-spin' : ''}`}
            />
            {sources.refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      {refreshNote && (
        <p className='mb-2 text-sm text-muted'>Last refresh: {refreshNote}</p>
      )}
      {sources.error && (
        <p role='alert' className='mb-2 text-sm text-danger'>
          {sources.error}
        </p>
      )}
      {failedSources.length > 0 && (
        <p role='alert' className='mb-2 text-sm text-danger'>
          {failedSources.map((s) => `${s.source}: ${s.error}`).join(' · ')}
        </p>
      )}

      <JobFilters value={ui} onChange={update} />

      <div className='mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]'>
        <section aria-label='Job list'>
          {jobs.error && (
            <div
              role='alert'
              className='mb-3 rounded-2xl border border-danger bg-white/80 p-4 text-sm text-danger'
            >
              {jobs.error}{' '}
              <button
                type='button'
                onClick={jobs.reload}
                className='font-medium underline'
              >
                Retry
              </button>
            </div>
          )}

          {jobs.loading && !data && (
            <div className='space-y-2' aria-busy='true'>
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className='rounded-xl border border-black/[0.07] bg-white/80 px-4 py-3'
                >
                  <div className='h-3.5 w-3/4 animate-pulse rounded bg-black/[0.06]' />
                  <div className='mt-2 h-3 w-1/2 animate-pulse rounded bg-black/[0.06]' />
                  <div className='mt-3 h-4 w-2/3 animate-pulse rounded bg-black/[0.06]' />
                </div>
              ))}
            </div>
          )}

          {data && data.items.length === 0 && !jobs.error && (
            <div className='rounded-2xl border border-dashed border-black/15 bg-white/50 p-10 text-center'>
              <div className='mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]'>
                <SearchIcon className='h-5 w-5 text-muted' />
              </div>
              <p className='mt-4 font-medium text-ink'>
                No jobs match these filters
              </p>
              <p className='mt-1 text-sm text-muted'>
                {ui.bestOnly ? 'Try turning off “Best matches”, or ' : 'Try '}
                <button
                  type='button'
                  onClick={() => update({ ...DEFAULT_FILTERS })}
                  className='underline underline-offset-4 hover:text-ink'
                >
                  reset the filters
                </button>
                .
              </p>
            </div>
          )}

          {data && data.items.length > 0 && (
            <ul
              className={`space-y-2 transition-opacity ${jobs.loading ? 'opacity-60' : ''}`}
            >
              {data.items.map((job, index) => (
                <li key={job.id}>
                  <JobRow
                    job={job}
                    index={index}
                    selected={job.id === selectedId}
                    onSelect={setSelectedId}
                  />
                </li>
              ))}
            </ul>
          )}

          {data && data.totalPages > 1 && (
            <nav
              className='mt-4 flex items-center justify-between text-sm text-muted'
              aria-label='Pages'
            >
              <button
                type='button'
                disabled={data.page <= 1 || jobs.loading}
                onClick={() => update({ page: data.page - 1 })}
                className={pagerButton}
              >
                Previous
              </button>
              <span>
                Page {data.page} of {data.totalPages}
              </span>
              <button
                type='button'
                disabled={data.page >= data.totalPages || jobs.loading}
                onClick={() => update({ page: data.page + 1 })}
                className={pagerButton}
              >
                Next
              </button>
            </nav>
          )}
        </section>

        <aside className='lg:sticky lg:top-24 lg:self-start'>
          <JobDetailPanel
            listItem={listItem}
            detail={detail.job}
            loading={detail.loading}
            error={detail.error}
            saving={saving}
            actionError={actionError}
            onStatus={(status) => void save({ status })}
            onNotes={(notes) => void save({ notes })}
          />
        </aside>
      </div>
    </div>
  );
}
