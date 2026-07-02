/**
 * ModalPortal Component
 * Renders overlay content into document.body via a React portal.
 *
 * Why: ancestors with `backdrop-filter`, `filter`, or `transform` (e.g. the
 * page wrapper's `backdrop-blur-sm`) create a CSS containing block, which
 * makes `position: fixed` children anchor to that ancestor instead of the
 * viewport — modals end up centered on the full page height and cut off.
 * Portaling to <body> guarantees viewport-relative positioning.
 */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

// Shared counter so stacked overlays don't unlock scroll while one remains open
let scrollLockCount = 0;

const ModalPortal = ({ children, lockScroll = true }) => {
  useEffect(() => {
    if (!lockScroll) return undefined;
    scrollLockCount += 1;
    document.body.style.overflow = 'hidden';
    return () => {
      scrollLockCount -= 1;
      if (scrollLockCount === 0) {
        document.body.style.overflow = '';
      }
    };
  }, [lockScroll]);

  return createPortal(children, document.body);
};

export default ModalPortal;
