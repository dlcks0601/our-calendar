# our calendar 디자인 시스템 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 흩어진 값(글자 크기 18종, 직접 쓴 색 66종, 버튼 조합 35종)을 명세 한 곳에서 생성되는 토큰과 변형 조합표 위로 옮기고, 문서 화면과 검증을 붙인다.

**Architecture:** 토큰 명세는 `src/shared/tokens/spec`의 TypeScript 객체다. 순수 함수가 명세를 Tailwind 4 `@theme` CSS로 바꾸고, 스크립트가 그 결과를 `__generated__`에 쓴다. 컴포넌트는 `recipe()` 조합표로 변형을 정의하고 화면은 `variant`와 `size`만 고른다.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4(`@theme`), Vitest, Node 24(타입 제거 실행), pngjs + pixelmatch(시각 대조).

**Spec:** `docs/superpowers/specs/2026-11-20-design-system-design.md`

## Global Constraints

- 화면 구성과 동작은 바꾸지 않는다. 달라지는 것은 단계에 맞춰지는 값(글자 0.5~1px, 모서리, 그림자, 테두리 회색)뿐이다.
- 기존 테스트 347개, `npm run typecheck`, `npm run lint:fsd`, `npm run build`가 모든 작업 끝에서 통과한다.
- 파란 계열 주색을 쓰지 않는다. 주 행동은 검정(`#000000`)이다. 일정 색은 하늘, 초록, 노랑, 스톤, 코랄이다.
- 생성물(`src/shared/tokens/__generated__/*`)은 직접 고치지 않는다.
- FSD 2.1 레이어 방향을 지킨다. `spec` 폴더 안의 파일은 서로 상대 경로와 `.ts` 확장자로만 import한다(Node가 직접 실행).
- 브랜치는 git-flow. 작업마다 `feature/ds-*`에서 커밋하고 `develop`에 `--no-ff`로 병합한다. 커밋 메시지는 `type(scope): 내용`.
- 토큰 이름은 이 문서에 적힌 것을 쓴다. SEED의 토큰 이름을 그대로 가져오지 않는다.

## Review Focus

1. 색 토큰에 투명도 수식어를 붙인 클래스(`bg-ink/60`)가 생성된 테마에서도 동작해야 한다 → Task 2 빌드 확인.
2. 글자 단계로 맞춘 뒤 한 줄이던 글자가 두 줄로 넘어가면 안 된다 → Task 7 픽셀 대조에서 5% 넘게 달라진 화면을 직접 확인.
3. 생성 스크립트를 돌리지 않고 명세만 고친 채 커밋하면 실패해야 한다 → Task 2 `generated.test.ts`.
4. 임의값을 금지하는 검사가 배치용 임의값(`w-[calc(...)]`, `max-w-[1200px]`)까지 막으면 안 된다 → Task 7 검사 대상은 색, 글자 크기, 줄 높이, 자간, 모서리, 그림자만.
5. 비활성 버튼이 눌리는 것처럼 보이면 안 된다 → Task 4 `ActionButton` disabled 테스트.

---

## File Structure

```
scripts/
  generate-tokens.ts            명세 → __generated__ 쓰기
  visual/capture.mjs            헤드리스 Chrome으로 화면 캡처
  visual/compare.mjs            기준 캡처와 픽셀 대조
src/shared/tokens/
  spec/color.ts                 팔레트, 역할 색, 일정 종류 색, 사람 색
  spec/typography.ts            글자 단계, 줄 높이, 자간
  spec/shape.ts                 모서리, 그림자
  spec/motion.ts                시간, 가속, 스프링
  spec/contrast.ts              대비 계산과 검사할 조합 목록
  spec/index.ts                 명세 모음
  render.ts                     renderThemeCss(spec): string
  __generated__/theme.css       생성물
  index.ts                      공개 API (KIND_COLOR, PERSON_COLORS, SPRING 등)
  *.test.ts
src/shared/lib/recipe/          recipe() 조합표 함수
src/shared/ui/action-button/    ActionButton
src/shared/ui/icon-button/      IconButton
src/shared/ui/select-row/       SelectRow
src/shared/ui/chip|badge|...    기존 컴포넌트를 토큰 위로
src/pages/design-system/        문서 화면
app/design-system/page.tsx      라우트 (다시 내보내기만)
```

