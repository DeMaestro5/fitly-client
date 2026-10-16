import { useEffect, useState } from 'react';
import { fetchTemplates } from '../api/client';

type State = 'checking' | 'up' | 'down';

const dot: Record<State, string> = {
  checking: 'bg-gray-400 animate-pulse',
  up: 'bg-emerald-600',
  down: 'bg-danger',
};

const label: Record<State, string> = {
  checking: 'Checking API',
  up: 'API connected',
  down: 'API offline',
};

/** Pings the API so you can see at a glance that the client reaches the server. */
export function ApiStatus() {
  const [state, setState] = useState<State>('checking');

  useEffect(() => {
    let active = true;
    const check = () =>
      fetchTemplates()
        .then(() => active && setState('up'))
        .catch(() => active && setState('down'));
    check();
    const id = window.setInterval(check, 30000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  return (
    <p
      className='flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-xs font-medium text-muted ring-1 ring-inset ring-black/[0.07]'
      title={state === 'down' ? 'Start fitly-api on port 4000' : undefined}
    >
      <span
        aria-hidden='true'
        className={`size-2 rounded-full ${dot[state]}`}
      />
      <span className='hidden sm:inline'>{label[state]}</span>
    </p>
  );
}
