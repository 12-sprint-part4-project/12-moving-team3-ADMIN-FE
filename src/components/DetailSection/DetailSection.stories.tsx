import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { DetailSection } from './DetailSection';

const meta: Meta<typeof DetailSection> = {
  title: 'Admin/DetailSection',
  component: DetailSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    padding: {
      control: 'select',
      options: ['md', 'lg'],
    },
  },
  args: {
    title: '기본 정보',
    children: (
      <dl className="flex flex-col gap-2 text-md-medium">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">이름</dt>
          <dd className="text-black-400">김무빙</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">이메일</dt>
          <dd className="text-black-400">moving@example.com</dd>
        </div>
      </dl>
    ),
  },
  decorators: [
    (Story) => (
      <div className="max-w-lg bg-background-200 p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof DetailSection>;

export const Default: Story = {};

export const MultipleSections: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <DetailSection padding={args.padding} title="기본 정보">
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
      <DetailSection padding={args.padding} title="경력 및 소개">
        <p className="text-md-regular text-black-300">
          5년 경력의 이사 전문가입니다. 안전하고 신속한 서비스를 제공합니다.
        </p>
      </DetailSection>
      <DetailSection padding={args.padding} title="제공 서비스">
        <ul className="list-disc pl-5 text-md-medium text-black-300">
          <li>소형 이사</li>
          <li>가정 이사</li>
          <li>사무실 이사</li>
        </ul>
      </DetailSection>
    </div>
  ),
};
