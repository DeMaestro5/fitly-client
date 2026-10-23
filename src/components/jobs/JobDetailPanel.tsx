import { useState, type ReactNode } from 'react';
import type { JobDetail, JobListItem, JobStatus } from '../../api/jobs';
import {
  SCORE_LABELS,
  SOURCE_LABELS,
  postedLabel,
  scoreBand,
} from '../../lib/format';
import { Badge } from '../ui/Badge';
import {
  BanIcon,
  BookmarkIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  CoinIcon,
  ExternalIcon,
  PinIcon,
} from '../ui/icons';
import { CompanyAvatar } from './CompanyAvatar';
import { DescriptionText } from './DescriptionText';
import { ScoreRing } from './ScoreRing';

interface Props {
  listItem: JobListItem | null;
  detail: JobDetail | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  actionError: string | null;
  onStatus: (status: JobStatus) => void;
  onNotes: (notes: string | null) => void;
}

const ACTIONS: {
  status: JobStatus;
  label: string;
  icon: ReactNode;
  active: string;
}[] = [
  {
    status: 'saved',
    label: 'Save',
    icon: <BookmarkIcon />,
    active: 'border-sky-300 bg-sky-50 text-sky-800',
  },
  {
    status: 'applied',
    label: 'Applied',
    icon: <CheckCircleIcon />,
    active: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  },
  {
    status: 'skipped',
    label: 'Skip',
    icon: <BanIcon />,
    active: 'border-black/30 bg-black/[0.06] text-ink',
  },
];

function Meta({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className='inline-flex items-center gap-1.5 text-sm text-muted'>
      {icon}
      {children}
    </span>
  );
}

function NotesEditor(props: {
  initial: string | null;
  saving: boolean;
  onSave: (notes: string | null) => void;
}) {
  const [text, setText] = useState(props.initial ?? '');
  const dirty = text !== (props.initial ?? '');
  return (
    <div className='rounded-2xl bg-black/[0.03] p-4'>
      <label
        htmlFor='job-notes'
        className='text-xs font-semibold uppercase tracking-wider text-muted'
      >
        Your notes
      </label>
      <textarea
        id='job-notes'
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder='Who you emailed, what to follow up on…'
        className='mt-2 w-full resize-none rounded-xl border border-transparent bg-white p-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-ink focus:ring-4 focus:ring-black/[0.06]'
      />
      {dirty && (
        <button
          type='button'
          disabled={props.saving}
          onClick={() => props.onSave(text.trim() ? text : null)}
          className='fade-up mt-2 rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50'
        >
          Save note
        </button>
      )}
    </div>
  );
}

export function JobDetailPanel({
  listItem,
  detail,
  loading,
  error,
  saving,
  actionError,
  onStatus,
  onNotes,
}: Props) {
  const job = detail ?? listItem; // show list data instantly, the description follows
  if (!job) {
    return (
      <div className='grid min-h-[22rem] place-items-center rounded-3xl border border-dashed border-black/15 bg-white/40 p-10 text-center'>
        <div>
          <div className='mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]'>
            <BriefcaseIcon className='h-5 w-5 text-muted' />
          </div>
          <p className='mt-4 font-medium text-ink'>
            Pick a job to see the details
          </p>
          <p className='mt-1 text-sm text-muted'>
            Save it, mark it applied or skip it. Your notes stay with the job.
          </p>
        </div>
      </div>
    );
  }

  return (
    <article
      key={job.id}
      className='fade-up flex max-h-[calc(100vh-7.5rem)] flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-md'
    >
      <div className='border-b border-black/[0.06] bg-gradient-to-br from-amber-50 via-white to-white p-5'>
        <div className='flex items-start gap-4'>
          <CompanyAvatar name={job.company} />
          <div className='min-w-0 flex-1'>
            <p className='text-xs font-medium uppercase tracking-wider text-muted'>
              {job.company} · {SOURCE_LABELS[job.source]}
            </p>
            <h2 className='mt-1 text-xl font-semibold leading-snug tracking-tight text-ink'>
              {job.title}
            </h2>
            <div className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-2'>
              {job.regionNote && (
                <Badge tone='amber' icon={<PinIcon className='h-3 w-3' />}>
                  {job.regionNote}
                </Badge>
              )}
              {job.location && job.location !== job.regionNote && (
                <Meta icon={<PinIcon />}>{job.location}</Meta>
              )}
              {job.employmentType && (
                <Meta icon={<BriefcaseIcon />}>{job.employmentType}</Meta>
              )}
              {job.salaryText && (
                <Meta icon={<CoinIcon />}>{job.salaryText}</Meta>
              )}
              <Meta icon={<ClockIcon />}>
                {postedLabel(job.postedAt, job.firstSeenAt)}
              </Meta>
            </div>
          </div>
          <div className='flex shrink-0 flex-col items-center gap-1'>
            <ScoreRing score={job.score} size={48} />
            <span className='text-[11px] font-medium uppercase tracking-wider text-muted'>
              {SCORE_LABELS[scoreBand(job.score)]} match
            </span>
          </div>
        </div>

        {job.matched.length > 0 && (
          <div className='mt-4 flex flex-wrap items-center gap-1.5'>
            <span className='mr-1 text-xs font-medium text-muted'>
              Matches your stack
            </span>
            {job.matched.map((skill) => (
              <span
                key={skill}
                className='inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800'
              >
                <CheckIcon className='h-3 w-3' />
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className='mt-5 flex flex-wrap items-center gap-2'>
          <a
            href={job.applyUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex h-9 items-center gap-2 rounded-xl bg-ink px-3.5 text-sm font-medium text-white transition hover:opacity-90'
          >
            Open job
            <ExternalIcon className='h-4 w-4' />
          </a>
          {ACTIONS.map((action) => {
            const active = job.status === action.status;
            return (
              <button
                key={action.status}
                type='button'
                disabled={saving}
                aria-pressed={active}
                // Clicking the active status again puts the job back to "new".
                onClick={() => onStatus(active ? 'new' : action.status)}
                className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-sm font-medium transition disabled:opacity-50 ${
                  active
                    ? action.active
                    : 'border-black/[0.08] bg-white text-ink hover:border-black/25'
                }`}
              >
                {action.icon}
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto p-6'>
        {actionError && (
          <p
            role='alert'
            className='mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-danger'
          >
            {actionError}
          </p>
        )}

        <NotesEditor
          key={job.id}
          initial={job.notes}
          saving={saving}
          onSave={onNotes}
        />

        <section className='mt-8'>
          <h3 className='mb-3 text-xs font-semibold uppercase tracking-wider text-muted'>
            About this role
          </h3>
          {error && <p className='text-sm text-danger'>{error}</p>}
          {!detail && loading && (
            <div className='space-y-2.5' aria-busy='true'>
              <div className='h-3 w-full animate-pulse rounded bg-black/[0.06]' />
              <div className='h-3 w-11/12 animate-pulse rounded bg-black/[0.06]' />
              <div className='h-3 w-4/6 animate-pulse rounded bg-black/[0.06]' />
            </div>
          )}
          {detail &&
            (detail.descriptionText.trim() ? (
              <DescriptionText text={detail.descriptionText} />
            ) : (
              <p className='text-sm text-muted'>
                This source did not provide a description.
              </p>
            ))}
        </section>

        <a
          href={job.sourceUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='mt-8 inline-flex items-center gap-1.5 text-sm text-muted underline-offset-4 transition hover:text-ink hover:underline'
        >
          View on {SOURCE_LABELS[job.source]}
          <ExternalIcon className='h-3.5 w-3.5' />
        </a>
      </div>
    </article>
  );
}
