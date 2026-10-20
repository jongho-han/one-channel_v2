/* 본문(#main) React 루트: 현재 페이지(메인·전체메뉴·로그인·업무 화면)를 그림
   화면 이동·다시 그리기마다 pageKey 가 바뀌어 페이지를 새로 마운트 (입력 초기화·초점 이동이 기존과 같게) */
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { openScreen } from '../app/router.js';
import { useAppState } from '../components/shell/useAppState';
import { SCREEN_BY_ID, searchScreens } from '../data/menu';
import { announce } from '../ui/overlay.js';
import { AllMenuPage } from './AllMenuPage';
import { HomePage } from './HomePage';
import { LoginPage } from './LoginPage';
import { ScreenPage } from './ScreenPage';

function Page() {
  const { route, ui, isLoggedIn, pendingScreenId } = useAppState();
  switch (route.page) {
    case 'all':
      return <AllMenuPage openSections={ui.openMenuSections} announce={announce} />;
    case 'login':
      return <LoginPage pendingTitle={pendingScreenId ? SCREEN_BY_ID[pendingScreenId]?.depth3 : undefined} />;
    case 'screen':
      return route.screenId ? <ScreenPage screenId={route.screenId} /> : null;
    default:
      return <HomePage isLoggedIn={isLoggedIn} search={searchScreens} onOpen={openScreen} announce={announce} />;
  }
}

function Main() {
  const { ui } = useAppState();
  return <Page key={ui.pageKey} />;
}

export function mountMain(container: HTMLElement): void {
  const root = createRoot(container);
  flushSync(() => root.render(<Main />));
}
