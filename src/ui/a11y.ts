/** 표 접근성: 열 제목에 scope, 가로 스크롤 영역은 키보드로 스크롤할 수 있게 이름을 붙임 (KWCAG 8 · 29번) */
export function applyTableA11y(root: ParentNode): void {
  root.querySelectorAll('th:not([scope])').forEach(th => th.setAttribute('scope', 'col'));
  root.querySelectorAll<HTMLElement>('.tbl-wrap').forEach(wrap => {
    const name = wrap.querySelector('caption')?.textContent?.split('·')[0].trim() || wrap.closest('.card')?.querySelector('h2')?.textContent?.trim() || '표';
    wrap.tabIndex = 0;
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', `${name} 표 (좌우로 스크롤할 수 있음)`);
  });
}
