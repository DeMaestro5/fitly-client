import { Link, NavLink, useLocation } from 'react-router-dom';
import { useIndicator } from '../hooks/useIndicator';
import { ApiStatus } from './ApiStatus';

const tabs = [
  { key: 'tailor', to: '/', label: 'Tailor' },
  { key: 'master', to: '/master', label: 'Master resume' },
  { key: 'jobs', to: '/jobs', label: 'Jobs' },
];

export function Header() {
  const { pathname } = useLocation();
  const active =
    pathname === '/' || pathname === '/result'
      ? 'tailor'
      : pathname === '/master'
        ? 'master'
        : pathname === '/jobs'
          ? 'jobs'
          : null;
  const { ref, box, animate } = useIndicator<HTMLElement>(active);

  return (
    <header className='sticky top-0 z-20 border-b border-black/[0.07] bg-desk/85 backdrop-blur'>
      <div className='mx-auto flex h-[4.5rem] max-w-[90rem] items-stretch justify-between gap-4 px-5 sm:px-8'>
        <div className='flex items-stretch gap-8'>
          <Link
            to='/'
            className='relative isolate flex items-center rounded-sm text-xl font-semibold tracking-tight'
          >
            <span className='relative'>
              <span
                aria-hidden='true'
                className='absolute -inset-x-1 bottom-[3px] -z-10 h-[0.5em] bg-marker'
              />
              Fitly
            </span>
          </Link>

          <nav
            ref={ref}
            aria-label='Main'
            className='relative flex items-stretch'
          >
            {tabs.map((tab) => (
              <NavLink
                key={tab.key}
                to={tab.to}
                data-key={tab.key}
                className={`relative flex items-center px-4 text-sm font-medium transition-colors duration-150 after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent after:transition-colors hover:text-ink hover:after:bg-black/15 ${
                  active === tab.key ? 'text-ink' : 'text-muted'
                }`}
              >
                {tab.label}
              </NavLink>
            ))}
            {box && (
              <span
                aria-hidden='true'
                className={`pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-ink ${
                  animate
                    ? 'transition-[left,width] duration-300 ease-[cubic-bezier(0.3,0.9,0.3,1)]'
                    : ''
                }`}
                style={{
                  left: box.left + 16,
                  width: Math.max(box.width - 32, 0),
                }}
              />
            )}
          </nav>
        </div>

        <div className='flex items-center'>
          <ApiStatus />
        </div>
      </div>
    </header>
  );
}
