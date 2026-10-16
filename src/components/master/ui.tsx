import {
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

export const inputClass =
  'block h-10 w-full rounded-md bg-white px-3 text-[15px] outline-none ring-1 ring-inset ring-line transition placeholder:text-muted/60 focus:ring-2 focus:ring-focus';

export function Card({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className='animate-paper-in rounded-lg bg-white/60 p-5 shadow-[0_0_0_1px_rgba(17,24,39,0.06)]'>
      <div className='mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1'>
        <h2 className='text-base font-semibold tracking-tight'>{title}</h2>
        {hint && <p className='text-sm text-muted'>{hint}</p>}
        {action}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  className = '',
  ...input
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <span className='mb-1 block text-xs font-medium text-muted'>{label}</span>
      <input {...input} className={inputClass} />
    </label>
  );
}

export function Cross({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 20 20'
      className={className}
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      aria-hidden='true'
    >
      <path d='m5.5 5.5 9 9m0-9-9 9' strokeLinecap='round' />
    </svg>
  );
}

export function IconButton({
  label,
  onClick,
  className = '',
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type='button'
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid size-8 shrink-0 place-items-center rounded-md text-muted transition hover:bg-black/5 hover:text-danger ${className}`}
    >
      <Cross />
    </button>
  );
}

export function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='mt-3 rounded-md px-2 py-1 text-sm font-medium text-muted transition hover:bg-black/5 hover:text-ink'
    >
      + {children}
    </button>
  );
}

/** A list of short strings shown as chips. Enter or comma adds one. */
export function ChipEditor({
  items,
  onChange,
  placeholder = 'Add',
  label,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  label: string;
}) {
  const [value, setValue] = useState('');

  function commit() {
    const next = value.trim();
    if (
      next &&
      !items.some((item) => item.toLowerCase() === next.toLowerCase())
    )
      onChange([...items, next]);
    setValue('');
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commit();
    }
  }

  return (
    <ul className='flex flex-wrap gap-2' aria-label={label}>
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className='inline-flex animate-pop items-center gap-1 rounded-full bg-desk py-1 pl-3 pr-1 text-sm'
        >
          {item}
          <button
            type='button'
            aria-label={`Remove ${item}`}
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            className='grid size-5 place-items-center rounded-full text-muted transition hover:bg-black/10 hover:text-ink'
          >
            <Cross />
          </button>
        </li>
      ))}
      <li>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          placeholder={placeholder}
          aria-label={`${label}: add`}
          className='h-8 w-28 rounded-full bg-white px-3 text-sm outline-none ring-1 ring-inset ring-line transition placeholder:text-muted/60 focus:w-40 focus:ring-2 focus:ring-focus'
        />
      </li>
    </ul>
  );
}
