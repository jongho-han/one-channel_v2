/* 상태 ================================================================== */
export type Page = 'home' | 'all' | 'login' | 'screen';

export interface Route {
  page: Page;
  screenId: string | null;
}

/** 열린 메가메뉴: 1Depth 그룹과 선택한 2Depth 순번 */
export interface MegaMenu {
  group: string;
  index: number;
}

/* 업무 화면 진행 상태는 화면유형마다 모양이 달라 느슨하게 둠 (각 화면 모듈이 자기 타입으로 좁혀 사용) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FlowState = Record<string, any> | null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ListState = Record<string, any>;

export interface ScreenState {
  flow: FlowState;   // T3·T4·T5: { step, pick, values, agreed, receiptNo }
  list: ListState;   // T2: { period, filters, selectedRow, contractTab }
}

export function freshScreenState(): ScreenState {
  return { flow: null, list: {} };
}

export const state = {
  route: { page: 'home', screenId: null } as Route,
  history: [] as Route[],
  isLoggedIn: false,
  pendingScreenId: null as string | null,   // 로그인 후 이어서 열 화면
  ui: {
    largeText: false,                        // 큰글씨모드
    openMenuSections: new Set<string>(),     // 전체메뉴에서 펼친 2Depth
    mega: null as MegaMenu | null,           // 헤더 메가메뉴
    pageKey: 0,                              // 본문(#main)을 새로 그릴 때마다 증가 — React 가 페이지를 다시 마운트
  },
  screen: freshScreenState(),                // 지금 보고 있는 업무 화면의 진행 상태
  variableNo: null as string | null,         // 변액보험 조회·펀드변경에서 고른 변액 계약 (화면을 옮겨도 유지)
};

export type AppState = typeof state;

/* 구독 — React 셸은 useSyncExternalStore 로 버전 변화를 받아 다시 그림 */
type Listener = () => void;
const listeners = new Set<Listener>();
let version = 0;

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export const getVersion = (): number => version;

/** 상태를 바꾼 뒤 호출: 구독자(React 셸)에게 알림 */
export function notify(): void {
  version++;
  listeners.forEach(listener => listener());
}

/* 업무 화면 진행 상태 갱신 — React 컴포넌트는 넘겨받은 상태를 직접 고치지 않고 이 함수로 반영 */
export function updateScreenFlow(patch: Record<string, unknown>): void {
  if (state.screen.flow) Object.assign(state.screen.flow, patch);
}

export function updateScreenValues(patch: Record<string, unknown>): void {
  if (state.screen.flow) Object.assign(state.screen.flow.values ??= {}, patch);
}

export function updateScreenList(patch: Record<string, unknown>): void {
  Object.assign(state.screen.list, patch);
}
