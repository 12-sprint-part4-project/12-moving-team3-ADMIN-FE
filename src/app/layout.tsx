import localFont from 'next/font/local';

import { cn } from '@/lib/utils';
import { I18nProvider } from '@/providers/I18nProvider';
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
  title: 'Moving Admin',
  description: 'Moving service administration portal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={cn(pretendard.variable, 'h-full overflow-hidden antialiased')}
    >
      <body className="flex h-full flex-col overflow-hidden">
        <I18nProvider>
          <QueryProvider>{children}</QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
