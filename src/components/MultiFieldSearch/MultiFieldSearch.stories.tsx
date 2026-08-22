import { useState, type ChangeEvent } from 'react';

import { MultiFieldSearch } from './MultiFieldSearch';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

type FieldName = 'id' | 'userName' | 'phoneNumber';

const ControlledMultiFieldSearch = () => {
  const [values, setValues] = useState<Record<FieldName, string>>({
    id: '',
    userName: '김',
    phoneNumber: '',
  });

  const handleFieldChange =
    (key: FieldName) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((previous) => ({
        ...previous,
        [key]: event.target.value,
      }));
    };

  return (
    <MultiFieldSearch
      fields={[
        {
          name: 'id',
          value: values.id,
          placeholder: '견적 번호',
          'aria-label': '견적 번호',
          onChange: handleFieldChange('id'),
        },
        {
          name: 'userName',
          value: values.userName,
          placeholder: '요청자 이름',
          'aria-label': '요청자 이름',
          onChange: handleFieldChange('userName'),
        },
        {
          name: 'phoneNumber',
          value: values.phoneNumber,
          placeholder: '전화번호',
          'aria-label': '전화번호',
          onChange: handleFieldChange('phoneNumber'),
        },
      ]}
      onSearch={() => undefined}
    />
  );
};

const META: Meta<typeof MultiFieldSearch> = {
  title: 'Admin/MultiFieldSearch',
  component: MultiFieldSearch,
  tags: ['autodocs'],
};

export default META;

type Story = StoryObj<typeof MultiFieldSearch>;

export const Default: Story = {
  render: () => <ControlledMultiFieldSearch />,
};
