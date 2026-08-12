import { useEffect } from 'react';

let lockCount = 0;
let lockedScrollY = 0;
let previousBodyStyles: Partial<CSSStyleDeclaration> | null = null;
let previousHtmlOverflow = '';

/**
 * Prevent the page behind a modal from moving, including on iOS Safari.
 *
 * A counter matters because dialogs can open another dialog. Closing the child
 * must not unlock the page while its parent is still visible.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof document === 'undefined' || typeof window === 'undefined') return;

    if (lockCount === 0) {
      lockedScrollY = window.scrollY;
      previousHtmlOverflow = document.documentElement.style.overflow;
      previousBodyStyles = {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
      };

      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${lockedScrollY}px`;
      document.body.style.width = '100%';
    }
    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount > 0 || !previousBodyStyles) return;

      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyStyles.overflow || '';
      document.body.style.position = previousBodyStyles.position || '';
      document.body.style.top = previousBodyStyles.top || '';
      document.body.style.width = previousBodyStyles.width || '';
      previousBodyStyles = null;
      window.scrollTo(0, lockedScrollY);
    };
  }, [locked]);
}

