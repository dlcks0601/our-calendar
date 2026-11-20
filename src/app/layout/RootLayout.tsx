import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import '../styles/globals.css';

/**
 * 라틴 글자와 숫자는 Overused Grotesk, 한글은 Pretendard가 맡는다.
 * 글꼴 목록에서 Overused Grotesk가 앞에 있고 한글 글리프가 없어, 한글만 Pretendard로 넘어간다.
 */
const overusedGrotesk = localFont({
  src: '../fonts/OverusedGrotesk-VF.ttf',
  variable: '--font-latin',
  weight: '200 900',
  display: 'swap',
});

export function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko" className={overusedGrotesk.variable}>
      <body className="bg-bg text-text-strong antialiased">{children}</body>
    </html>
  );
}
