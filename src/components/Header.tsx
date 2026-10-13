import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const { pathname } = useLocation();

  return (
    <header className='mx-auto flex h-[4.5rem] max-w-[90rem] items-center justify-between px-5 sm:px-8'>
      <Link
        to='/'
        className='relative isolate rounded-sm text-xl font-semibold tracking-tight'
      >
        <span
          aria-hidden='true'
          className='absolute -inset-x-1 bottom-[3px] -z-10 h-[0.5em] bg-marker'
        />
        Fitly
      </Link>
      {pathname !== '/' && (
        <Link
          to='/'
          className='rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-black/5 hover:text-ink'
        >
          New job
        </Link>
      )}
    </header>
  );
}
