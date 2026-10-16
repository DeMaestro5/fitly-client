import type { PostingLocation } from '../api/types';
import { Alert } from './Alert';

/**
 * Where the posting says you can work from. It never changes the verdict:
 * whether to apply to a location-limited job is the reader's decision.
 */
export function LocationNote({ location }: { location: PostingLocation }) {
  if (location.scope === 'restricted') {
    return (
      <Alert tone='warning' title='Not open worldwide'>
        <p className='font-medium text-ink'>
          {location.detail ??
            'The posting limits where applicants can work from'}
        </p>
        <p className='mt-1'>
          Your skill match is not affected. Whether to apply anyway is up to you
        </p>
      </Alert>
    );
  }

  const worldwide = location.scope === 'worldwide';
  return (
    <p className='flex items-center gap-2 px-1 text-[13px] text-muted'>
      <span
        aria-hidden='true'
        className={`size-2 rounded-full ${
          worldwide ? 'bg-emerald-600' : 'bg-gray-400'
        }`}
      />
      {worldwide
        ? 'Open to applicants worldwide'
        : 'The posting doesnt say where you can work from'}
    </p>
  );
}
