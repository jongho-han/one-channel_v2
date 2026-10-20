import type { ReactNode } from 'react';

/** 모달 제목 — 대화상자 이름(aria-labelledby="modalTitle") */
export const ModalTitle = ({ children }: { children: ReactNode }) => <h2 id="modalTitle">{children}</h2>;
