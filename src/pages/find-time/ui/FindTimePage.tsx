'use client';

import { useEffect, useState, type Dispatch } from 'react';
import { useReducedMotion } from 'motion/react';
import FindTime from './FindTime';
import ScanMoment from './ScanMoment';
import { useCandidates, type Action, type AppState } from '@/features/schedule-meeting';

// ── find — 스캔 모먼트(1회) → 추천 리스트(모바일)/캔버스+레일(데스크톱) ────

/**
 * '시간 찾아보기' 착지 화면. `!scanPlayed`면 스캔 모먼트를 먼저 재생하고(뒤 콘텐츠는
 * 렌더하지 않는다 — 라이트 풀블리드 무대), onDone에서 PLAY_SCAN → 추천 화면 리빌.
 * scanPlayed=true면 즉시 콘텐츠 — 조건 변경·재진입 어느 경로로도 스캔은 재등장하지 않는다.
 * reduced-motion: 연출 전체 생략 — 즉시 PLAY_SCAN + aria-live polite 1회 공지.
 * 후보 파생(useCandidates)은 여기서 한 번만 — 모바일(lg 미만)·데스크톱(lg 이상)이 공유한다.
 */
export default function FindTimePage({ state, dispatch }: { state: AppState; dispatch: Dispatch<Action> }) {
  const reduced = !!useReducedMotion();
  const candidates = useCandidates(state);
  const [announced, setAnnounced] = useState(false);

  useEffect(() => {
    if (!state.scanPlayed && reduced) {
      dispatch({ type: 'PLAY_SCAN' });
      setAnnounced(true);
    }
  }, [state.scanPlayed, reduced, dispatch]);

  const scanning = !state.scanPlayed && !reduced;

  return (
    <main className="min-h-dvh bg-page">
      {scanning ? (
        /* 라이트 풀블리드 무대 — ScanMoment가 뷰포트 전체를 소유한다(모바일·PC 동일 문법). */
        <ScanMoment
          attendees={candidates.attendees}
          duration={state.duration}
          onDone={() => dispatch({ type: 'PLAY_SCAN' })}
        />
      ) : (
        /* 모바일·PC 단일 구현 — 한 칼럼의 층위를 PC에선 반반으로 펼친다(리디자인 Q1~Q10). */
        <FindTime state={state} dispatch={dispatch} candidates={candidates} />
      )}
      {/* reduced-motion 공지 — live 영역은 상시 존재해야 삽입 텍스트가 공지된다 */}
      <div aria-live="polite" className="sr-only">
        {announced ? `${candidates.attendees.length}명의 일정을 확인했어요` : ''}
      </div>
    </main>
  );
}

