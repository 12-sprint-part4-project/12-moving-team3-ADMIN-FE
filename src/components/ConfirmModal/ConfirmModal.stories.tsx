import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState, type ComponentProps } from 'react';

import { ConfirmModal } from './ConfirmModal';

type ConfirmModalProps = ComponentProps<typeof ConfirmModal>;

const ConfirmModalDemo = ({
  open: _open,
  onConfirm,
  onCancel,
  ...props
}: ConfirmModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-48 items-center justify-center bg-background-200 p-8">
      <button
        type="button"
        className="rounded-lg bg-blue-300 px-4 py-2 text-md-semibold text-white"
        onClick={() => setOpen(true)}
      >
        모달 열기
      </button>
      <ConfirmModal
        {...props}
        open={open}
        onConfirm={() => {
          setOpen(false);
          onConfirm();
        }}
        onCancel={() => {
          setOpen(false);
          onCancel();
        }}
      />
    </div>
  );
};

const meta: Meta<typeof ConfirmModal> = {
  title: 'Admin/ConfirmModal',
  component: ConfirmModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        inline: false,
      },
    },
  },
  argTypes: {
    open: { control: false },
    onConfirm: { action: 'confirmed' },
    onCancel: { action: 'cancelled' },
  },
  args: {
    title: '작업을 진행할까요?',
    description: '이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?',
    confirmText: '확인',
    cancelText: '취소',
  },
  render: (args) => <ConfirmModalDemo {...args} />,
};

export default meta;

type Story = StoryObj<typeof ConfirmModal>;

export const Default: Story = {};

export const LongDescription: Story = {
  args: {
    title: '이 작업을 진행하기 전에 내용을 다시 한 번 확인해 주세요',
    description:
      '관련된 데이터가 함께 변경될 수 있습니다. 진행 후에는 목록과 상세 정보에 결과가 반영되며, 필요 시 관리자 로그에서 이력을 확인할 수 있습니다. 계속 진행할지 신중히 결정해 주세요.',
  },
};

export const CustomButtonText: Story = {
  args: {
    title: '변경 사항을 저장할까요?',
    description: '저장하지 않은 내용은 사라집니다.',
    confirmText: '저장하기',
    cancelText: '돌아가기',
  },
};
