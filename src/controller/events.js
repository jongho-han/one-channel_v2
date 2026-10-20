import { hideMegaMenu, showMegaMenu } from '../components/shell/mountShell';
import { $ } from '../core/dom.js';
import { shortcut } from '../features/shortcut.js';
import { state } from '../state/store';
import { handleModalKeys } from '../ui/overlay.js';
import { runAction } from './actions.js';

/** Esc로 닫으며 주메뉴로 초점을 돌려줄 때는 메가메뉴를 다시 열지 않음 */
let isReturningFocus = false;

export function bindGlobalEvents() {
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (target && !target.disabled) runAction(target, event);
    if (!event.target.closest('.search')) $('#sug')?.setAttribute('hidden', '');
  });

  /* 키보드: 모달 안 Tab 순환 · Esc로 모달/메가메뉴 닫기 */
  document.addEventListener('keydown', event => {
    if (handleModalKeys(event)) return;
    if (event.key === 'Escape' && state.ui.mega) {
      const { group } = state.ui.mega;
      hideMegaMenu();
      isReturningFocus = true;
      $(`#gnb [data-group="${group}"]`)?.focus();
      isReturningFocus = false;
    }
  });

  /* GNB에 마우스를 올리거나 포커스하면 메가메뉴 */
  const header = $('#header');
  const showForGnbButton = event => {
    const button = event.target.closest('#gnb [data-group]');
    if (isReturningFocus || !button) return;
    if (state.ui.mega?.group !== button.dataset.group) showMegaMenu(button.dataset.group);
  };
  header.addEventListener('mouseover', showForGnbButton);
  header.addEventListener('focusin', showForGnbButton);
  header.addEventListener('mouseleave', hideMegaMenu);
  header.addEventListener('focusout', event => { if (!header.contains(event.relatedTarget)) hideMegaMenu(); });

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    shortcut.installPrompt = event;
  });
}