---

### Task 1: 시각 대조 도구와 기준 캡처

**Files:**
- Create: `scripts/visual/capture.mjs`, `scripts/visual/compare.mjs`, `scripts/visual/screens.mjs`
- Modify: `package.json`(scripts, devDependencies), `.gitignore`(`.visual/`)

**Interfaces:**
- Produces: `npm run visual:capture -- <name>` → `.visual/<name>/<screen>.png`, `npm run visual:compare -- <a> <b>` → 화면별 달라진 픽셀 비율 표와 `.visual/diff-<a>-<b>/<screen>.png`. 비교 종료 코드는 항상 0이다(판단은 사람이 한다).
- `screens.mjs`의 `SCREENS`: `{ name, path, viewport: 'pc' | 'mo' }[]` — home, setup, find, find-tradeoff, find-none, confirm, invite를 pc·mo로 14개.

- [ ] **Step 1:** `pngjs`, `pixelmatch`를 devDependencies에 추가한다.
- [ ] **Step 2:** `capture.mjs` — `next start`가 떠 있는 `BASE_URL`(기본 `http://localhost:4318`)을 대상으로 Chrome(`CHROME_PATH`, 기본 macOS 경로)을 `--headless=new --force-prefers-reduced-motion --force-device-scale-factor=2 --virtual-time-budget=9000`로 실행한다. pc는 1440×900, mo는 390×844 iframe을 감싼 임시 HTML을 캡처해 pngjs로 왼쪽 위 780×1688을 잘라 낸다.
- [ ] **Step 3:** `compare.mjs` — 두 폴더의 같은 이름 PNG를 pixelmatch(threshold 0.1)로 비교하고 `화면 | 달라진 픽셀 % `를 출력한다. 크기가 다르면 그 화면은 `크기 다름`으로 표시한다.
- [ ] **Step 4:** `npm run build && next start -p 4318`로 띄우고 `npm run visual:capture -- baseline`을 실행한다. 다시 `-- baseline2`로 찍어 `visual:compare -- baseline baseline2`가 모든 화면 0.00%인지 확인한다(캡처가 결정적인지 검증).
- [ ] **Step 5:** Commit `chore(visual): 화면 캡처와 픽셀 대조 스크립트`.

### Task 2: 토큰 명세, 생성, 대비 검사

**Files:**
- Create: `src/shared/tokens/spec/{color,typography,shape,motion,contrast,index}.ts`, `src/shared/tokens/render.ts`, `src/shared/tokens/index.ts`, `scripts/generate-tokens.ts`, `src/shared/tokens/{render,generated,contrast}.test.ts`
- Modify: `src/app/styles/globals.css`, `tsconfig.json`(`allowImportingTsExtensions`), `package.json`(`tokens:generate`)

**Interfaces — 토큰 값(명세에 그대로 적는다):**

팔레트
```
gray     0 #FFFFFF · 50 #F7F7F7 · 100 #F4F4F4 · 200 #E6E6E6 · 300 #D6D6D6 · 400 #B8B8B8 · 500 #8C8C8C · 700 #4A4A4A · 900 #2E2E2E · 1000 #000000
sky      100 #DDF0FB · 200 #C2E0F6 · 500 #3AA3DA · 600 #4A93BD · 800 #136A99
green    100 #DFF3E6 · 200 #C3E6CF · 500 #3DAE74 · 600 #4E9D73 · 800 #1F7A4B
yellow   100 #FCF1D6 · 200 #F3E0B0 · 500 #E0A82E · 600 #B08A3A · 800 #8A6410
stone    100 #EEEDEA · 200 #DEDCD6 · 500 #8F8C82 · 600 #7A7870 · 800 #4A4944
coral    100 #FCE7E0 · 200 #F4CFC3 · 500 #E0704F · 600 #C6765F · 800 #A2452B
rose     100 #FBE6EE · 500 #C56B8E · 800 #A33A62
olive    100 #EEF3D9 · 500 #7E9A3C · 800 #5C6F14
tan      500 #A9805C
red      500 #F03E3E · 600 #E5342B
```

