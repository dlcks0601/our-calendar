import type { ReactNode } from 'react';

/** 문서 화면의 한 절 — 제목, 한 줄 설명, 내용. */
export function Section({ id, title, lead, children }: { id: string; title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8 border-t border-default py-12">
      <h2 className="text-heading font-bold tracking-tight text-strong">{title}</h2>
      {lead && <p className="mt-2 max-w-[640px] break-keep text-body leading-loose text-default">{lead}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

/** 절 안의 작은 묶음 제목 */
export function Group({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <div className="mt-10 first:mt-0">
      <h3 className="text-title-s font-semibold text-strong">{title}</h3>
      {note && <p className="mt-1 max-w-[640px] break-keep text-body-s text-muted">{note}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

/** 값을 적는 고정폭 느낌의 작은 글자 */
export function Value({ children }: { children: ReactNode }) {
  return <span className="text-label text-muted">{children}</span>;
}
