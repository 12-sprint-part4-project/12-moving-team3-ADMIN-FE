import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState, type ComponentProps } from 'react';

import { DetailSection } from '@/components/DetailSection/DetailSection';

import { DetailDrawer } from './DetailDrawer';

type DetailDrawerProps = ComponentProps<typeof DetailDrawer>;

const DetailDrawerDemo = ({
  onClose,
  children,
  footer,
  ...props
}: DetailDrawerProps) => {
  const [open, setOpen] = useState(false);

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
        onClose={() => {
          setOpen(false);
          onClose();
        }}
        footer={footer}
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
