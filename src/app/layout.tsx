import localFont from 'next/font/local';

import { cn } from '@/lib/utils';
import { QueryProvider } from '@/providers/QueryProvider';

import './globals.css';

import type { Metadata } from 'next';

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  weight: '45 920',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '무빙 관리자',
  description: '무빙 서비스 관리자 페이지',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(pretendard.variable, 'h-full overflow-hidden antialiased')}
    >
      <body className="flex h-full flex-col overflow-hidden">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
