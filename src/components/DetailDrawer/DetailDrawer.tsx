'use client';

import {
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';

import CloseIcon from '@/assets/icons/close.svg';
import { cn } from '@/lib/utils';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const DEFAULT_ARIA_LABEL = '상세 정보';
const OVERLAY_ARIA_LABEL = '상세 패널 닫기';

const subscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export const detailDrawerRootVariants = cva('fixed inset-0 z-50');

export const detailDrawerOverlayVariants = cva(
  'absolute inset-0 cursor-pointer border-0 bg-black-500/50 p-0'
);

export const detailDrawerPanelVariants = cva(
  'absolute inset-y-0 right-0 flex h-full w-full flex-col border-l border-line-200 bg-white outline-none animate-drawer-in motion-reduce:animate-none',
  {
    variants: {
      size: {
        md: 'max-w-md',
        lg: 'max-w-lg',
      },
    },
    defaultVariants: {
      size: 'lg',
    },
  }
);

export const detailDrawerHeaderVariants = cva(
  'flex shrink-0 items-start justify-between gap-3 border-b border-line-200 px-6 py-4'
);

export const detailDrawerBodyVariants = cva(
  'flex-1 overflow-y-auto bg-background-200 px-6 py-4'
);

export const detailDrawerFooterVariants = cva(
  'flex shrink-0 flex-col gap-2 border-t border-line-200 bg-white px-6 py-4'
);

export interface DetailDrawerProps extends VariantProps<
  typeof detailDrawerPanelVariants
> {
  open: boolean;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  className?: string;
}

export const DetailDrawer = ({
  open,
  title,
  children,
  footer,
  onClose,
  size,
  className,
}: DetailDrawerProps) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    panel?.focus();

    const getFocusableChildren = () => {
      if (!panel) {
        return [];
      }

      return Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => element !== panel && element.offsetParent !== null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !panel) {
        return;
      }

      const focusable = getFocusableChildren();

      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const isOnPanel = active === panel;
      const isOutside = !(active instanceof Node) || !panel.contains(active);

      if (event.shiftKey) {
        if (active === first || isOnPanel || isOutside) {
          event.preventDefault();
          last?.focus();
        }
        return;
      }

      if (active === last || isOnPanel || isOutside) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [open]);

  if (!mounted || !open) {
    return null;
  }

  const handleOverlayClick = () => {
    onClose();
  };

  return createPortal(
    <div className={cn(detailDrawerRootVariants())}>
      <button
        type="button"
        tabIndex={-1}
        className={cn(detailDrawerOverlayVariants())}
        onClick={handleOverlayClick}
        aria-label={OVERLAY_ARIA_LABEL}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : DEFAULT_ARIA_LABEL}
        tabIndex={-1}
        className={cn(detailDrawerPanelVariants({ size }), className)}
      >
        <header className={cn(detailDrawerHeaderVariants())}>
          {title ? (
            <h2 id={titleId} className="text-xl-bold text-black-400">
              {title}
            </h2>
          ) : (
            <span className="sr-only">{DEFAULT_ARIA_LABEL}</span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-lg text-black-100 hover:bg-background-200"
            aria-label="닫기"
          >
            <CloseIcon className="size-5" aria-hidden />
          </button>
        </header>

        <div className={cn(detailDrawerBodyVariants())}>{children}</div>

        {footer ? (
          <footer className={cn(detailDrawerFooterVariants())}>{footer}</footer>
        ) : null}
      </div>
    </div>,
    document.body
  );
};
