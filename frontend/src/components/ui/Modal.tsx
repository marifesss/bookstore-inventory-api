import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panel.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || panel.current === null) {
        return;
      }

      // Keep Tab inside the dialog: jump from the last focusable back to the
      // first and the other way around.
      const focusables = panel.current.querySelectorAll<HTMLElement>(
        'button, input, select, textarea, [href]',
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (first === undefined || last === undefined) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-card bg-surface p-6 shadow-modal outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-6 font-display text-[20px] leading-[1.3] font-medium text-ink">
          {title}
        </h2>

        {children}
      </div>
    </div>
  );
}
