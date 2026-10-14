export const $  = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/** 목록을 HTML 조각으로 이어 붙임: each(list, item => `<li>…</li>`) */
export const each = (list, toHtml) => list.map(toHtml).join('');
/** 조건이 참일 때만 HTML 조각을 넣음 */
export const when = (condition, html) => (condition ? html : '');

export const escapeHtml = value => String(value ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

export const scrollToTop = () => window.scrollTo({ top: 0 });
export const isNarrowScreen = () => matchMedia('(max-width:860px)').matches;

export const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** 프로그램으로 초점 옮기기 (원래 초점을 받지 않는 요소는 tabindex=-1 부여) */
export function focusElement(element) {
  if (!element) return;
  if (!element.matches(FOCUSABLE)) element.setAttribute('tabindex', '-1');
  element.focus({ preventScroll: true });
}
