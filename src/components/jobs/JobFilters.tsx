import { ACTIVE_SOURCES, SOURCE_LABELS } from '../../lib/format';
import { DEFAULT_FILTERS, type UiFilters } from '../../lib/job-filters';
import { SearchField } from '../ui/SearchField';
import { Segmented } from '../ui/Segmented';
import { Select, type Option } from '../ui/Select';
import { Switch } from '../ui/Switch';

interface Props {
  value: UiFilters;
  onChange: (patch: Partial<UiFilters>) => void;
}

const STATUS: Option<UiFilters['status']>[] = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'skipped', label: 'Skipped' },
];

const SOURCES: Option<UiFilters['source']>[] = [
  { value: '', label: 'All sources' },
  ...ACTIVE_SOURCES.map((id) => ({ value: id, label: SOURCE_LABELS[id] })),
];

const SINCE: Option<UiFilters['sinceDays']>[] = [
  { value: '', label: 'Any time' },
  { value: '1', label: 'Last 24 hours' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
];

const SCOPE: Option<UiFilters['scope']>[] = [
  { value: '', label: 'Any region' },
  { value: 'worldwide', label: 'Worldwide' },
  { value: 'limited', label: 'Region-limited' },
  { value: 'unknown', label: 'Not stated' },
];

const SORT: Option<UiFilters['sort']>[] = [
  { value: 'score', label: 'Best match first' },
  { value: 'posted', label: 'Newest first' },
];

export function JobFilters({ value, onChange }: Props) {
  const dirty = (Object.keys(DEFAULT_FILTERS) as (keyof UiFilters)[]).some(
    (key) => key !== 'page' && value[key] !== DEFAULT_FILTERS[key],
  );

  return (
    <div className='relative z-20 rounded-2xl border border-black/[0.07] bg-white/70 p-3 shadow-sm backdrop-blur'>
      <SearchField
        value={value.q}
        onChange={(q) => onChange({ q })}
        placeholder='Search title, company or description'
      />
      <div className='mt-3 flex flex-wrap items-center justify-between gap-3'>
        <Segmented
          label='Status'
          value={value.status}
          options={STATUS}
          onChange={(status) => onChange({ status })}
        />
        <div className='flex flex-wrap items-center gap-2'>
          <Select
            label='Source'
            value={value.source}
            options={SOURCES}
            onChange={(source) => onChange({ source })}
          />
          <Select
            label='Posted'
            value={value.sinceDays}
            options={SINCE}
            onChange={(sinceDays) => onChange({ sinceDays })}
          />
          <Select
            label='Region'
            value={value.scope}
            options={SCOPE}
            onChange={(scope) => onChange({ scope })}
            align='right'
          />
          <Select
            label='Sort'
            value={value.sort}
            options={SORT}
            onChange={(sort) => onChange({ sort })}
            align='right'
          />
          <span className='mx-1 hidden h-6 w-px bg-black/10 sm:block' />
          <Switch
            label='Best matches'
            checked={value.bestOnly}
            onChange={(bestOnly) => onChange({ bestOnly })}
          />
          {dirty && (
            <button
              type='button'
              onClick={() => onChange({ ...DEFAULT_FILTERS })}
              className='rounded-lg px-2 py-1 text-sm text-muted underline-offset-4 hover:text-ink hover:underline'
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
