import './styles/app.css';
import { render } from './app/render.js';
import { navigate, openScreen } from './app/router.js';
import { mountFooter } from './components/mountFooter';
import { mountShell } from './components/shell/mountShell';
import { bindGlobalEvents } from './controller/events.js';
import { APP } from './core/config';
import { $ } from './core/dom.js';
import { storage } from './core/storage.js';
import { setLargeText } from './features/largeText.js';
import { registerAppIcon } from './features/shortcut.js';
import { mountMain } from './pages/Main';
import { rerenderScreen } from './pages/screen';
import { state } from './state/store';

/* 시작 ================================================================= */
function boot() {
  const root = document.documentElement;
  root.classList.toggle('feat-hide-guest-login', APP.features.hideGuestLoginOnMobile);
  root.classList.toggle('feat-compact-shortcut', APP.features.compactShortcutBarOnMobile);
  root.classList.toggle('feat-hide-life-guide', APP.features.hideLifeGuideOnMobile);

  $('#protoNotice').innerHTML = `<b>기획 검토용 프로토타입 ${APP.version}</b> · 표시된 고객·계약·금액은 모두 샘플입니다. 실제 인증·거래는 일어나지 않습니다.`;

  if (storage.get(APP.storageKeys.largeText) === '1') {
    state.ui.largeText = true;
    root.classList.add('big');
  }

  registerAppIcon();
  mountShell({ header: $('#header'), appBar: $('#appbar'), tabBar: $('#tabbar') });
  mountMain($('#main'));
  mountFooter($('#footer'));
  bindGlobalEvents();
  render();
}

/* 테스트·시연용 진입점 (개발자 도구에서 App.openScreen('CT-01') 등) */
window.App = { state, render, navigate, openScreen, setLargeText, rerenderScreen };

boot();
