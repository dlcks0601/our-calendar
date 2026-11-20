import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import '../styles/globals.css';

/**
 * Overused Grotesk는 로고에만 쓴다(`font-logo` 유틸리티, shared/ui/wordmark).
 * 화면의 글자는 한글·영문·숫자 모두 Pretendard다.
 */
const overusedGrotesk = localFont({
  src: '../fonts/OverusedGrotesk-VF.ttf',
  variable: '--font-wordmark',
  weight: '200 900',
  display: 'swap',
  adjustFontFallback: false,
});

export function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko" className={overusedGrotesk.variable}>
      <body className="bg-bg text-text-strong antialiased">{children}</body>
    </html>
  );
}
