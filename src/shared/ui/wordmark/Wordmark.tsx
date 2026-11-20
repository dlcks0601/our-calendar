/**
 * 로고 락업 — 심벌 + `our`(진하게) `calendar`(옅게).
 * 심벌은 검은 타일 위에 겹친 두 원: 나의 시간과 너의 시간이 겹치는 곳이 우리의 시간이다.
 */
export default function Wordmark() {
  return (
    <span className="flex items-center gap-[7px]">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="shrink-0">
        <rect width="24" height="24" rx="6" fill="#000" />
        <circle cx="9.6" cy="12" r="4.4" fill="none" stroke="#fff" strokeWidth="1.5" />
        <circle cx="14.4" cy="12" r="4.4" fill="none" stroke="#fff" strokeWidth="1.5" />
      </svg>
      <span className="text-[19px] leading-none tracking-[-0.02em]">
        <span className="font-semibold text-text-strong">our</span>
        <span className="ml-[5px] font-normal text-text-strong/55">calendar</span>
      </span>
    </span>
  );
}
