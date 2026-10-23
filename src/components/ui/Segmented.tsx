import type { Option } from './Select';

interface Props<T extends string> {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: Props<T>) {
  return (
    <div
      role='radiogroup'
      aria-label={label}
      className='inline-flex rounded-xl bg-black/[0.05] p-1'
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type='button'
            role='radio'
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`rounded-lg px-3 py-1 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ink/40 ${
              active
                ? 'bg-white text-ink shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
