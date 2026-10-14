import { $, $$ } from '../core/dom.js';

/** 표 접근성: 열 제목에 scope, 가로 스크롤 영역은 키보드로 스크롤할 수 있게 이름을 붙임 (KWCAG 8 · 29번) */
export function applyTableA11y(root) {
  $$('th:not([scope])', root).forEach(th => th.setAttribute('scope', 'col'));
  $$('.tbl-wrap', root).forEach(wrap => {
    const name = $('caption', wrap)?.textContent.split('·')[0].trim() || wrap.closest('.card')?.querySelector('h2')?.textContent.trim() || '표';
    Object.assign(wrap, { tabIndex: 0 });
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', `${name} 표 (좌우로 스크롤할 수 있음)`);
  });
}
