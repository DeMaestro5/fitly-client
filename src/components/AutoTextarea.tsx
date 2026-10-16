import { useLayoutEffect, useRef, type TextareaHTMLAttributes } from 'react';

/** A textarea that grows with its content. */
export function AutoTextarea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [props.value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      {...props}
      className={`block w-full resize-none overflow-hidden rounded-md bg-white px-3 py-2 text-[15px] leading-relaxed outline-none ring-1 ring-inset ring-line transition focus:ring-2 focus:ring-focus ${className}`}
    />
  );
}
