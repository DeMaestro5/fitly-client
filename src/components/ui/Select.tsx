import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { CheckIcon, ChevronIcon } from './icons';

export interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  align?: 'left' | 'right';
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  align = 'left',
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const selected = options[selectedIndex];
  const isDefault = selectedIndex === 0; // the first option means "no filter"

  // Close when the user clicks anywhere outside.
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  function openMenu() {
    setActive(selectedIndex);
    setOpen(true);
  }

  function choose(next: T) {
    onChange(next);
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(options[active].value);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className='relative'>
      <button
        type='button'
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-controls={`${baseId}-list`}
        aria-activedescendant={open ? `${baseId}-${active}` : undefined}
        aria-label={`${label}: ${selected.label}`}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium outline-none transition ${
          isDefault
            ? 'border-black/[0.08] bg-white/80 text-muted hover:text-ink'
            : 'border-ink bg-white text-ink'
        } ${open ? 'ring-4 ring-black/[0.06]' : 'focus-visible:ring-4 focus-visible:ring-black/[0.06]'}`}
      >
        {selected.label}
        <ChevronIcon
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          id={`${baseId}-list`}
          role='listbox'
          aria-label={label}
          className={`menu-in absolute z-30 mt-2 w-max min-w-full max-w-[16rem] rounded-xl border border-black/[0.08] bg-white p-1 shadow-[0_12px_40px_rgba(0,0,0,0.12)] ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {options.map((option, i) => (
            <li
              key={option.value}
              id={`${baseId}-${i}`}
              role='option'
              aria-selected={option.value === value}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(option.value)}
              className={`flex cursor-pointer items-center justify-between gap-6 rounded-lg px-3 py-2 text-sm text-ink ${
                i === active ? 'bg-black/[0.05]' : ''
              } ${option.value === value ? 'font-medium' : ''}`}
            >
              {option.label}
              {option.value === value && <CheckIcon className='h-4 w-4' />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
