import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Measures the active tab so a single indicator can slide between tabs.
 * Every tab needs a data-key attribute; `activeKey` picks the one to follow.
 */
export function useIndicator<T extends HTMLElement>(activeKey: string | null) {
  const ref = useRef<T>(null);
  const [box, setBox] = useState<{ left: number; width: number } | null>(null);
  const [animate, setAnimate] = useState(false);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !activeKey) {
      setBox(null);
      return;
    }
    const update = () => {
      const tab = root.querySelector<HTMLElement>(`[data-key="${activeKey}"]`);
      setBox(tab ? { left: tab.offsetLeft, width: tab.offsetWidth } : null);
    };
    update();
    // The first placement should not slide in from the left edge.
    const frame = requestAnimationFrame(() => setAnimate(true));
    void document.fonts?.ready.then(update);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
    };
  }, [activeKey]);

  return { ref, box, animate };
}
