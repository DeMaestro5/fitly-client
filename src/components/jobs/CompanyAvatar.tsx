const PALETTE = [
  'bg-amber-100 text-amber-800',
  'bg-sky-100 text-sky-800',
  'bg-emerald-100 text-emerald-800',
  'bg-rose-100 text-rose-800',
  'bg-violet-100 text-violet-800',
  'bg-orange-100 text-orange-800',
  'bg-teal-100 text-teal-800',
  'bg-indigo-100 text-indigo-800',
];

// Same company name, same colour, every time.
function hash(text: string): number {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function CompanyAvatar({
  name,
  size = 'md',
}: {
  name: string;
  size?: 'md' | 'lg';
}) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || '?';
  const dimensions =
    size === 'lg'
      ? 'h-14 w-14 rounded-2xl text-lg'
      : 'h-10 w-10 rounded-xl text-sm';
  return (
    <div
      aria-hidden='true'
      className={`grid shrink-0 place-items-center font-semibold ${dimensions} ${PALETTE[hash(name) % PALETTE.length]}`}
    >
      {initials}
    </div>
  );
}
