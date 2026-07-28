import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/components/Button/Button';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';

import { DataTable, type Column, type DataTableProps } from './DataTable';

/** 회원 관리 목록을 대표하는 스토리용 행 타입 */
interface MemberRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinedAt: string;
  status: 'active' | 'suspended';
}

const MEMBER_ROWS: MemberRow[] = [
  {
    id: 1024,
    name: '김가나',
    email: 'kimgana@example.com',
    phone: '010-1234-5678',
    joinedAt: '2024-07-01 14:25',
    status: 'active',
  },
  {
    id: 1023,
    name: '이나다',
    email: 'leenada@example.com',
    phone: '010-2345-6789',
    joinedAt: '2024-06-28 09:10',
    status: 'active',
  },
  {
    id: 1022,
    name: '박다라',
    email: 'parkdara@example.com',
    phone: '010-3456-7890',
    joinedAt: '2024-06-15 18:42',
    status: 'suspended',
  },
  {
    id: 1021,
    name: '최라마',
    email: 'choirama@example.com',
    phone: '010-4567-8901',
    joinedAt: '2024-05-30 11:05',
    status: 'active',
  },
];

/** accessor(텍스트)와 render(Badge·Button)를 함께 보여주는 회원 목록 열 정의 */
const MEMBER_COLUMNS: Column<MemberRow>[] = [
  { key: 'id', header: '번호', accessor: 'id' },
  { key: 'name', header: '이름', accessor: 'name' },
  { key: 'email', header: '이메일', accessor: 'email' },
  { key: 'phone', header: '전화번호', accessor: 'phone' },
  { key: 'joinedAt', header: '가입일', accessor: 'joinedAt' },
  {
    key: 'status',
    header: '상태',
    align: 'center',
    render: (row) => (
      <StatusBadge
        variant={row.status === 'active' ? 'success' : 'danger'}
        label={row.status === 'active' ? '활성' : '정지'}
      />
    ),
  },
  {
    key: 'actions',
    header: '관리',
    align: 'center',
    render: () => (
      <Button variant="secondary" className="px-3 py-1.5 text-sm-medium">
        상세 보기
      </Button>
    ),
  },
];

const meta = {
  title: 'Admin/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  // 복잡한 columns/data/rowKey는 Controls에서 편집하기 어려워 비활성화한다.
  argTypes: {
    loading: { control: 'boolean' },
    emptyMessage: { control: 'text' },
    caption: { control: 'text' },
    className: { control: 'text' },
    columns: { control: false },
    data: { control: false },
    rowKey: { control: false },
  },
  args: {
    columns: MEMBER_COLUMNS,
    data: MEMBER_ROWS,
    rowKey: 'id',
    loading: false,
    emptyMessage: '데이터가 없습니다.',
    caption: '회원 목록',
  },
} satisfies Meta<DataTableProps<MemberRow>>;

export default meta;

type Story = StoryObj<DataTableProps<MemberRow>>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    emptyMessage: '등록된 회원이 없습니다.',
  },
};
