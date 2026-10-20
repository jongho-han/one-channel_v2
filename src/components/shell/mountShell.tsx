import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { USER } from '../../data/customerRepository';
import { SCREEN_BY_ID } from '../../data/menu';
import { notify, state } from '../../state/store';
import { AppBar } from './AppBar';
import { Header } from './Header';
import { TabBar } from './TabBar';
import { useAppState } from './useAppState';

function ConnectedHeader() {
  const { route, ui, isLoggedIn } = useAppState();
  const currentGroup = route.page === 'screen' && route.screenId ? SCREEN_BY_ID[route.screenId].depth1 : '';
  return <Header currentGroup={currentGroup} isAllMenuOpen={route.page === 'all'} largeText={ui.largeText}
                 isLoggedIn={isLoggedIn} userName={USER.name} mega={ui.mega} />;
}

const APPBAR_TITLES: Record<string, string> = { all: '전체메뉴', login: '로그인' };

function ConnectedAppBar() {
  const { route, ui, isLoggedIn } = useAppState();
  const title = route.page === 'screen' && route.screenId ? SCREEN_BY_ID[route.screenId].depth3 : APPBAR_TITLES[route.page] ?? '';
  return <AppBar page={route.page} title={title} largeText={ui.largeText} isLoggedIn={isLoggedIn} />;
}

function ConnectedTabBar() {
  return <TabBar route={useAppState().route} />;
}

interface ShellContainers {
  header: HTMLElement;
  appBar: HTMLElement;
  tabBar: HTMLElement;
}

/** 공통 셸(헤더·앱바·탭바)을 React 루트로 한 번 마운트 */
export function mountShell({ header, appBar, tabBar }: ShellContainers): void {
  flushSync(() => {
    createRoot(header).render(<ConnectedHeader />);
    createRoot(appBar).render(<ConnectedAppBar />);
    createRoot(tabBar).render(<ConnectedTabBar />);
  });
}

/** 상태가 바뀐 뒤 셸을 즉시(동기) 다시 그림 — 이어지는 초점 이동·테스트가 바로 DOM을 봄 */
export function refreshShell(): void {
  flushSync(notify);
}

/* 메가메뉴 */
export function showMegaMenu(group: string, index = 0): void {
  state.ui.mega = { group, index };
  refreshShell();
}

export function hideMegaMenu(): void {
  if (!state.ui.mega) return;
  state.ui.mega = null;
  refreshShell();
}
