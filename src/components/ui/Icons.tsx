import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const icon = (paths: ReactNode) => (props: IconProps) => (
  <svg {...base} {...props}>
    {paths}
  </svg>
);

export const SearchIcon = icon(
  <>
    <circle cx='11' cy='11' r='7' />
    <path d='m20 20-3.5-3.5' />
  </>,
);
export const ChevronIcon = icon(<path d='m6 9 6 6 6-6' />);
export const CheckIcon = icon(<path d='m5 12 5 5L20 7' />);
export const XIcon = icon(<path d='M6 6l12 12M18 6 6 18' />);
export const ExternalIcon = icon(
  <>
    <path d='M14 4h6v6' />
    <path d='M20 4 10 14' />
    <path d='M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5' />
  </>,
);
export const RefreshIcon = icon(
  <>
    <path d='M20 11a8 8 0 0 0-14.9-3M4 5v4h4' />
    <path d='M4 13a8 8 0 0 0 14.9 3M20 19v-4h-4' />
  </>,
);
export const BookmarkIcon = icon(<path d='M6 4h12v17l-6-4-6 4z' />);
export const CheckCircleIcon = icon(
  <>
    <circle cx='12' cy='12' r='9' />
    <path d='m8 12 3 3 5-6' />
  </>,
);
export const BanIcon = icon(
  <>
    <circle cx='12' cy='12' r='9' />
    <path d='m5.6 5.6 12.8 12.8' />
  </>,
);
export const PinIcon = icon(
  <>
    <path d='M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z' />
    <circle cx='12' cy='10' r='2.5' />
  </>,
);
export const ClockIcon = icon(
  <>
    <circle cx='12' cy='12' r='9' />
    <path d='M12 7v5l3 2' />
  </>,
);
export const BriefcaseIcon = icon(
  <>
    <rect x='3' y='7' width='18' height='13' rx='2' />
    <path d='M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2' />
  </>,
);
export const CoinIcon = icon(
  <>
    <circle cx='12' cy='12' r='9' />
    <path d='M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6.5V8m0 8v1.5' />
  </>,
);
