import { hideMegaMenu, showMegaMenu } from '../components/shell/mountShell';
import { $ } from '../core/dom';
import { shortcut, type InstallPromptEvent } from '../features/shortcut';
import { state } from '../state/store';
import { handleModalKeys } from '../ui/modal';
import { runAction } from './actions';

/** Esc로 닫으며 주메뉴로 초점을 돌려줄 때는 메가메뉴를 다시 열지 않음 */
let isReturningFocus = false;

export function bindGlobalEvents(): void {
  document.addEventListener('click', event => {
    const target = (event.target as Element | null)?.closest<HTMLElement>('[data-action]');
    if (target && !(target as HTMLButtonElement).disabled) runAction(target, event);
  });

  /* 키보드: 모달 안 Tab 순환 · Esc로 모달/메가메뉴 닫기 */
  document.addEventListener('keydown', event => {
    if (handleModalKeys(event)) return;
    if (event.key === 'Escape' && state.ui.mega) {
      const { group } = state.ui.mega;
      hideMegaMenu();
      isReturningFocus = true;
      $<HTMLElement>(`#gnb [data-group="${group}"]`)?.focus();
      isReturningFocus = false;
    }
  });

  /* GNB에 마우스를 올리거나 포커스하면 메가메뉴 */
  const header = $('#header');
  if (!header) return;
  const showForGnbButton = (event: Event) => {
    const button = (event.target as Element | null)?.closest<HTMLElement>('#gnb [data-group]');
    if (isReturningFocus || !button) return;
    const group = button.dataset.group ?? '';
    if (state.ui.mega?.group !== group) showMegaMenu(group);
  };
  header.addEventListener('mouseover', showForGnbButton);
  header.addEventListener('focusin', showForGnbButton);
  header.addEventListener('mouseleave', hideMegaMenu);
  header.addEventListener('focusout', event => { if (!header.contains(event.relatedTarget as Node | null)) hideMegaMenu(); });

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    shortcut.installPrompt = event as InstallPromptEvent;
  });
}
