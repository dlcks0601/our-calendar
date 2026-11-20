import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** 홈 화면 아이콘 — 검은 타일 위에 겹친 두 원(나의 시간과 너의 시간이 겹치는 곳). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
        }}
      >
        <svg width="132" height="132" viewBox="0 0 24 24">
          <circle cx="9.6" cy="12" r="4.4" fill="none" stroke="#fff" strokeWidth="1.5" />
          <circle cx="14.4" cy="12" r="4.4" fill="none" stroke="#fff" strokeWidth="1.5" />
        </svg>
      </div>
    ),
    size,
  );
}
