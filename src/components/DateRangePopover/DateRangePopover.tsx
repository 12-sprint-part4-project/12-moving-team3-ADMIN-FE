'use client';

import { format, isSameDay } from 'date-fns';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button/Button';
import {
  DateRangePicker,
  type DateRange,
} from '@/components/DateRangePicker/DateRangePicker';
import { cn } from '@/lib/utils';

const POPOVER_MOTION_OFFSET_PX = 4;
const POPOVER_MOTION_DURATION_SEC = 0.2;

// DateRangePopover 컴포넌트의 props 타입 정의
export interface DateRangePopoverProps {
  value?: DateRange;
  onConfirm: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

// 날짜 범위를 포맷팅하여 문자열로 반환하는 함수
const formatDateRange = (value?: DateRange) => {
  if (!value) {
    // 값이 없으면 undefined 반환
    return undefined;
  }

  // 시작일 포맷팅
  const from = format(value.from, 'yyyy.MM.dd');

  // 종료일이 없거나 시작일과 종료일이 같으면 시작일만 반환
  if (!value.to || isSameDay(value.from, value.to)) {
    return from;
  }

  // 시작일 ~ 종료일 형태로 반환
  return `${from} ~ ${format(value.to, 'yyyy.MM.dd')}`;
};

// 날짜 범위 선택 팝오버 컴포넌트
export const DateRangePopover = ({
  value,
  onConfirm,
  placeholder,
  className,
  triggerClassName,
}: DateRangePopoverProps) => {
  const { t } = useTranslation();
  // popover를 위한 고유 ID
  const popoverId = useId();
  const shouldReduceMotion = useReducedMotion();
  // 팝오버 열림 상태
  const [isOpen, setIsOpen] = useState(false);
  // 임시 날짜 범위(팝오버 내에서 사용)
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(value);
  // wrapper ref (outside click 감지·Escape 후 트리거 포커스 복귀에 사용)
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);
  // 버튼에 표시될 날짜 문자열
  const dateRangeLabel =
    formatDateRange(value) ?? placeholder ?? t('dateRange.allPeriod');
  const popoverTransition = {
    duration: shouldReduceMotion ? 0 : POPOVER_MOTION_DURATION_SEC,
    ease: 'easeOut',
  } as const;

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // 버튼 클릭시 팝오버 열고 닫기
  const handleTriggerClick = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    // 팝오버 열 때 현재 값을 임시 범위로 설정
    setDraftRange(value);
    setIsOpen(true);
  };

  // 취소 버튼 클릭시 팝오버 닫기
  const handleCancel = () => {
    setIsOpen(false);
  };

  // 종료 애니메이션 중에는 onConfirm이 다시 실행되지 않게 막는다.
  const handleConfirm = () => {
    if (!isOpenRef.current) {
      return;
    }

    onConfirm(draftRange);
    setIsOpen(false);
  };

  const handleSelectAllPeriod = () => {
    if (!isOpenRef.current) {
      return;
    }

    setDraftRange(undefined);
    onConfirm(undefined);
    setIsOpen(false);
  };

  // 바깥 영역 클릭 시 팝오버 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      // 클릭 대상이 wrapper 내부가 아니면 닫기
      if (!wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      setIsOpen(false);
      // Escape로 닫은 뒤 트리거 버튼으로 포커스를 되돌린다.
      // Button이 ref를 받지 않아 wrapper의 직계 트리거 button을 조회한다.
      wrapperRef.current
        ?.querySelector<HTMLButtonElement>(':scope > button')
        ?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    // cleanup에서 이벤트 리스너 제거
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className={cn('relative inline-block', className)}>
      {/* 날짜 범위 표시 및 팝오버 트리거 버튼 */}
      <Button
        variant="secondary"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popoverId : undefined}
        onClick={handleTriggerClick}
        className={cn(
          // SearchInput·FilterSelect와 같은 필터 컨트롤 높이/너비/타이포를 맞춘다.
          'h-9 min-w-40 justify-start gap-2 px-3.5 py-1.5 text-md-medium',
          triggerClassName
        )}
      >
        <Calendar className="size-4 text-gray-400" aria-hidden />
        {dateRangeLabel}
      </Button>

      {/* 팝오버 영역 (isOpen이 true일 때만 표시) */}
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="date-range-popover"
            id={popoverId}
            role="dialog"
            aria-label={t('dateRange.select')}
            initial={{ opacity: 0, y: -POPOVER_MOTION_OFFSET_PX }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: -POPOVER_MOTION_OFFSET_PX,
              pointerEvents: 'none',
            }}
            transition={popoverTransition}
            className="absolute top-full right-0 z-10 mt-2 w-92 overflow-hidden rounded-lg border border-line-200 bg-white"
          >
            {/* 날짜 범위 선택기 */}
            <DateRangePicker
              value={draftRange}
              onChange={setDraftRange}
              className="rounded-none border-0"
            />
            {/* 취소/확인 버튼 영역 */}
            <div className="flex justify-end gap-2 border-t border-line-200 p-4">
              <Button variant="outlined" onClick={handleSelectAllPeriod}>
                {t('dateRange.allPeriod')}
              </Button>
              <Button variant="secondary" onClick={handleCancel}>
                {t('common.cancel')}
              </Button>
              <Button variant="solid" onClick={handleConfirm}>
                {t('common.confirm')}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
