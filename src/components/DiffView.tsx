import { useState } from 'react';
import type { DiffPart } from '../lib/diff';
import type {
  ResumeChanges,
  Section,
  SkillChange,
  Status,
  TextChange,
} from '../lib/resume-diff';

export function DiffView({ changes }: { changes: ResumeChanges }) {
  const [showSame, setShowSame] = useState(false);

  const changed = changes.sections.filter((s) => s.changes > 0);
  const unchanged = changes.sections.filter((s) => s.changes === 0);
  const visible = showSame ? changes.sections : changed;

  return (
    <div className='space-y-5 pb-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='text-sm text-muted'>
          {changes.total === 0 ? (
            'No differences from your master resume.'
          ) : (
            <>
              <span className='font-medium text-ink'>
                {changes.total} change{changes.total === 1 ? '' : 's'}
              </span>{' '}
              across {changed.length} section{changed.length === 1 ? '' : 's'},
              compared with your master resume
            </>
          )}
        </p>
        <label className='flex cursor-pointer select-none items-center gap-2 text-sm text-muted'>
          <input
            type='checkbox'
            checked={showSame}
            onChange={(e) => setShowSame(e.target.checked)}
            className='peer sr-only'
          />
          <span
            aria-hidden='true'
            className='relative h-5 w-9 rounded-full bg-line transition-colors peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-4'
          />
          Show unchanged
        </label>
      </div>

      <ul className='space-y-4'>
        {visible.map((section, i) => (
          <li
            key={section.id}
            className='animate-paper-in rounded-lg bg-white p-5 shadow-[0_0_0_1px_rgba(17,24,39,0.06)]'
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
          >
            <SectionBlock section={section} showSame={showSame} />
          </li>
        ))}
      </ul>

      {!showSame && unchanged.length > 0 && changed.length > 0 && (
        <p className='text-sm text-muted'>
          Unchanged: {unchanged.map(label).join(', ')}.
        </p>
      )}
    </div>
  );
}

const label = (section: Section) =>
  section.id.startsWith('role-') && section.meta
    ? `${section.title} (${section.meta})`
    : section.title;

function SectionBlock({
  section,
  showSame,
}: {
  section: Section;
  showSame: boolean;
}) {
  const texts = showSame
    ? section.texts
    : section.texts.filter((t) => t.status !== 'same');
  const skills = showSame
    ? section.skills
    : section.skills.filter((s) => s.status !== 'same');

  return (
    <section aria-label={section.title}>
      <div className='mb-3 flex flex-wrap items-baseline justify-between gap-x-3'>
        <h3 className='font-semibold'>
          {section.title}
          {section.id.startsWith('role-') && section.meta && (
            <span className='font-normal text-muted'> · {section.meta}</span>
          )}
        </h3>
        <p className='text-sm text-muted'>
          {section.changes === 0
            ? 'Unchanged'
            : `${section.changes} change${section.changes === 1 ? '' : 's'}`}
          {section.id === 'skills' && section.meta ? ` · ${section.meta}` : ''}
          {section.reordered ? ' · Bullets reordered' : ''}
        </p>
      </div>

      {texts.length > 0 && (
        <ul className='space-y-3'>
          {texts.map((text, i) => (
            <li key={i} className='flex items-start gap-3'>
              <StatusTag status={text.status} />
              <Parts change={text} />
            </li>
          ))}
        </ul>
      )}

      {skills.length > 0 && (
        <ul className='space-y-3'>
          {skills.map((skill) => (
            <SkillRow key={skill.group} skill={skill} />
          ))}
        </ul>
      )}
    </section>
  );
}

const tagStyle: Record<Status, string> = {
  same: 'bg-desk text-muted',
  changed: 'bg-amber-100 text-amber-900',
  added: 'bg-emerald-100 text-emerald-900',
  removed: 'bg-red-100 text-red-900',
};

const tagLabel: Record<Status, string> = {
  same: 'Same',
  changed: 'Changed',
  added: 'New',
  removed: 'Dropped',
};

function StatusTag({ status }: { status: Status }) {
  return (
    <span
      className={`mt-0.5 inline-flex w-[4.5rem] shrink-0 justify-center rounded-full px-2 py-0.5 text-xs font-medium ${tagStyle[status]}`}
    >
      {tagLabel[status]}
    </span>
  );
}

function Parts({ change }: { change: TextChange }) {
  return (
    <p className='min-w-0 flex-1 text-[15px] leading-relaxed'>
      {change.parts.map((part, i) => (
        <Part key={i} part={part} />
      ))}
    </p>
  );
}

function Part({ part }: { part: DiffPart }) {
  if (part.kind === 'add') {
    return (
      <ins className='rounded-sm bg-emerald-100 text-emerald-950 no-underline'>
        {part.text}
      </ins>
    );
  }
  if (part.kind === 'del') {
    return (
      <del className='rounded-sm bg-red-100 text-red-950 decoration-red-700/60'>
        {part.text}
      </del>
    );
  }
  return <span>{part.text}</span>;
}

function SkillRow({ skill }: { skill: SkillChange }) {
  const note =
    skill.status === 'added'
      ? 'New group'
      : skill.status === 'removed'
      ? 'Group dropped'
      : skill.reordered
      ? 'Reordered'
      : null;

  return (
    <li className='flex items-start gap-3'>
      <StatusTag status={skill.status} />
      <div className='min-w-0 flex-1 text-[15px] leading-relaxed'>
        <p className='font-medium'>
          {skill.group}
          {note && (
            <span className='ml-2 text-sm font-normal text-muted'>{note}</span>
          )}
        </p>
        <p className='mt-0.5'>
          {skill.kept.map((item, i) => (
            <span key={`k${i}`}>
              {i > 0 && ', '}
              {item}
            </span>
          ))}
          {skill.added.map((item, i) => (
            <span key={`a${i}`}>
              {skill.kept.length > 0 || i > 0 ? ', ' : ''}
              <ins className='rounded-sm bg-emerald-100 text-emerald-950 no-underline'>
                {item}
              </ins>
            </span>
          ))}
          {skill.removed.map((item, i) => (
            <span key={`r${i}`}>
              {skill.kept.length + skill.added.length > 0 || i > 0 ? ', ' : ''}
              <del className='rounded-sm bg-red-100 text-red-950 decoration-red-700/60'>
                {item}
              </del>
            </span>
          ))}
        </p>
      </div>
    </li>
  );
}
