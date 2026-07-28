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

/**
 * 프로그램적으로 포커스 가능한 요소를 찾기 위한 셀렉터.
 * tabindex="-1"도 포함하며, Tab 순환 순서는 별도로 계산한다.
 */
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]';

/** title이 없을 때 dialog에 붙이는 기본 접근성 이름 */
const DEFAULT_ARIA_LABEL = '상세 정보';
/** Overlay 버튼의 접근성 이름 */
const OVERLAY_ARIA_LABEL = '상세 패널 닫기';

/**
 * Portal은 브라우저 DOM이 준비된 뒤에만 생성할 수 있어 hydration 완료 여부를 확인한다.
 * useSyncExternalStore로 서버(false)와 클라이언트(true) 스냅샷을 나눈다.
 */
const subscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/** 요소의 tabindex 숫자 값을 읽는다. 속성이 없으면 자연 포커스 가능 요소로 0으로 본다. */
const getTabIndex = (element: HTMLElement) => {
  const raw = element.getAttribute('tabindex');
  if (raw == null || raw === '') {
    return 0;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * Drawer 패널 안에서 Tab으로 이동할 요소를 모은다.
 * tabindex="-1"도 수집 대상에 포함하되, 실제 Tab 순환에서는
 * 순차 포커스 대상(tabindex >= 0)만 tabindex·DOM 순서로 정렬한다.
 * 라디오 그룹 전용 Tab 순서 처리는 현재 사용 사례가 없어 포함하지 않는다.
 */
const getFocusableChildren = (panel: HTMLElement) => {
  const candidates = Array.from(
    panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter((element) => element !== panel && element.offsetParent !== null);

  const sequential = candidates
    .map((element, domIndex) => ({
      element,
      tabIndex: getTabIndex(element),
      domIndex,
    }))
    .filter(({ tabIndex }) => tabIndex >= 0);

  sequential.sort((a, b) => {
    const aPositive = a.tabIndex > 0;
    const bPositive = b.tabIndex > 0;

    if (aPositive && bPositive) {
      if (a.tabIndex !== b.tabIndex) {
        return a.tabIndex - b.tabIndex;
      }
      return a.domIndex - b.domIndex;
    }

    if (aPositive) {
      return -1;
    }

    if (bPositive) {
      return 1;
    }

    return a.domIndex - b.domIndex;
  });

  return sequential.map(({ element }) => element);
};

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

/** 관리자 상세 Drawer의 열림 상태, 본문, 하단 액션, 닫기 콜백을 정의한다. */
export interface DetailDrawerProps extends VariantProps<
  typeof detailDrawerPanelVariants
> {
  open: boolean;
  title?: string;
  children: ReactNode;
  /** 하단 고정 액션 슬롯. null/undefined일 때만 Footer를 생략한다. */
  footer?: ReactNode;
  onClose: () => void;
  className?: string;
}

/**
 * 관리자 상세 정보를 화면 오른쪽에 표시하는 공통 Drawer다.
 * document.body Portal, Overlay 닫기, ESC/포커스 트랩, body 스크롤 잠금을 담당한다.
 *
 * 지원 범위: 한 번에 하나의 DetailDrawer만 연다. 중첩·다중 Drawer 스택은 지원하지 않는다.
 * 단일 Drawer 기준으로 ESC 닫기, 포커스 트랩, 포커스 복원, body scroll lock만 보장한다.
 */
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
  /** Drawer가 열리기 전 포커스 요소. 닫힐 때 복원에 사용한다. */
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  /** ESC 핸들러가 항상 최신 onClose를 쓰도록 보관한다. */
  const onCloseRef = useRef(onClose);
  // Portal은 클라이언트 마운트 이후에만 그린다. (hydration 불일치 방지)
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  // onClose 참조가 바뀌어도 포커스 effect를 다시 돌리지 않도록 ref만 갱신한다.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  /**
   * open과 hydration(mounted)이 모두 true일 때 실행한다.
   * body 스크롤 잠금, 초기 포커스, ESC/Tab 포커스 트랩을 설정하고
   * cleanup에서 스크롤·이전 포커스를 복원한다.
   */
  useEffect(() => {
    if (!mounted || !open) {
      return;
    }

    // Drawer가 열리기 전에 선택되어 있던 요소를 저장하고,
    // 닫힐 때 해당 요소로 포커스를 돌려 사용 흐름을 유지한다.
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    // Drawer가 열린 동안 배경 페이지가 함께 스크롤되지 않도록 body 스크롤을 잠근다.
    // cleanup에서는 Drawer가 열리기 전의 overflow 값을 복원한다. (단일 Drawer 기준)
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 열릴 때 첫 포커스 가능 요소로 이동하고, 없으면 패널 자체에 포커스한다.
    const focusable = getFocusableChildren(panel);
    const firstFocusable = focusable[0];
    (firstFocusable ?? panel).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC로 Drawer를 닫는다. onCloseRef로 최신 콜백을 호출한다.
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const currentFocusable = getFocusableChildren(panel);

      // 포커스 가능한 자식이 없으면 Tab이 밖으로 나가지 않도록 패널에 유지한다.
      if (currentFocusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = currentFocusable[0];
      const last = currentFocusable[currentFocusable.length - 1];
      const active = document.activeElement;
      const isOnPanel = active === panel;
      const isOutside = !(active instanceof Node) || !panel.contains(active);

      // Tab과 Shift+Tab이 Drawer 밖으로 빠져나가지 않도록
      // 첫 요소와 마지막 요소 사이에서 포커스를 순환시킨다.
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
  }, [open, mounted]);

  // 서버 렌더이거나 닫힌 상태면 Portal을 만들지 않는다.
  if (!mounted || !open) {
    return null;
  }

  // Overlay 클릭 시 Drawer를 닫는다.
  const handleOverlayClick = () => {
    onClose();
  };

  // 레이아웃 overflow와 무관하게 최상단에 보이도록 document.body에 Portal로 붙인다.
  return createPortal(
    <div className={cn(detailDrawerRootVariants())}>
      {/* Overlay: 배경 dim + 클릭 시 닫기. Tab 순서에는 넣지 않는다. */}
      <button
        type="button"
        tabIndex={-1}
        className={cn(detailDrawerOverlayVariants())}
        onClick={handleOverlayClick}
        aria-label={OVERLAY_ARIA_LABEL}
      />

      {/* Panel: 우측에서 슬라이드되는 상세 영역 */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : DEFAULT_ARIA_LABEL}
        tabIndex={-1}
        className={cn(detailDrawerPanelVariants({ size }), className)}
      >
        {/* Header: 제목 + 닫기 버튼 */}
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

        {/* Body: 스크롤 가능한 상세 콘텐츠 */}
        <div className={cn(detailDrawerBodyVariants())}>{children}</div>

        {/* Footer: null/undefined가 아니면 0·빈 문자열 등도 유효한 ReactNode로 렌더한다. */}
        {footer != null ? (
          <footer className={cn(detailDrawerFooterVariants())}>{footer}</footer>
        ) : null}
      </div>
    </div>,
    document.body
  );
};
