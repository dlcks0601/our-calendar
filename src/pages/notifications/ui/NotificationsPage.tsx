'use client';

import { FrostedBar } from '@/shared/ui/frosted-bar';
import { NotificationList, type AppNotification } from '@/widgets/notification-center';
import { ChevronLeft } from 'lucide-react';
import { Reveal } from '@/shared/ui/reveal';

// ── 알림 페이지 — 모바일에서 벨 탭 시 진입(바텀시트 대체). 풀페이지 리스트. ──

export default function NotificationsPage({
  notifications,
  onBack,
  onSelectInvite,
}: {
  notifications: AppNotification[];
  onBack: () => void;
  onSelectInvite: (n: AppNotification) => void;
}) {
  return (
    <main className="min-h-dvh bg-bg">
      {/* 내비 바 — 뒤로가기 좌측 + 타이틀 중앙(모바일 표준 문법). 상시 frost. */}
      <FrostedBar innerClassName="mx-auto max-w-[560px] px-4 lg:px-0">
        <Reveal as="header" className="relative flex h-14 items-center">
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로"
            className="pressable -ml-2 flex h-10 w-10 items-center justify-center rounded-full text-text-strong hover:bg-section"
          >
            <ChevronLeft size={22} aria-hidden />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[17px] font-bold tracking-[-0.01em] text-text-strong">
            알림
          </h1>
        </Reveal>
      </FrostedBar>
      <div className="mx-auto max-w-[560px] px-4 pb-16 lg:px-0">
        <Reveal delay={140}>
          <NotificationList list={notifications} now={Date.now()} onSelectInvite={onSelectInvite} />
        </Reveal>
      </div>
    </main>
  );
}
