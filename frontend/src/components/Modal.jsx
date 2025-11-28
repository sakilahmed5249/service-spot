import React, { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

/*
  Accessible Modal (portal)
  - Focus trap (Tab / Shift+Tab)
  - Close on Escape (configurable)
  - Close on overlay click (configurable)
  - Returns focus to trigger element
  - role="dialog", aria-modal, labelledby/desc
  - header/footer slots
*/

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex^="-"])',
].join(',');

function findFocusable(root) {
  if (!root) return [];
  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTORS)).filter((el) => el.offsetParent !== null);
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showClose = true,
  labelledById = null,
  describedById = null,
  footer = null,
  className = '',
}) {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  // Map size to Tailwind classes
  const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };
  const maxWidthClass = sizeMap[size] || sizeMap.md;

  useEffect(() => {
    if (!isOpen) return;

    // Save previous focus and disable background scroll
    previouslyFocused.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus first focusable element inside modal after paint
    const timer = setTimeout(() => {
      const focusables = findFocusable(dialogRef.current);
      if (focusables.length) focusables[0].focus();
      else dialogRef.current?.focus();
    }, 0);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = prevOverflow || '';
      // restore focus
      try {
        previouslyFocused.current?.focus?.();
      } catch (e) {
        // ignore
      }
    };
  }, [isOpen]);

  // Key handler: Esc + Tab trap
  const onKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape' && closeOnEsc) {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = findFocusable(dialogRef.current);
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    },
    [isOpen, closeOnEsc, onClose]
  );

  // Attach keydown listener to document when open
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onKeyDown]);

  if (!isOpen) return null;

  // portal root is body
  return ReactDOM.createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-hidden={false}
      onMouseDown={(e) => {
        // click on overlay -> close (if enabled)
        if (!closeOnOverlayClick) return;
        if (e.target === overlayRef.current) onClose?.();
      }}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById || undefined}
        aria-describedby={describedById || undefined}
        ref={dialogRef}
        tabIndex={-1}
        className={`relative z-10 w-full ${maxWidthClass} max-h-[90vh] overflow-auto ${className}`}
        onMouseDown={(e) => e.stopPropagation()} // stop overlay close when interacting with dialog
      >
        {/* container (glass card) */}
        <div className="card-glass rounded-2xl shadow-2xl overflow-hidden animate-slide-in-up">
          <header className="sticky top-0 z-20 bg-white/6 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between gap-4">
            <div>
              {title ? (
                <h2 id={labelledById || undefined} className="text-lg font-display font-semibold text-white">
                  {title}
                </h2>
              ) : (
                <div id={labelledById || undefined} className="sr-only">Dialog</div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {showClose && (
                <button
                  type="button"
                  onClick={() => onClose?.()}
                  aria-label="Close dialog"
                  className="p-2 rounded-md text-white hover:bg-white/6 focus-visible:ring-4 focus-visible:ring-primary/20 transition"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </header>

          <div className="p-6">
            {children}
          </div>

          {footer && (
            <footer className="border-t border-white/5 p-4 bg-white/3 flex items-center justify-end gap-3">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  closeOnOverlayClick: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
  showClose: PropTypes.bool,
  labelledById: PropTypes.string,
  describedById: PropTypes.string,
  footer: PropTypes.node,
  className: PropTypes.string,
};

Modal.defaultProps = {
  title: '',
  children: null,
  size: 'md',
  closeOnOverlayClick: true,
  closeOnEsc: true,
  showClose: true,
  labelledById: null,
  describedById: null,
  footer: null,
  className: '',
};