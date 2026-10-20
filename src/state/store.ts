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

/* 업무 화면 진행 상태는 아직 JS 템플릿이 다루므로 느슨하게 둠 (화면 전환 시 타입 구체화) */
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
