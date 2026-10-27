import './styles/app.css';
import { render } from './app/render';
import { navigate, openScreen } from './app/router';
import { mountFooter } from './components/mountFooter';
import { mountShell } from './components/shell/mountShell';
import { bindGlobalEvents } from './controller/events';
import { APP } from './core/config';
import { $, startAtTop } from './core/dom';
import { storage } from './core/storage';
import { setLargeText } from './features/largeText';
import { registerAppIcon } from './features/shortcut';
import { mountMain } from './pages/Main';
import { rerenderScreen } from './pages/screen';
import { state } from './state/store';
import { mountModalLayer } from './ui/modal';

/** 화면 영역 — index.html 에 항상 있음 */
const region = (selector: string): HTMLElement => {
  const element = $<HTMLElement>(selector);
  if (!element) throw new Error(`${selector} 영역이 없습니다.`);
  return element;
};

/* 시작 ================================================================= */
function boot(): void {
  const root = document.documentElement;
  root.classList.toggle('feat-hide-guest-login', APP.features.hideGuestLoginOnMobile);
  root.classList.toggle('feat-compact-shortcut', APP.features.compactShortcutBarOnMobile);
  root.classList.toggle('feat-hide-life-guide', APP.features.hideLifeGuideOnMobile);

  region('#protoNotice').innerHTML = `<b>기획 검토용 프로토타입 ${APP.version}</b> · 표시된 고객·계약·금액은 모두 샘플입니다. 실제 인증·거래는 일어나지 않습니다.`;

  if (storage.get(APP.storageKeys.largeText) === '1') {
    state.ui.largeText = true;
    root.classList.add('big');
  }

  registerAppIcon();
  mountShell({ header: region('#header'), appBar: region('#appbar'), tabBar: region('#tabbar') });
  mountMain(region('#main'));
  mountFooter(region('#footer'));
  mountModalLayer(region('#layer'));
  bindGlobalEvents();
  render();
  startAtTop();   // 새로고침 시 이전 스크롤 위치가 아닌 메인 맨 위
}

/* 테스트·시연용 진입점 (개발자 도구에서 App.openScreen('CT-01') 등) */
declare global {
  interface Window { App: Record<string, unknown> }
}
window.App = { state, render, navigate, openScreen, setLargeText, rerenderScreen };

boot();
