import type { ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';

/* 업무 화면 본문(#sbody)을 React로 그리는 템플릿용 루트 관리.
   화면 틀은 아직 innerHTML 로 다시 만들어지므로, 다시 그리기 전에 이전 루트를 반드시 해제 */
let current: Root | null = null;

export function unmountScreenBody(): void {
  current?.unmount();
  current = null;
}

export function mountScreenBody(container: HTMLElement, body: ReactNode): void {
  unmountScreenBody();
  current = createRoot(container);
  flushSync(() => current?.render(body));
}
