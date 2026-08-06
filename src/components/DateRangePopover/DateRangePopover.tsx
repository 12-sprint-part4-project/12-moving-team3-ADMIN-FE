'use client';

import { format, isSameDay } from 'date-fns';
import { useId, useState, useRef, useEffect } from 'react';

import { Button } from '@/components/Button/Button';
import { Calendar } from 'lucide-react';
import {
  DateRangePicker,
  type DateRange,
} from '@/components/DateRangePicker/DateRangePicker';
import { cn } from '@/lib/utils';

// DateRangePopover 컴포넌트의 props 타입 정의
export interface DateRangePopoverProps {
  value?: DateRange;
  onConfirm: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
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
  placeholder = '전체 기간',
  className,
}: DateRangePopoverProps) => {
  // popover를 위한 고유 ID
  const popoverId = useId();
  // 팝오버 열림 상태
  const [isOpen, setIsOpen] = useState(false);
  // 임시 날짜 범위(팝오버 내에서 사용)
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(value);
  // wrapper ref (outside click 감지에 사용)
  const wrapperRef = useRef<HTMLDivElement>(null);
  // 버튼에 표시될 날짜 문자열
  const dateRangeLabel = formatDateRange(value) ?? placeholder;

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

  // 확인 버튼 클릭시 외부에 선택한 범위를 전달한 후 팝오버 닫기
  const handleConfirm = () => {
    onConfirm(draftRange);
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

    document.addEventListener('mousedown', handleClickOutside);

    // cleanup에서 이벤트 리스너 제거
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
        className="min-w-64 justify-start gap-2"
      >
        <Calendar className="size-4 text-gray-400" aria-hidden />
        {dateRangeLabel}
      </Button>

      {/* 팝오버 영역 (isOpen이 true일 때만 표시) */}
      {isOpen ? (
        <div
          id={popoverId}
          role="dialog"
          aria-label="날짜 범위 선택"
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
            <Button
              variant="outlined"
              onClick={() => {
                setDraftRange(undefined);
                onConfirm(undefined);
                setIsOpen(false);
              }}
            >
              전체 기간
            </Button>
            <Button variant="secondary" onClick={handleCancel}>
              취소
            </Button>
            <Button variant="solid" onClick={handleConfirm}>
              확인
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
