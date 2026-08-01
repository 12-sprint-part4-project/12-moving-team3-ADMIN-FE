import { AdminLayout } from '@/components/AdminLayout/AdminLayout';

const HomePage = () => (
  <AdminLayout
    title="대시보드"
    description="관리자 대시보드 임시 페이지입니다."
  >
    <section className="rounded-lg border border-line-200 bg-white p-6 text-md-regular text-black-300">
      대시보드 콘텐츠 영역
    </section>
  </AdminLayout>
);

export default HomePage;
