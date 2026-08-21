'use client';

import { cva } from 'class-variance-authority';
import {
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/Button/Button';
import { cn } from '@/lib/utils';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const subscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export const confirmModalOverlayVariants = cva(
  'fixed inset-0 z-50 flex items-center justify-center bg-black-500/50 p-4'
);

export const confirmModalPanelVariants = cva(
  'flex w-full max-w-md flex-col gap-4 rounded-lg border border-line-200 bg-white p-6 outline-none'
);

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  /** 문자열 또는 조치 목록 등 블록 콘텐츠. */
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
  /** true면 확인 버튼 loading + 취소 비활성화로 중복 요청을 막는다. */
  confirmLoading?: boolean;
  /** Action 미선택 등 확인 불가 조건. loading과 별도로 확인 버튼만 비활성화한다. */
  confirmDisabled?: boolean;
  /** description 아래에 표시하는 실패 안내. 없으면 숨긴다. */
  errorMessage?: string;
}

export const ConfirmModal = ({
  open,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  className,
  confirmLoading = false,
  confirmDisabled = false,
  errorMessage,
}: ConfirmModalProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        // 요청 중에는 ESC로 닫지 않아 중복 조작·요청 취소를 막는다.
        if (!confirmLoading) {
          onCancel();
        }
        return;
      }

      if (event.key !== 'Tab' || !panel) {
        return;
      }

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last?.focus();
        return;
      }

      if (!event.shiftKey && active === last) {
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
  }, [open, onCancel, confirmLoading]);

  if (!mounted || !open) {
    return null;
  }

  const describedBy = [
    description ? descriptionId : null,
    errorMessage ? errorId : null,
  ]
    .filter(Boolean)
    .join(' ');

  const handleOverlayClick = () => {
    // 요청 중에는 오버레이 클릭으로 닫지 않는다.
    if (confirmLoading) {
      return;
    }

    onCancel();
  };

  const handlePanelClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return createPortal(
    <div
      className={cn(
        confirmModalOverlayVariants(),
        confirmLoading ? 'cursor-not-allowed' : 'cursor-pointer'
      )}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedBy || undefined}
        tabIndex={-1}
        className={cn(confirmModalPanelVariants(), 'cursor-default', className)}
        onClick={handlePanelClick}
      >
        <h2 id={titleId} className="text-xl-bold text-black-400">
          {title}
        </h2>

        {description ? (
          <div id={descriptionId} className="text-md-medium text-gray-500">
            {description}
          </div>
        ) : null}

        {errorMessage ? (
          <p id={errorId} role="alert" className="text-md-medium text-red-200">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={confirmLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant="solid"
            onClick={onConfirm}
            loading={confirmLoading}
            disabled={confirmDisabled || confirmLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
