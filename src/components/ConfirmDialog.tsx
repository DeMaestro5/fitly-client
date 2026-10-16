import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { Button } from './Button';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

const CLOSE_MS = 200;

interface DialogProps extends ConfirmOptions {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Called once the closing animation has finished. */
  onClosed: () => void;
}

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  onClosed,
}: DialogProps) {
  const [visible, setVisible] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const closed = useRef(onClosed);
  closed.current = onClosed;

  // Fade in on the next frame; fade out, then tell the parent to unmount.
  useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
    const timer = window.setTimeout(() => closed.current(), CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  // Focus goes in on open and back to where it was on close.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    cancelButton.current?.focus();
    return () => previous?.focus();
  }, [open]);

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onCancel();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = panel.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled])'
    );
    if (!items?.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      onKeyDown={onKeyDown}
      onMouseDown={(event) =>
        event.target === event.currentTarget && onCancel()
      }
      className={`fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 transition-opacity duration-200 motion-reduce:transition-none ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        ref={panel}
        role='alertdialog'
        aria-modal='true'
        aria-labelledby='confirm-title'
        aria-describedby='confirm-message'
        className={`w-full max-w-sm rounded-lg bg-white p-6 shadow-[0_24px_60px_-20px_rgba(17,24,39,0.55)] transition duration-200 ease-out motion-reduce:transition-none ${
          visible
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-2 scale-95 opacity-0'
        }`}
      >
        <h2 id='confirm-title' className='text-lg font-semibold tracking-tight'>
          {title}
        </h2>
        <p id='confirm-message' className='mt-2 text-sm text-muted'>
          {message}
        </p>
        <div className='mt-6 flex justify-end gap-2'>
          <button
            ref={cancelButton}
            type='button'
            onClick={onCancel}
            className='inline-flex h-10 items-center rounded-md px-4 text-sm font-medium text-muted outline-none transition hover:bg-black/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-focus'
          >
            {cancelLabel}
          </button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

/** `const { confirm, dialog } = useConfirm()`; render `{dialog}`, then `await confirm({...})`. */
export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);
  const resolver = useRef<((answer: boolean) => void) | null>(null);

  const confirm = useCallback(
    (next: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolver.current?.(false);
        resolver.current = resolve;
        setOptions(next);
        setOpen(true);
      }),
    []
  );

  const settle = useCallback((answer: boolean) => {
    resolver.current?.(answer);
    resolver.current = null;
    setOpen(false);
  }, []);

  const dialog = options ? (
    <ConfirmDialog
      {...options}
      open={open}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
      onClosed={() => setOptions(null)}
    />
  ) : null;

  return { confirm, dialog };
}
