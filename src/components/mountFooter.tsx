import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { APP } from '../core/config';
import { Footer } from './Footer';

/** 공통 하단을 React로 한 번만 그림 (내용이 화면 상태와 무관해 다시 그리지 않음) */
export function mountFooter(container: HTMLElement): void {
  const root = createRoot(container);
  flushSync(() => root.render(<Footer links={APP.footerLinks} specVersion={APP.specVersion} />));
}
