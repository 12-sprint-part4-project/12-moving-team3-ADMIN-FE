import { Button } from '@/components/Button/Button';

export interface ReportProcessActionToggleProps {
  label: string;
  selected: boolean;
  /** PENDING이 아니면 선택 자체를 막는다. */
  disabled?: boolean;
  /** 비활성일 때 기존 안내 톤(gray-500)으로 이유를 보여 준다. */
  disabledReason?: string | null;
  onToggle: () => void;
}

/**
 * 신고 처리 Action 선택 토글.
 * 선택됨(danger) / 미선택(outlined)으로 시각적으로 구분한다.
 * 노출 여부는 availableActions로 결정하고, 이 컴포넌트는 선택 UI만 담당한다.
 */
export const ReportProcessActionToggle = ({
  label,
  selected,
  disabled = false,
  disabledReason = null,
  onToggle,
}: ReportProcessActionToggleProps) => (
  <div className="flex flex-col gap-2">
    <Button
      type="button"
      variant={selected ? 'danger' : 'outlined'}
      className="w-full"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onToggle}
    >
      {label}
    </Button>
    {disabled && disabledReason ? (
      <p className="text-md-regular text-gray-500">{disabledReason}</p>
    ) : null}
  </div>
);
