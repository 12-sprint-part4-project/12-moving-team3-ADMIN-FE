import { AdminDetailQueryBody } from './AdminDetailQueryBody';

import type {
  AdminDetailQueryHook,
  AdminDetailQueryResult,
} from './AdminDetailQueryBody';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

interface StoryDetail {
  id: number;
  name: string;
}

const SELECTED_ID = 1;

const STORY_DETAIL: StoryDetail = {
  id: SELECTED_ID,
  name: '김무빙',
};

const createUseDetail = (
  result: AdminDetailQueryResult<StoryDetail>
): AdminDetailQueryHook<StoryDetail> => {
  const useDetail = () => result;
  return useDetail;
};

const IDLE_RESULT: AdminDetailQueryResult<StoryDetail> = {
  data: undefined,
  error: null,
  isPending: false,
  isError: false,
  isSuccess: false,
  refetch: () => undefined,
};

const renderContent = (detail: StoryDetail) => (
  <p className="text-md-medium text-black-400">{detail.name}</p>
);

const meta: Meta<typeof AdminDetailQueryBody<StoryDetail>> = {
  title: 'Admin/AdminDetailQueryBody',
  component: AdminDetailQueryBody,
  tags: ['autodocs'],
  args: {
    id: SELECTED_ID,
    notFoundTitle: '정보를 찾을 수 없습니다.',
    errorTitle: '상세를 불러오지 못했습니다.',
    errorDescription: '잠시 후 다시 시도해 주세요.',
    retryLabel: '다시 시도',
    emptyTitle: '정보가 없습니다.',
    emptyDescription: '선택한 항목을 찾을 수 없습니다.',
    renderContent,
  },
};

export default meta;

type Story = StoryObj<typeof AdminDetailQueryBody<StoryDetail>>;

export const Loading: Story = {
  args: {
    useDetail: createUseDetail({
      ...IDLE_RESULT,
      isPending: true,
    }),
  },
};

export const QueryError: Story = {
  args: {
    useDetail: createUseDetail({
      ...IDLE_RESULT,
      isError: true,
      error: new Error('조회 실패'),
    }),
  },
};

export const Empty: Story = {
  args: {
    useDetail: createUseDetail({
      ...IDLE_RESULT,
      isSuccess: true,
      data: undefined,
    }),
  },
};

export const IdMismatch: Story = {
  args: {
    useDetail: createUseDetail({
      ...IDLE_RESULT,
      isSuccess: true,
      data: { data: { id: 2, name: '이전 캐시' } },
    }),
  },
};

export const Success: Story = {
  args: {
    useDetail: createUseDetail({
      ...IDLE_RESULT,
      isSuccess: true,
      data: { data: STORY_DETAIL },
    }),
  },
};
