import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** 홈 화면 아이콘 — 꽉 찬 원과, 3시 방향만 비운 점 원. */
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
          background: '#fff',
        }}
      >
        <svg width="136" height="64" viewBox="0 0 34 16">
          <circle cx="8" cy="8" r="7.25" fill="#000" />
          <circle cx="30.46" cy="11.15" r="0.95" fill="#000" />
          <circle cx="28.15" cy="13.46" r="0.95" fill="#000" />
          <circle cx="25.0" cy="14.3" r="0.95" fill="#000" />
          <circle cx="21.85" cy="13.46" r="0.95" fill="#000" />
          <circle cx="19.54" cy="11.15" r="0.95" fill="#000" />
          <circle cx="18.7" cy="8.0" r="0.95" fill="#000" />
          <circle cx="19.54" cy="4.85" r="0.95" fill="#000" />
          <circle cx="21.85" cy="2.54" r="0.95" fill="#000" />
          <circle cx="25.0" cy="1.7" r="0.95" fill="#000" />
          <circle cx="28.15" cy="2.54" r="0.95" fill="#000" />
          <circle cx="30.46" cy="4.85" r="0.95" fill="#000" />
        </svg>
      </div>
    ),
    size,
  );
}
