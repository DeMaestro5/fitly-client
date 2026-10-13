import type { ReactElement } from 'react';
import type { Template } from '../api/types';

const INK = '#111827';
const LINE = '#c3c9d4';

const lines = (x: number, y: number, widths: number[], gap = 3.2) =>
  widths.map((w, i) => (
    <rect
      key={i}
      x={x}
      y={y + i * gap}
      width={w}
      height={1.6}
      rx={0.8}
      fill={LINE}
    />
  ));

// Tiny schematics so each template is recognisable before you open it.
const THUMBS: Record<string, ReactElement> = {
  classic: (
    <>
      <rect x='4' y='5' width='15' height='2.6' rx='1' fill={INK} />
      <rect x='4' y='10' width='28' height='1' fill={INK} />
      {lines(4, 14, [28, 24, 27])}
      <rect x='4' y='26' width='28' height='1' fill={INK} />
      {lines(4, 30, [26, 28, 20])}
    </>
  ),
  modern: (
    <>
      <rect x='4' y='5' width='16' height='3' rx='1' fill={INK} />
      <rect x='4' y='10' width='28' height='1.6' fill='#1f4e79' />
      <rect x='4' y='15' width='1.4' height='3' fill='#1f4e79' />
      {lines(7.5, 15.5, [14])}
      {lines(4, 21, [28, 24, 27])}
      <rect x='4' y='32' width='1.4' height='3' fill='#1f4e79' />
      {lines(7.5, 32.5, [14])}
      {lines(4, 38, [26, 22])}
    </>
  ),
  elegant: (
    <>
      <rect x='9' y='5' width='18' height='2.4' rx='1' fill={INK} />
      <rect x='12' y='9' width='12' height='1.4' rx='0.7' fill={LINE} />
      <rect x='4' y='15' width='9' height='1' fill={LINE} />
      <rect x='23' y='15' width='9' height='1' fill={LINE} />
      {lines(4, 19, [28, 25, 27])}
      <rect x='4' y='31' width='9' height='1' fill={LINE} />
      <rect x='23' y='31' width='9' height='1' fill={LINE} />
      {lines(4, 35, [26, 28])}
    </>
  ),
  banner: (
    <>
      <rect x='2.5' y='2.5' width='31' height='12' rx='1.5' fill='#12263f' />
      <rect x='5' y='5.5' width='14' height='2.4' rx='1' fill='#fff' />
      <rect x='5' y='10' width='20' height='1.4' rx='0.7' fill='#9fc4e8' />
      <rect x='4' y='19' width='12' height='1.2' fill='#12263f' />
      {lines(4, 23, [28, 24, 27])}
      <rect x='4' y='34' width='12' height='1.2' fill='#12263f' />
      {lines(4, 38, [26, 22])}
    </>
  ),
  timeline: (
    <>
      <rect x='4' y='5' width='16' height='2.6' rx='1' fill={INK} />
      <rect x='4' y='12' width='9' height='1.4' rx='0.7' fill={LINE} />
      {lines(15, 12, [17, 15, 17])}
      <rect x='4' y='25' width='8' height='1.4' rx='0.7' fill={LINE} />
      {lines(15, 25, [17, 14, 16])}
      <rect x='4' y='38' width='8' height='1.4' rx='0.7' fill={LINE} />
      {lines(15, 38, [16])}
    </>
  ),
  compact: (
    <>
      <rect x='4' y='4' width='13' height='2.4' rx='1' fill={INK} />
      {lines(4, 9, [28, 26, 28, 24, 28, 27, 25, 28, 22, 27], 2.9)}
    </>
  ),
};

function Thumb({ id }: { id: string }) {
  return (
    <svg
      viewBox='0 0 36 46'
      aria-hidden='true'
      className='h-[46px] w-9 shrink-0 rounded-[3px] bg-white shadow-[0_0_0_1px_rgba(17,24,39,0.14)]'
    >
      {THUMBS[id] ?? THUMBS.classic}
    </svg>
  );
}

interface Props {
  templates: Template[];
  value: string | null;
  onChange: (id: string) => void;
}

export function TemplatePicker({ templates, value, onChange }: Props) {
  return (
    <section aria-labelledby='template-title'>
      <h2 id='template-title' className='text-sm font-semibold'>
        Template
      </h2>
      <ul className='mt-2 space-y-1.5'>
        {templates.map((template) => {
          const selected = template.id === value;
          return (
            <li key={template.id}>
              <button
                type='button'
                aria-pressed={selected}
                onClick={() => onChange(template.id)}
                className={`group flex w-full items-center gap-3 rounded-md p-2 text-left transition duration-150 ${
                  selected
                    ? 'bg-white hover:cursor-pointer shadow-[0_0_0_2px_#111827]'
                    : 'hover:bg-white/70 hover:cursor-pointer hover:shadow-[0_0_0_1px_rgba(17,24,39,0.15)]'
                }`}
              >
                <span className='transition-transform duration-150 group-hover:-rotate-2 group-active:scale-95'>
                  <Thumb id={template.id} />
                </span>
                <span className='flex-1 text-[15px] font-medium'>
                  {template.name}
                </span>
                {selected && (
                  <svg
                    viewBox='0 0 20 20'
                    className='size-5 animate-pop'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2.2'
                    aria-hidden='true'
                  >
                    <path
                      d='m5 10.5 3.2 3.2L15 6.8'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
