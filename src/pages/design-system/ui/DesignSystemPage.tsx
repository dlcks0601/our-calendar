import { CONTRAST_PAIRS, contrastRatio, KIND_COLOR, PERSON_COLORS, resolveColor, TOKENS } from '@/shared/tokens';
import { Wordmark } from '@/shared/ui/wordmark';
import { ComponentGallery } from './ComponentGallery';
import { Group, Section, Value } from './Section';

/**
 * 디자인 시스템 문서 화면. 값은 전부 토큰 명세(TOKENS)에서 읽어 그린다 —
 * 이 파일에 값을 다시 적지 않으므로, 명세를 고치면 문서가 함께 바뀐다.
 */

const NAV = [
  ['principles', '원칙'],
  ['color', '색'],
  ['type', '글자'],
  ['shape', '모양'],
  ['motion', '모션'],
  ['components', '컴포넌트'],
  ['contrast', '대비'],
  ['numbers', '전후 수치'],
] as const;

const PRINCIPLES = [
  ['명세가 원천이다', '색, 글자, 모서리, 그림자, 모션의 값은 명세 한 곳에만 있다. CSS 변수는 거기서 생성하고, 생성물은 직접 고치지 않는다.'],
  ['검정은 주 행동과 선택에만 쓴다', '화면에서 가장 진한 것은 지금 누를 것이거나 지금 고른 것이다. 그 밖의 면은 검정으로 칠하지 않는다.'],
  ['색은 정보에만 쓴다', '일정 종류, 사람, 경고, 새 알림처럼 구분해야 할 것에만 색이 있다. 버튼과 선택은 무채색이다.'],
  ['변형은 고르는 것이다', '버튼의 종류와 크기는 조합표에 정의돼 있고, 화면은 이름만 고른다. 화면에서 값을 새로 만들지 않는다.'],
  ['지켜야 할 것은 검사한다', '대비, 생성물의 최신 여부, 화면 코드의 임의값과 테마에 없는 클래스는 테스트가 본다. 화면이 달라졌는지는 픽셀 대조가 본다.'],
] as const;

const ROLE_GROUPS = [
  { title: '글자', prefix: 'text', roles: TOKENS.fg },
  { title: '바탕', prefix: 'bg', roles: TOKENS.bg },
  { title: '선', prefix: 'border', roles: TOKENS.stroke },
] as const;

const KIND_LABEL: Record<keyof typeof KIND_COLOR, [string, string]> = {
  meeting: ['회의', '주간 스프린트 계획'],
  focus: ['집중 시간', '기획서 집중'],
  lunch: ['점심', '점심'],
  personal: ['휴가', '오후 반차'],
  offsite: ['외근', '파트너사 방문'],
};

/**
 * 디자인 시스템을 올리기 전과 후를 `scripts/measure-design-values.mjs`로 잰 값(2026-11-20).
 * 토큰처럼 명세에서 읽을 수 있는 값이 아니라 그날의 측정 기록이라 여기에 적어 둔다.
 */
const NUMBERS = [
  ['글자 크기', '임의값 18종, 159곳', '13단계, 140곳'],
  ['줄 높이', '임의값 8종, 43곳', '4단계, 38곳'],
  ['모서리', '12종, 124곳', '8종 (6단계, 원형, 상속), 97곳'],
  ['그림자', '임의값 12종, 18곳', '4단계, 18곳'],
  ['코드에 직접 쓴 색', '66종, 110곳', '17종, 17곳 (모두 아바타 일러스트)'],
  ['직접 쓴 button 요소', '55곳', '32곳'],
  ['누르는 요소의 클래스 조합', '35종', '20종'],
  ['그중 검정 면을 쓰는 조합', '12종', '4종 (선택된 날짜 칸과 시간 칩)'],
  ['스프링 설정', '6종, 17곳', '프리셋 4개, 17곳'],
  ['테마 CSS 변수', '29개', '138개'],
] as const;

const CONTRAST_STATUS = { pass: '통과', miss: '미달', exempt: '대상 아님' } as const;

const SAMPLE = '모두가 괜찮은 시간을 찾아드려요';