역할 색 (괄호는 Tailwind 클래스)
```
fg      strong gray-1000 (text-strong) · default gray-700 (text-default) · muted gray-500 (text-muted) · faint gray-400 (text-faint) · disabled gray-300 (text-disabled)
        on-ink gray-0 (text-on-ink) · warning yellow-800 (text-warning) · positive green-800 (text-positive) · critical red-600 (text-critical)
bg      page gray-0 (bg-page) · subtle gray-100 (bg-subtle) · muted gray-200 (bg-muted) · ink gray-1000 (bg-ink) · ink-pressed gray-900 (bg-ink-pressed)
        warning-weak yellow-100 (bg-warning-weak) · positive green-800 (bg-positive) · alert red-500 (bg-alert)
stroke  default gray-200 (border-default, ring-default, divide-default) · strong gray-300 (border-strong) · ink gray-1000 (border-ink, ring-ink)
kind    meeting sky · focus green · lunch yellow · personal stone · offsite coral
        각각 bg 100 · border 200 · bar 500 · fg-muted 600 · fg 800
person  sky-500 · green-500 · coral-500 · yellow-500 · stone-500 · rose-500 · olive-500 · tan-500
```
기존 `border`(#E3E3E3)는 `stroke.default`(#E6E6E6)로 합친다.

글자 (크기px / 줄 높이) — 클래스 `text-<이름>`
```
micro 7/1 · caption-s 10/1.4 · caption 11/1.4 · label 12/1.4 · body-s 13/1.5 · body 14/1.5 · body-l 15/1.5
title-s 16/1.4 · title 18/1.35 · title-l 20/1.35 · heading 22/1.3 · heading-l 24/1.3 · display 28/1.3
```
줄 높이 `leading-dense 1.3 · snug 1.4 · normal 1.5 · loose 1.6`, 자간 `tracking-tight -0.02em · snug -0.01em`.
굵기는 기존 값 유지(light 300, normal 380, medium 440, semibold 500, bold 560, extrabold 600, black 620).

모양
```
radius  r1 6px · r2 8px · r3 10px · r4 12px · r5 16px · r6 24px (rounded-r1 … rounded-r6), full
shadow  s1 0 1px 3px rgb(0 0 0 / .06)
        s2 0 2px 10px rgb(0 0 0 / .18)
        s3 0 8px 24px rgb(0 0 0 / .18)
        s4 0 16px 40px rgb(0 0 0 / .14), 0 2px 8px rgb(0 0 0 / .06)
```

모션: `SPRING.position { stiffness: 350, damping: 30 }`, `SPRING.pop { stiffness: 500, damping: 18 }`, `SPRING.sheet { stiffness: 400, damping: 30 }`. 가속 곡선은 기존 `--bezier-*` 다섯 개를 명세로 옮긴다.

- Produces: `renderThemeCss(spec: TokenSpec): string` — `@theme { ... }` 한 블록. 색은 `--text-color-*`, `--background-color-*`, `--border-color-*`, `--ring-color-*`, `--divide-color-*`, 팔레트는 `--color-<계열>-<단계>`, 글자는 `--text-<이름>`과 `--text-<이름>--line-height`.
- Produces: `contrastRatio(a: string, b: string): number`, `CONTRAST_PAIRS: { fg: string; bg: string; min: number; label: string }[]`.
- Produces(`@/shared/tokens`): `KIND_COLOR: Record<EventKind 문자열, { bg; border; bar; fgMuted; fg }>`, `PERSON_COLORS: readonly string[]`, `SPRING`, `TOKENS`(문서 화면용 전체 명세).

- [ ] **Step 1:** 실패하는 테스트를 쓴다. `render.test.ts`: `renderThemeCss(spec)`에 `--background-color-ink: #000000;`, `--text-color-strong: #000000;`, `--text-body: 14px;`, `--text-body--line-height: 1.5;`, `--radius-r5: 16px;`가 들어 있다. `contrast.test.ts`: `contrastRatio('#000000', '#FFFFFF')`가 21, `CONTRAST_PAIRS`의 모든 조합이 `min` 이상(본문 글자 4.5, 큰 글자와 아이콘 3). `generated.test.ts`: `__generated__/theme.css` 파일 내용이 `renderThemeCss(TOKENS)`와 같다.
- [ ] **Step 2:** `npm test`로 실패를 확인한다.
- [ ] **Step 3:** 명세와 `render.ts`, `scripts/generate-tokens.ts`를 쓰고 `npm run tokens:generate`로 생성한다. `CONTRAST_PAIRS`에는 `fg.strong/default/muted × bg.page/subtle`, `fg.on-ink × bg.ink`, 일정 종류 다섯 개의 `fg × bg`, `fg.warning × bg.warning-weak`를 넣는다. `fg.muted`가 `bg.subtle` 위에서 4.5에 못 미치면 `min`을 3으로 두고 "보조 글자" 라벨을 붙인다(값을 바꾸지 않는다. 화면이 달라지면 안 된다).
- [ ] **Step 4:** `globals.css`에서 직접 쓴 `@theme` 값을 지우고 생성물을 `@import`한다. 화면이 아직 옛 클래스(`text-text-strong`, `bg-section` 등)를 쓰므로, 옛 이름을 새 토큰에 연결하는 임시 별칭 블록을 `globals.css`에 둔다(Task 7에서 지운다).
- [ ] **Step 5:** `npm test`, `npm run build` 통과를 확인하고, 빌드된 CSS에 `bg-ink\/60` 형태가 동작하는지 임시 요소로 확인한 뒤 지운다.
- [ ] **Step 6:** `visual:capture -- t2` 후 `visual:compare -- baseline t2`. 달라지는 것은 테두리 회색(#E3E3E3 → #E6E6E6)뿐이어야 한다.
- [ ] **Step 7:** Commit `feat(tokens): 토큰 명세와 테마 생성, 대비 검사`.

### Task 3: 변형 조합표 `recipe()`

**Files:**
- Create: `src/shared/lib/recipe/recipe.ts`, `recipe.test.ts`, `index.ts`

**Interfaces:**
- Produces:
```ts
type VariantDefs = Record<string, Record<string, string>>;
type Selection<V extends VariantDefs> = { [K in keyof V]?: keyof V[K] | boolean };
function recipe<V extends VariantDefs>(config: {
  base?: string;
  variants: V;
  compoundVariants?: (Selection<V> & { class: string })[];
  defaultVariants?: Selection<V>;
}): (selection?: Selection<V> & { className?: string }) => string;
```
변형 키가 `'true'`/`'false'`이면 boolean으로 고를 수 있다.

- [ ] **Step 1:** 테스트: base만 있을 때 base를 돌려준다 / 고른 변형의 클래스가 붙는다 / 고르지 않으면 `defaultVariants`가 적용된다 / `compoundVariants`는 조건이 전부 맞을 때만 붙는다 / `className`이 맨 뒤에 붙는다 / boolean 변형 `{ fullWidth: true }`가 `'true'` 키를 고른다 / 결과에 빈 문자열이나 `undefined`가 섞이지 않는다.
- [ ] **Step 2:** 실패 확인 → 구현 → 통과 확인.
- [ ] **Step 3:** Commit `feat(shared): 변형 조합표 recipe 함수`.

### Task 4: 기본 컴포넌트

**Files:**
- Create: `src/shared/ui/action-button/{ActionButton.tsx,action-button.recipe.ts,ActionButton.test.ts,index.ts}`, `src/shared/ui/icon-button/…`, `src/shared/ui/select-row/…`
- Modify: `src/shared/ui/chip/Chip.tsx`, `src/shared/ui/badge/Badge.tsx`(조합표와 새 토큰으로)

**Interfaces:**
- `ActionButton` props: `variant?: 'solid' | 'weak' | 'ghost'`(기본 solid), `size?: 'xs' | 'sm' | 'md' | 'lg'`(기본 md), `fullWidth?: boolean`, 그 밖은 `button` 속성. `actionButton` 조합표를 함께 내보낸다.
  - solid: `bg-ink text-on-ink`, 눌림 `bg-ink-pressed`, 비활성 `bg-subtle text-faint`
  - weak: `bg-subtle text-default`, 호버 `bg-muted`
  - ghost: 바탕 없음 `text-strong`, 호버 `bg-subtle`
  - xs 높이 28 · `text-label` · `rounded-full` / sm 높이 36 · `text-body` · `rounded-r3` / md 높이 44 · `text-body-l` · `rounded-r4` / lg 높이 54 · `text-title-s` · `rounded-r5`
  - 모든 변형에 `pressable`(눌림 축소와 포커스 링)이 붙는다. 비활성일 때는 눌림 축소가 없다.
- `IconButton` props: `size?: 'sm' | 'md'`(32 / 40), `aria-label` 필수(타입으로 강제), 원형 ghost.
- `SelectRow` props: `title: ReactNode`, `sub?: ReactNode`, `selected: boolean`, `leading?: ReactNode`, `trailing?: ReactNode`, `onClick`. 오른쪽 체크는 선택 시 `text-strong`, 아니면 `text-disabled`.
- `Chip`: `selected`일 때 `bg-ink text-on-ink`, 아니면 `bg-subtle text-default`. `tint`는 유지.

- [ ] **Step 1:** 테스트: `actionButton({ variant: 'solid', size: 'lg' })`에 `bg-ink`, `text-on-ink`, `h-13.5`, `rounded-r5`가 있다 / 기본값은 solid·md / `fullWidth: true`면 `w-full` / disabled 클래스에 `disabled:bg-subtle`, `disabled:text-faint`, `disabled:active:scale-100`이 있다 / `Chip`의 선택 클래스.
- [ ] **Step 2:** 실패 확인 → 구현 → 통과 확인.
- [ ] **Step 3:** Commit `feat(shared): 버튼, 아이콘 버튼, 선택 행 컴포넌트`.

### Task 5: shared · entities · widgets · features를 토큰 위로

**Files:**
- Modify: `src/shared/ui/**`, `src/entities/event/model/kind-style.ts`, `src/entities/member/{api/faces.ts,ui/Avatar.tsx}`, `src/widgets/notification-center/ui/*`, `src/features/schedule-meeting/ui/ReasonCard.tsx`

**Interfaces:**
- Consumes: Task 2의 클래스 이름과 `KIND_COLOR`, Task 4의 컴포넌트.
- `KIND_STYLE`은 `KIND_COLOR`에서 값을 받아 지금 모양(`bg, border, title, sub, bar`)을 유지한다(화면 코드와 테스트가 그대로 돈다).
- 옛 클래스 → 새 클래스: `text-text-strong→text-strong`, `text-text-body→text-default`, `text-text-weak→text-muted`, `text-text-faint→text-faint`, `bg-section→bg-subtle`, `bg-primary-tint→bg-muted`, `bg-primary→bg-ink`, `bg-primary-pressed→bg-ink-pressed`, `text-primary→text-strong`, `bg-bg→bg-page`, `bg-white→bg-page`, `text-white→text-on-ink`, `border-border|ring-border|divide-border→*-default`, `bg-border→bg-muted`, `text-border→text-faint`, `bg-warn-bg→bg-warning-weak`, `text-warn-fg→text-warning`, `rounded-card|2xl→rounded-r5`, `rounded-xl→rounded-r4`, `rounded-lg→rounded-r2`, `rounded-md→rounded-r1`.
- 글자 크기: Task 2 표의 가장 가까운 단계. 10.5→caption, 11.5→label, 15.5→title-s, 17→title, 19→title-l.
- 아바타 일러스트의 피부·머리 색은 그림의 일부라 토큰으로 올리지 않는다. `Avatar.tsx` 한 파일만 예외로 둔다.

- [ ] **Step 1:** 치환 스크립트(`scripts/migrate-classes.mjs`, 일회용, 커밋하지 않는다)로 위 표를 적용하고, 버튼은 손으로 `ActionButton`/`IconButton`으로 바꾼다.
- [ ] **Step 2:** `npm test`, `typecheck`, `lint:fsd` 통과.
- [ ] **Step 3:** Commit `refactor(shared): 공용·엔티티·위젯을 토큰과 컴포넌트 위로`.

### Task 6: 화면을 토큰과 컴포넌트 위로

**Files:**
- Modify: `src/pages/{home,setup,find-time,confirm,done,invite,notifications}/ui/*.tsx`

**Interfaces:**
- Consumes: Task 5와 같은 치환 표. 주 버튼은 `ActionButton size="lg" fullWidth`, 헤더의 "일정 만들기"는 `size="sm"`, 꼭 참석 토글은 `size="xs"`, 뒤로·닫기·빼기는 `IconButton`, 추천 행과 장소 행은 `SelectRow`.
- 스프링은 `SPRING.position|pop|sheet`로 바꾼다. `{320,32}`와 `{350,34}`는 position, `{480,40}`은 sheet.
- 그림자 12종은 `shadow-s1…s4`로 묶는다. 사람 색과 일정 색을 쓰던 인라인 스타일은 `PERSON_COLORS`, `KIND_COLOR`를 쓴다.

- [ ] **Step 1:** 화면 하나씩 옮기고, 화면마다 `npm test`와 `typecheck`를 돌린다.
- [ ] **Step 2:** 화면 하나를 옮길 때마다 커밋한다: `refactor(<화면>): 토큰과 컴포넌트 위로`.

### Task 7: 옛 토큰 제거, 임의값 검사, 전후 대조

**Files:**
- Create: `src/shared/tokens/no-arbitrary.test.ts`
- Modify: `src/app/styles/globals.css`(임시 별칭 삭제)

**Interfaces:**
- 검사 대상: `src/**/*.{ts,tsx}` 중 `shared/tokens/spec`, `__generated__`, `*.test.ts`, `entities/member/ui/Avatar.tsx`를 뺀 전부.
- 금지 패턴: `#[0-9a-fA-F]{6}`, `rgba?\(`, `text-\[[\d.]+px\]`, `leading-\[`, `tracking-\[`, `rounded-\[[\d.]+px\]`, `shadow-\[`, 옛 클래스(`text-text-`, `bg-section`, `bg-primary`, `text-primary`, `bg-bg`).

- [ ] **Step 1:** 검사 테스트를 쓰고 실패 목록이 0이 될 때까지 남은 곳을 고친다.
- [ ] **Step 2:** `visual:capture -- after`, `visual:compare -- baseline after`. 5% 넘게 달라진 화면은 diff 이미지를 열어 원인을 확인한다. 줄바꿈이 바뀌었거나 요소가 사라졌으면 고친다.
- [ ] **Step 3:** 처음과 같은 방법으로 다시 측정해 전후 표를 만든다(글자 크기 종류, 직접 쓴 색, 버튼 조합, 그림자, 모서리).
- [ ] **Step 4:** Commit `test(tokens): 임의값 금지 검사, 옛 토큰 별칭 제거`.

### Task 8: 문서 화면 `/design-system`

**Files:**
- Create: `src/pages/design-system/ui/{DesignSystemPage.tsx,TokenTable.tsx,ComponentGallery.tsx}`, `src/pages/design-system/index.ts`, `app/design-system/page.tsx`

**Interfaces:**
- Consumes: `TOKENS`, `CONTRAST_PAIRS`, `contrastRatio`, Task 4 컴포넌트.
- 구성: 원칙(다섯 줄) → 색(팔레트, 역할, 일정 종류, 사람) → 글자 단계 → 모양(모서리, 그림자) → 모션 → 컴포넌트(변형 × 크기 표, 실제로 눌리는 것) → 대비 표(조합별 비율과 통과 여부) → 전후 수치.
- 값은 전부 `TOKENS`에서 읽어 그린다. 화면에 값을 다시 적지 않는다.

- [ ] **Step 1:** 화면을 만들고 `/design-system`이 빌드에 정적 페이지로 잡히는지 확인한다.
- [ ] **Step 2:** pc·mo로 캡처해 직접 확인한다.
- [ ] **Step 3:** Commit `feat(design-system): 토큰과 컴포넌트 문서 화면`.

### Task 9: README와 릴리스

**Files:**
- Modify: `README.md`(디자인 절을 디자인 시스템 절로, 전후 표, 문서 화면 링크, 검증 표에 새 검사 추가), `package.json`(0.3.0)

- [ ] **Step 1:** README를 고치고 문서 화면 캡처를 `docs/readme/`에 넣는다.
- [ ] **Step 2:** `release/0.3.0` → `main` 병합, 태그 `v0.3.0`, `develop` 병합, 푸시. Vercel 자동 배포가 Ready인지와 `/design-system`이 200인지 확인한다.
