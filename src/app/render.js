import { refreshShell } from '../components/shell/mountShell';
import { $ } from '../core/dom.js';
import { renderAllMenuPage } from '../pages/allMenu.js';
import { renderHomePage } from '../pages/home.js';
import { renderLoginPage } from '../pages/login.js';
import { renderScreenPage, saveScreenInputs } from '../pages/screen.js';
import { state } from '../state/store';
import { applyTableA11y } from '../ui/a11y.js';
import { documentTitle } from './router.js';

const PAGES = {
  home:   renderHomePage,
  all:    renderAllMenuPage,
  login:  renderLoginPage,
  screen: () => renderScreenPage(state.route.screenId),
};

/** 화면 설정(큰글씨)만 바꿔 다시 그림: 입력 중인 값은 유지 */
export function refresh() {
  saveScreenInputs();
  render();
}

export function render() {
  state.ui.mega = null;   // 화면을 다시 그리면 메가메뉴는 닫힘
  refreshShell();
  PAGES[state.route.page]();
  applyTableA11y($('#main'));
  document.title = documentTitle();
}
