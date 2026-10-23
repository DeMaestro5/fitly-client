interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Switch({ checked, onChange, label }: Props) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className='inline-flex items-center gap-2.5 rounded-lg text-sm font-medium text-ink outline-none focus-visible:ring-4 focus-visible:ring-black/[0.06]'
    >
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? 'bg-ink' : 'bg-black/20'}`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </span>
      {label}
    </button>
  );
}
