/**
 * 로고 — 글자 없이 심벌만 쓴다.
 * 꽉 찬 원 하나와 점으로 그린 원 하나. 점 원은 시계처럼 열두 자리를 돌되
 * 3시 방향 한 자리만 비운다. 점 사이가 붙어 보이지 않게 점은 작게, 심벌은 크게 둔다.
 */
export default function Wordmark() {
  return (
    <svg
      width="55"
      height="26"
      viewBox="0 0 34 16"
      role="img"
      aria-label="our calendar"
      className="shrink-0 text-text-strong"
      fill="currentColor"
    >
      <circle cx="8" cy="8" r="7.25" />
      <circle cx="30.46" cy="11.15" r="0.95" />
      <circle cx="28.15" cy="13.46" r="0.95" />
      <circle cx="25.0" cy="14.3" r="0.95" />
      <circle cx="21.85" cy="13.46" r="0.95" />
      <circle cx="19.54" cy="11.15" r="0.95" />
      <circle cx="18.7" cy="8.0" r="0.95" />
      <circle cx="19.54" cy="4.85" r="0.95" />
      <circle cx="21.85" cy="2.54" r="0.95" />
      <circle cx="25.0" cy="1.7" r="0.95" />
      <circle cx="28.15" cy="2.54" r="0.95" />
      <circle cx="30.46" cy="4.85" r="0.95" />
    </svg>
  );
}
