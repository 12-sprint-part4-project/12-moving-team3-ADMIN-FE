import {
  Children,
  cloneElement,
  isValidElement,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { DetailSection } from '@/components/DetailSection/DetailSection';

import { DetailDrawer } from './DetailDrawer';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

interface StoryDetailFieldProps {
  label: string;
  value: string | number;
}

/** 스토리 전용 행. 회원 상세 모듈(API/Query)을 끌어오지 않는다. */
const StoryDetailField = ({ label, value }: StoryDetailFieldProps) => (
  <div className="flex min-w-0 justify-between gap-4">
    <dt className="shrink-0 text-gray-500">{label}</dt>
    <dd className="min-w-0 flex-1 break-all text-right text-black-400">
      {value}
    </dd>
  </div>
);

interface DetailDrawerDemoProps extends ComponentProps<typeof DetailDrawer> {
  open: boolean;
}

const withCloseHandler = (
  node: ReactNode,
  handleClose: () => void
): ReactNode => {
  if (!isValidElement(node)) {
    return node;
  }

  const element = node as ReactElement<{
    children?: ReactNode;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  }>;

  if (element.type === 'button') {
    return cloneElement(element, {
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        element.props.onClick?.(event);
        handleClose();
      },
    });
  }

  if (element.props.children == null) {
    return element;
  }

  return cloneElement(element, {
    children: Children.map(element.props.children, (child) =>
      withCloseHandler(child, handleClose)
    ),
  });
};

const DetailDrawerDemo = ({
  onClose,
  children,
  footer,
  ...props
}: DetailDrawerDemoProps) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  return (
    <div className="flex min-h-80 items-center justify-center bg-background-200 p-8">
      <button
        type="button"
        className="rounded-lg bg-blue-300 px-4 py-2 text-md-semibold text-white"
        onClick={() => setOpen(true)}
      >
        Drawer 열기
      </button>
      <DetailDrawer
        {...props}
        open={open}
        onClose={handleClose}
        footer={
          footer == null ? undefined : withCloseHandler(footer, handleClose)
        }
      >
        {children}
      </DetailDrawer>
    </div>
  );
};

const meta: Meta<typeof DetailDrawer> = {
  title: 'Admin/DetailDrawer',
  component: DetailDrawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
관리자 상세 정보를 화면 오른쪽에 표시하는 공통 Drawer입니다.

**지원 범위**
- 한 번에 하나의 DetailDrawer만 연다.
- ESC 닫기, Overlay 클릭 닫기, 포커스 트랩, 포커스 복원, body scroll lock을 보장한다.

**제한 사항**
- 중첩·다중 Drawer 스택은 지원하지 않는다.
- 라디오 그룹 전용 Tab 순서 처리는 포함하지 않는다.
        `.trim(),
      },
      story: {
        inline: false,
        iframeHeight: 560,
      },
    },
  },
  argTypes: {
    open: { control: false },
    onClose: { action: 'closed' },
    size: {
      control: 'select',
      options: ['md', 'lg'],
    },
  },
  args: {
    title: '상세 정보',
    children: (
      <DetailSection title="기본 정보">
        <dl className="flex flex-col gap-2 text-md-medium">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">이름</dt>
            <dd className="text-black-400">김무빙</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">연락처</dt>
            <dd className="text-black-400">010-1234-5678</dd>
          </div>
        </dl>
      </DetailSection>
    ),
  },
  render: (args) => <DetailDrawerDemo {...args} />,
};

export default meta;

type Story = StoryObj<typeof DetailDrawer>;

export const Default: Story = {};

export const WithFooter: Story = {
  args: {
    title: '신고 상세',
    footer: (
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-lg border border-line-200 px-4 py-2 text-md-semibold text-black-300"
        >
          신고 반려
        </button>
        <button
          type="button"
          className="flex-1 rounded-lg bg-blue-300 px-4 py-2 text-md-semibold text-white"
        >
          처리 완료
        </button>
        <button
          type="button"
          className="flex-1 rounded-lg bg-red-200 px-4 py-2 text-md-semibold text-white"
        >
          회원 정지
        </button>
      </div>
    ),
  },
};

export const LongEmail: Story = {
  args: {
    title: '기사 상세',
    children: (
      <DetailSection title="기본 정보">
        <dl className="flex flex-col gap-2 text-md-medium">
          <StoryDetailField label="이름" value="김무빙" />
          <StoryDetailField label="닉네임" value="안전한이사" />
          <StoryDetailField
            label="이메일"
            value="very-long-email-address-without-spaces-for-drawer-layout-verification@example-domain.com"
          />
          <StoryDetailField label="가입일" value="2026. 08. 13." />
          <StoryDetailField label="신고 횟수" value={12} />
        </dl>
      </DetailSection>
    ),
  },
};

export const LongContent: Story = {
  args: {
    title: '견적 요청 상세 정보',
    children: (
      <div className="flex flex-col gap-4">
        <DetailSection title="기본 정보">
          <p className="text-md-medium text-black-300">
            긴 콘텐츠에서 Body 영역이 스크롤되는지 확인합니다.
          </p>
        </DetailSection>
        {Array.from({ length: 8 }, (_, index) => (
          <DetailSection key={index} title={`섹션 ${index + 1}`}>
            <p className="text-md-regular text-gray-500">
              섹션 본문 예시입니다. Drawer Body는 세로로 스크롤되고 Header와
              Footer는 고정됩니다.
            </p>
          </DetailSection>
        ))}
      </div>
    ),
    footer: (
      <button
        type="button"
        className="w-full rounded-lg border border-line-200 px-4 py-2 text-md-semibold text-black-300"
      >
        닫기
      </button>
    ),
  },
};
