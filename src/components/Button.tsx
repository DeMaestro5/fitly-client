import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  busy?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-white hover:bg-black disabled:hover:bg-ink',
  secondary: 'bg-white text-ink ring-1 ring-inset ring-line hover:bg-gray-50',
  ghost: 'text-muted hover:bg-black/5 hover:text-ink',
};

export function Button({
  variant = 'primary',
  busy = false,
  className = '',
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || busy}
      className={`inline-flex h-10 items-center justify-center cursor-pointer gap-2 rounded-xl px-4 text-sm font-medium transition duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 ${variants[variant]} ${className}`}
    >
      {busy && (
        <span
          aria-hidden='true'
          className='size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent'
        />
      )}
      {children}
    </button>
  );
}
