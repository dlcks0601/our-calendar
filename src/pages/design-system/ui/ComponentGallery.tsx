'use client';

import { useState } from 'react';
import { Bell, ChevronLeft, ChevronsUpDown, X } from 'lucide-react';
import { ActionButton } from '@/shared/ui/action-button';
import { Badge } from '@/shared/ui/badge';
import { Chip } from '@/shared/ui/chip';
import { IconButton } from '@/shared/ui/icon-button';
import { SelectRow } from '@/shared/ui/select-row';
import { KIND_COLOR } from '@/shared/tokens';
import { Group, Value } from './Section';

const VARIANTS = ['solid', 'weak', 'ghost'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg'] as const;
const SIZE_NOTE = { xs: '28px', sm: '36px', md: '44px', lg: '54px' } as const;
const VARIANT_NOTE = { solid: '화면의 주 행동', weak: '보조 행동', ghost: '바탕 없음' } as const;
const DURATIONS = ['30분', '1시간', '1시간 30분'];
const KIND_CHIPS = [
  ['focus', '집중 시간'],
  ['offsite', '외근'],
  ['lunch', '점심'],
  ['personal', '휴가'],
] as const;
const ROWS = [
  { title: '11월 25일 (수) 오전 9:00', sub: '필수 2명 모두 편하게 참석할 수 있어요', badge: 'rec' as const },
  { title: '11월 25일 (수) 오전 9:30', sub: '박준호님은 뒤 30분만 함께할 수 있어요', badge: 'info' as const },
  { title: '11월 27일 (금) 오후 1:30', sub: '점심 직후라 조금 나른할 수 있어요', badge: 'warn' as const },
];
const BADGE_LABEL = { rec: '추천', info: '부분', warn: '아쉬움', ok: '자동 포함' } as const;

/** 실제 컴포넌트를 변형별로 늘어놓는다. 전부 눌리고, 상태가 바뀐다. */
export function ComponentGallery() {
  const [duration, setDuration] = useState(DURATIONS[1]);
  const [kind, setKind] = useState<(typeof KIND_CHIPS)[number][0]>('focus');
  const [row, setRow] = useState(0);
  const [required, setRequired] = useState(true);

  return (
    <>
      <Group title="버튼" note="종류는 무게를, 크기는 자리를 정한다. 한 화면에 검정 면(solid)은 하나만 둔다.">
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-x-4 border-spacing-y-3">
            <thead>
              <tr>
                <th />
                {SIZES.map((size) => (
                  <th key={size} className="text-left font-normal">
                    <Value>
                      {size} · {SIZE_NOTE[size]}
                    </Value>
                  </th>
                ))}
                <th className="text-left font-normal">
                  <Value>비활성</Value>
                </th>
              </tr>
            </thead>
            <tbody>
              {VARIANTS.map((variant) => (
                <tr key={variant}>
                  <th className="pr-2 text-left font-normal">
                    <span className="block text-body-s font-semibold text-strong">{variant}</span>
                    <Value>{VARIANT_NOTE[variant]}</Value>
                  </th>
                  {SIZES.map((size) => (
                    <td key={size}>
                      <ActionButton variant={variant} size={size}>
                        일정 만들기
                      </ActionButton>
                    </td>
                  ))}
                  <td>
                    <ActionButton variant={variant} disabled>
                      일정 만들기
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ActionButton variant="weak" pill>
            참석자에게는 이렇게 보여요
          </ActionButton>
          <ActionButton
            size="xs"
            variant={required ? 'solid' : 'weak'}
            aria-pressed={required}
            onClick={() => setRequired(!required)}
          >
            {required ? '꼭 참석' : '선택'}
            <ChevronsUpDown size={12} aria-hidden className="opacity-45" />
          </ActionButton>
          <Value>알약 모양(pill)과, 누르면 뒤집히는 꼭 참석 토글</Value>
        </div>
      </Group>

      <Group title="아이콘 버튼" note="글자가 없으므로 이름(aria-label)을 타입으로 강제한다.">
        <div className="flex flex-wrap items-center gap-6">
          <span className="flex items-center gap-2">
            <IconButton aria-label="뒤로">
              <ChevronLeft size={22} aria-hidden />
            </IconButton>
            <Value>md · 40px</Value>
          </span>
          <span className="flex items-center gap-2">
            <IconButton size="sm" tone="default" aria-label="알림">
              <Bell size={18} aria-hidden />
            </IconButton>
            <Value>sm · 32px</Value>
          </span>
          <span className="flex items-center gap-2">
            <IconButton size="xs" tone="faint" aria-label="빼기">
              <X size={16} aria-hidden />
            </IconButton>
            <Value>xs · 28px</Value>
          </span>
        </div>
      </Group>

      <Group title="칩" note="여러 개 중 하나를 고른다. 고른 것은 검정 면이고, 일정 종류를 고를 때만 그 종류의 색을 쓴다.">
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((label) => (
            <Chip key={label} selected={duration === label} onClick={() => setDuration(label)}>
              {label}
            </Chip>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {KIND_CHIPS.map(([value, label]) => (
            <Chip
              key={value}
              selected={kind === value}
              onClick={() => setKind(value)}
              tint={{ bg: KIND_COLOR[value].bg, text: KIND_COLOR[value].fg }}
            >
              {label}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="배지" note="상태를 알린다. 누를 수 없고, 색만으로 말하지 않도록 항상 글자를 함께 쓴다.">
        <div className="flex flex-wrap items-center gap-3">
          {(['rec', 'info', 'warn', 'ok'] as const).map((tone) => (
            <Badge key={tone} tone={tone} size="sm">
              {BADGE_LABEL[tone]}
            </Badge>
          ))}
          <span className="mx-2 h-4 w-px bg-muted" />
          {(['rec', 'info', 'warn', 'ok'] as const).map((tone) => (
            <Badge key={tone} tone={tone}>
              {BADGE_LABEL[tone]}
            </Badge>
          ))}
        </div>
      </Group>

      <Group title="선택 행" note="목록에서 하나를 고른다. 바탕 없이 오른쪽 체크가 선택을 말한다.">
        <div className="max-w-[440px] px-3">
          {ROWS.map((r, i) => (
            <SelectRow
              key={r.title}
              title={r.title}
              sub={r.sub}
              selected={row === i}
              badge={
                <Badge tone={r.badge} size="sm">
                  {BADGE_LABEL[r.badge]}
                </Badge>
              }
              onSelect={() => setRow(i)}
            />
          ))}
        </div>
      </Group>
    </>
  );
}
