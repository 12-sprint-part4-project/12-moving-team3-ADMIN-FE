import { useState, type ChangeEvent } from 'react';
import { expect, within } from 'storybook/test';

import { MultiFieldSearch } from './MultiFieldSearch';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

type FieldName = 'id' | 'userName' | 'phoneNumber';

interface ControlledMultiFieldSearchProps {
  disabled?: boolean;
  fieldErrors?: Partial<Record<FieldName, string>>;
  initialValues?: Partial<Record<FieldName, string>>;
}

const ControlledMultiFieldSearch = ({
  disabled = false,
  fieldErrors,
  initialValues,
}: ControlledMultiFieldSearchProps) => {
  const [values, setValues] = useState<Record<FieldName, string>>({
    id: '',
    userName: '김',
    phoneNumber: '',
    ...initialValues,
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
      disabled={disabled}
      fields={[
        {
          name: 'id',
          value: values.id,
          placeholder: '견적 번호',
          'aria-label': '견적 번호',
          errorMessage: fieldErrors?.id,
          onChange: handleFieldChange('id'),
        },
        {
          name: 'userName',
          value: values.userName,
          placeholder: '요청자 이름',
          'aria-label': '요청자 이름',
          errorMessage: fieldErrors?.userName,
          onChange: handleFieldChange('userName'),
        },
        {
          name: 'phoneNumber',
          value: values.phoneNumber,
          placeholder: '전화번호',
          'aria-label': '전화번호',
          errorMessage: fieldErrors?.phoneNumber,
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

/** 활성 상태만 표시한다. */
export const Default: Story = {
  render: () => <ControlledMultiFieldSearch />,
};

/** 입력과 검색 버튼을 비활성화한다. */
export const Disabled: Story = {
  render: () => <ControlledMultiFieldSearch disabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchButton = canvas.getByRole('button', { name: '검색' });

    await expect(searchButton).toBeDisabled();
  },
};

/** 필드별 errorMessage를 하단에 표시한다. */
export const Error: Story = {
  render: () => (
    <ControlledMultiFieldSearch
      initialValues={{ id: 'ABC', phoneNumber: '-' }}
      fieldErrors={{
        id: '견적 번호는 숫자만 입력해 주세요.',
        phoneNumber: '전화번호는 숫자를 포함해 입력해 주세요.',
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('견적 번호는 숫자만 입력해 주세요.')
    ).toBeVisible();
    await expect(
      canvas.getByText('전화번호는 숫자를 포함해 입력해 주세요.')
    ).toBeVisible();
  },
};
