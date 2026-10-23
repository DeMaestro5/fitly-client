import { SearchIcon, XIcon } from './icons';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchField({ value, onChange, placeholder }: Props) {
  return (
    <div className='relative'>
      <SearchIcon className='pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
      <input
        type='text'
        inputMode='search'
        aria-label='Search jobs'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className='h-10 w-full rounded-xl border border-black/[0.08] bg-white/80 pl-10 pr-10 text-sm text-ink outline-none transition placeholder:text-muted focus:border-ink focus:bg-white focus:ring-4 focus:ring-black/[0.06]'
      />
      {value && (
        <button
          type='button'
          aria-label='Clear search'
          onClick={() => onChange('')}
          className='absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition hover:text-ink'
        >
          <XIcon className='h-4 w-4' />
        </button>
      )}
    </div>
  );
}
