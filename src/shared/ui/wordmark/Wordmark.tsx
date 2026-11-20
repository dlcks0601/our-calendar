/**
 * 로고 — 심벌 없이 글자만 쓴다. `our`는 진하게, `calendar`는 옅게.
 * 글꼴은 로고에만 쓰는 Overused Grotesk(`font-logo`).
 */
export default function Wordmark() {
  return (
    <span className="font-logo text-[20px] leading-none tracking-[-0.02em]">
      <span className="font-semibold text-text-strong">our</span>
      <span className="ml-[5px] font-normal text-text-strong/55">calendar</span>
    </span>
  );
}
