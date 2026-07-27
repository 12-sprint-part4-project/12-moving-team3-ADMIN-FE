import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState, type ChangeEvent, type ComponentProps } from 'react';

import { SearchInput } from './SearchInput';

type SearchInputProps = ComponentProps<typeof SearchInput>;

const ControlledSearchInput = (args: SearchInputProps) => {
  const [value, setValue] = useState('홍길동');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    args.onChange?.(event);
  };

  return (
    <SearchInput
      {...args}
      value={value}
      onChange={handleChange}
      onSearch={(nextValue) => {
        args.onSearch?.(nextValue);
      }}
    />
  );
};

const FILTER_TRIGGER_CLASS =
  'flex items-center rounded-lg border border-line-200 bg-white px-3.5 py-1.5 text-md-medium text-black-400';

const InFilterBarSearchInput = (args: SearchInputProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <SearchInput {...args} className="min-w-64 flex-1" />
    <button type="button" className={FILTER_TRIGGER_CLASS} aria-pressed={false}>
      상태 전체
    </button>
    <button type="button" className={FILTER_TRIGGER_CLASS} aria-pressed={false}>
      가입일 전체
    </button>
  </div>
);

const META: Meta<typeof SearchInput> = {
  title: 'Admin/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    onChange: { action: 'changed' },
    onSearch: { action: 'searched' },
  },
  args: {
    placeholder: '이름, 이메일, 휴대폰 검색',
  },
};

export default META;

type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    defaultValue: '김이사',
  },
};

export const LongPlaceholder: Story = {
  args: {
    placeholder: '이사 유형, 출발지, 도착지, 고객명, 전화번호 검색',
    className: 'max-w-xl',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: '검색 불가',
  },
};

export const Controlled: Story = {
  render: (args) => <ControlledSearchInput {...args} />,
};

export const InFilterBar: Story = {
  render: (args) => <InFilterBarSearchInput {...args} />,
};
