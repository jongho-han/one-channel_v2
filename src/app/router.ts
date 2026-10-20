import { $, focusElement, scrollToTop } from '../core/dom';
import { MENU_GROUPS, SCREEN_BY_ID } from '../data/menu';
import { stepsOf } from '../screens/stepFlow/stepRules';
import { STEP_FLOWS } from '../screens/stepFlows';
import { freshScreenState, state, type Page } from '../state/store';
import { render } from './render';

/* 라우터 ================================================================ */
export function navigate(page: Page, screenId: string | null = null): void {
  state.history.push(state.route);
  state.route = { page, screenId };
  if (page === 'screen') state.screen = freshScreenState();
  showNewPage();
}

export function goBack(): void {
  const previous = state.history.pop();
  if (!previous) return navigate('home');
  state.route = previous;
  if (state.route.page === 'screen') state.screen = freshScreenState();
  showNewPage();
}

/** 새 화면을 그린 뒤 맨 위로 올리고 초점을 화면 제목(h1)으로 옮김 (KWCAG 9번 초점 이동) */
export function showNewPage(): void {
  render();
  scrollToTop();
  focusElement($('#main h1') || $('#main'));
}

/** 문서 제목: 「화면 이름 (진행 단계) | 1Depth | 서비스명」 (KWCAG 15번 제목 제공) */
export function documentTitle(): string {
  const service = 'iM라이프 사이버창구';
  const { page, screenId } = state.route;
  if (page === 'home')  return service;
  if (page === 'all')   return `전체메뉴 | ${service}`;
  if (page === 'login') return `로그인 | ${service}`;

  const screen = SCREEN_BY_ID[screenId ?? ''];
  const flow = state.screen.flow;
  const steps = screen.screenType === 'T3' ? stepsOf(STEP_FLOWS[screen.id]) : null;
  const step = steps && flow ? ` (${flow.step + 1}/${steps.length} ${steps[flow.step]})` : '';
  return `${screen.depth3}${step} | ${MENU_GROUPS[screen.depth1].label} | ${service}`;
}

/** 업무 화면 열기: 로그인이 필요한 화면이면 로그인 화면을 먼저 보여줌 */
export function openScreen(screenId: string): void {
  const screen = SCREEN_BY_ID[screenId];
  if (!screen) return;
  if (screen.authLevel !== 'A0' && !state.isLoggedIn) {
    state.pendingScreenId = screenId;
    return navigate('login');
  }
  navigate('screen', screenId);
}

/** 햄버거 버튼: 전체메뉴가 열려 있으면 닫고 이전 화면으로 */
export function toggleAllMenu(): void {
  if (state.route.page === 'all') goBack();
  else navigate('all');
}
