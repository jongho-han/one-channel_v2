/* DOM 유틸 (선택자·스크롤·초점 이동) */
export const $ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T | null => root.querySelector<T>(selector);

export const scrollToTop = (): void => window.scrollTo({ top: 0 });

/** 새로고침하면 메인 맨 위에서 시작: 브라우저의 이전 스크롤 위치 복원을 끄고 맨 위로 */
export function startAtTop(win: Window = window): void {
  if ('scrollRestoration' in win.history) win.history.scrollRestoration = 'manual';
  win.scrollTo({ top: 0 });
}
export const isNarrowScreen = (): boolean => matchMedia('(max-width:860px)').matches;

export const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** 프로그램으로 초점 옮기기 (원래 초점을 받지 않는 요소는 tabindex=-1 부여) */
export function focusElement(element: Element | null | undefined): void {
  if (!(element instanceof HTMLElement)) return;
  if (!element.matches(FOCUSABLE)) element.setAttribute('tabindex', '-1');
  element.focus({ preventScroll: true });
}