function Swatch({ color, label, note }: { color: string; label: string; note: string }) {
  return (
    <div className="min-w-0">
      <div className="h-12 rounded-r3 ring-1 ring-default" style={{ backgroundColor: color }} />
      <p className="mt-1.5 truncate text-label font-semibold text-strong">{label}</p>
      <p className="truncate text-caption text-muted">{note}</p>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="min-h-dvh bg-page">
      <div className="mx-auto max-w-[960px] px-5 pb-24 pt-6 lg:px-6">
        <header className="flex items-center justify-between">
          <a href="/" aria-label="our calendar 홈으로">
            <Wordmark />
          </a>
          <a href="/" className="text-body-s text-muted underline-offset-4 hover:text-strong hover:underline">
            캘린더로 돌아가기
          </a>
        </header>

        <div className="pb-12 pt-16">
          <h1 className="text-display font-bold tracking-tight text-strong">디자인 시스템</h1>
          <p className="mt-3 max-w-[640px] break-keep text-body-l leading-loose text-default">
            our calendar의 화면을 이루는 값과 부품입니다. 이 문서의 모든 값은 코드의 토큰 명세에서 읽어 그리기 때문에,
            문서와 제품이 어긋나지 않습니다.
          </p>
          <nav aria-label="문서 안에서 이동" className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {NAV.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="text-body-s text-muted underline-offset-4 hover:text-strong hover:underline">
                {label}
              </a>
            ))}
          </nav>
        </div>

        <Section id="principles" title="원칙">
          <ol className="grid gap-x-10 gap-y-6 lg:grid-cols-2">
            {PRINCIPLES.map(([title, body]) => (
              <li key={title}>
                <p className="text-title-s font-semibold text-strong">{title}</p>
                <p className="mt-1 break-keep text-body leading-loose text-default">{body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          id="color"
          title="색"
          lead="팔레트에서 역할로, 역할에서 화면으로 간다. 무채색은 역할 이름으로만 쓰고(테스트가 지킨다), 색 계열은 일정 종류나 사람처럼 색이 곧 정보인 곳에서 팔레트 단계를 직접 쓴다."
        >
          <Group title="팔레트" note="계열별 단계표. 숫자가 클수록 진하다. 실제로 쓰는 단계만 둔다.">
            <div className="space-y-4">
              {Object.entries(TOKENS.palette).map(([family, steps]) => (
                <div key={family} className="grid grid-cols-[72px_1fr] items-start gap-3">
                  <p className="pt-3.5 text-body-s font-semibold text-strong">{family}</p>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
                    {Object.entries(steps).map(([step, value]) => (
                      <Swatch key={step} color={value} label={step} note={value} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Group>

          <Group title="역할" note="화면에서 쓰는 이름. 클래스가 역할 그대로 읽힌다.">
            <div className="grid gap-8 lg:grid-cols-3">
              {ROLE_GROUPS.map(({ title, prefix, roles }) => (
                <div key={title}>
                  <p className="text-body-s font-semibold text-strong">{title}</p>
                  <ul className="mt-2 divide-y divide-default">
                    {Object.entries(roles).map(([name, ref]) => (
                      <li key={name} className="flex items-center gap-3 py-2">
                        <span className="h-6 w-6 shrink-0 rounded-full ring-1 ring-default" style={{ backgroundColor: resolveColor(ref) }} />
                        <span className="min-w-0 flex-1 truncate text-body-s text-strong">
                          {prefix}-{name}
                        </span>
                        <Value>{ref}</Value>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Group>

          <Group title="일정 종류" note="종류는 색으로 구분한다. 옅은 바탕에 같은 계열의 짙은 글자를 올린다.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {(Object.keys(KIND_COLOR) as (keyof typeof KIND_COLOR)[]).map((kind) => (
                <div key={kind} className="rounded-r4 px-3 py-2.5" style={{ backgroundColor: KIND_COLOR[kind].bg }}>
                  <p className="truncate text-body-s font-bold" style={{ color: KIND_COLOR[kind].fg }}>
                    {KIND_LABEL[kind][1]}
                  </p>
                  <p className="text-caption font-medium" style={{ color: KIND_COLOR[kind].fgMuted }}>
                    오후 2:00–3:00
                  </p>
                  <p className="mt-3 text-caption text-muted">
                    {KIND_LABEL[kind][0]} · {TOKENS.kindFamily[kind]}
                  </p>
                </div>
              ))}
            </div>
          </Group>

          <Group title="사람" note="시간 찾기의 타임라인에서 누가 언제 바쁜지를 구분한다.">
            <div className="flex flex-wrap gap-4">
              {PERSON_COLORS.map((color, i) => (
                <span key={color} className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full" style={{ backgroundColor: color }} />
                  <Value>{TOKENS.person[i]}</Value>
                </span>
              ))}
            </div>
          </Group>
        </Section>

        <Section id="type" title="글자" lead="크기와 줄 높이를 한 단계로 묶는다. 굵기는 단계를 통째로 한 칸씩 가볍게 잡아, 무게는 글자가 아니라 검정 면이 지게 한다.">
          <ul className="divide-y divide-default">
            {Object.entries(TOKENS.text)
              .reverse()
              .map(([name, step]) => (
                <li key={name} className="grid grid-cols-[112px_1fr] items-baseline gap-4 py-3">
                  <span>
                    <span className="block text-body-s font-semibold text-strong">text-{name}</span>
                    <Value>
                      {step.size}px / {step.lineHeight}
                    </Value>
                  </span>
                  <span className="truncate font-semibold text-strong" style={{ fontSize: step.size, lineHeight: step.lineHeight }}>
                    {SAMPLE}
                  </span>
                </li>
              ))}
          </ul>
          <Group title="굵기">
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {Object.entries(TOKENS.weight).map(([name, weight]) => (
                <span key={name}>
                  <span className="block text-title text-strong" style={{ fontWeight: weight }}>
                    가나다 Aa 123
                  </span>
                  <Value>
                    font-{name} · {weight}
                  </Value>
                </span>
              ))}
            </div>
          </Group>
        </Section>

        <Section id="shape" title="모양">
          <Group title="모서리">
            <div className="flex flex-wrap items-end gap-5">
              {Object.entries(TOKENS.radius).map(([name, px]) => (
                <span key={name}>
                  <span className="block h-16 w-16 bg-subtle ring-1 ring-default" style={{ borderRadius: px }} />
                  <span className="mt-1.5 block text-label font-semibold text-strong">rounded-{name}</span>
                  <Value>{px}px</Value>
                </span>
              ))}
              <span>
                <span className="block h-16 w-16 rounded-full bg-subtle ring-1 ring-default" />
                <span className="mt-1.5 block text-label font-semibold text-strong">rounded-full</span>
                <Value>원형, 알약</Value>
              </span>
            </div>
          </Group>
          <Group title="그림자" note="얕은 것부터. 바탕에서 얼마나 떠 있는지를 말한다.">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(TOKENS.shadow).map(([name, value]) => (
                <div key={name}>
                  <div className="h-20 rounded-r5 bg-page" style={{ boxShadow: value }} />
                  <p className="mt-3 text-label font-semibold text-strong">shadow-{name}</p>
                </div>
              ))}
            </div>
          </Group>
        </Section>

        <Section id="motion" title="모션" lead="움직임은 사람의 행동에 답할 때만 쓴다. 자리 이동은 넘치지 않게, 작은 것이 나타날 때만 살짝 넘치게 한다.">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-body-s font-semibold text-strong">스프링</p>
              <ul className="mt-2 divide-y divide-default">
                {Object.entries(TOKENS.spring).map(([name, spring]) => (
                  <li key={name} className="flex items-center justify-between py-2">
                    <span className="text-body-s text-strong">SPRING.{name}</span>
                    <Value>
                      강성 {spring.stiffness} · 감쇠 {spring.damping}
                    </Value>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-body-s font-semibold text-strong">가속 곡선</p>
              <ul className="mt-2 divide-y divide-default">
                {Object.entries(TOKENS.easing).map(([name, value]) => (
                  <li key={name} className="flex items-center justify-between gap-4 py-2">
                    <span className="text-body-s text-strong">--bezier-{name}</span>
                    <Value>{value}</Value>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section id="components" title="컴포넌트" lead="아래는 그림이 아니라 제품이 쓰는 실제 컴포넌트입니다. 눌러 보세요.">
          <ComponentGallery />
        </Section>

        <Section
          id="contrast"
          title="대비"
          lead="글자 역할마다 화면에서 놓이는 바탕과의 대비입니다. 본문 글자는 WCAG AA인 4.5:1을 지킵니다. 보조 글자는 이 제품이 정한 3:1을 지키지만, 작은 글자에 4.5:1을 요구하는 AA에는 못 미칩니다. 기준을 넘지 못하는 조합도 숨기지 않고 이유와 함께 적습니다."
        >
          <ul className="grid gap-x-10 lg:grid-cols-2">
            {CONTRAST_PAIRS.map((pair) => {
              const ratio = contrastRatio(pair.fg, pair.bg);
              const status = pair.waiver?.type ?? 'pass';
              return (
                <li key={pair.label} className="flex items-center gap-3 border-b border-default py-2">
                  <span
                    className="flex h-8 w-11 shrink-0 items-center justify-center rounded-r2 text-body-s font-semibold ring-1 ring-default"
                    style={{ backgroundColor: pair.bg, color: pair.fg }}
                  >
                    가
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-s text-strong">{pair.label}</span>
                    {pair.waiver && <span className="block break-keep text-caption text-muted">{pair.waiver.reason}</span>}
                  </span>
                  <span className="shrink-0 text-right">
                    <Value>
                      {ratio.toFixed(2)} : 1 · 기준 {pair.min}
                    </Value>
                    <span className={`block text-caption ${status === 'pass' ? 'text-muted' : 'font-semibold text-strong'}`}>
                      {CONTRAST_STATUS[status]}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section
          id="numbers"
          title="전후 수치"
          lead="화면이 먼저 있었고, 디자인 시스템은 나중에 올렸습니다. 흩어져 있던 값을 같은 스크립트(scripts/measure-design-values.mjs)로 앞뒤로 재서 남깁니다."
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-default">
                  {['항목', '이전', '이후'].map((head) => (
                    <th key={head} className="py-2 text-label font-medium text-muted">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {NUMBERS.map(([item, before, after]) => (
                  <tr key={item} className="border-b border-default">
                    <td className="py-2.5 text-body-s font-semibold text-strong">{item}</td>
                    <td className="py-2.5 text-body-s text-muted">{before}</td>
                    <td className="py-2.5 text-body-s text-strong">{after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </main>
  );
}
