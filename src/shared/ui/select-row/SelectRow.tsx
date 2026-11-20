import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

export interface SelectRowProps {
  title: ReactNode;
  sub?: ReactNode;
  selected: boolean;
  /** 제목 앞 아이콘 */
  leading?: ReactNode;
  /** 제목 옆 배지 */
  badge?: ReactNode;
  onSelect: () => void;
}

/**
 * 선택 행 — 여러 개 중 하나를 고르는 목록의 한 줄(추천 시간, 회의 장소).
 * 바탕 없이 오른쪽 체크가 선택을 말한다. 호버 바탕이 글자에 붙지 않도록 좌우로 12px 넓게 잡는다.
 */
export default function SelectRow({ title, sub, selected, leading, badge, onSelect }: SelectRowProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className="pressable -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-r5 px-4 py-3 text-left transition-colors hover:bg-subtle/60"
    >
      {leading}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-body-l font-bold tracking-snug text-strong">{title}</span>
          {badge}
        </span>
        {sub && <span className="mt-0.5 block truncate text-label leading-normal text-muted">{sub}</span>}
      </span>
      <Check
        size={22}
        strokeWidth={3}
        aria-hidden
        className={`shrink-0 transition-colors ${selected ? 'text-strong' : 'text-disabled'}`}
      />
    </button>
  );
}
