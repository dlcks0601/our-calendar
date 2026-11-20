import type { ReactNode } from 'react';

export const metadata = { title: 'our calendar' };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
