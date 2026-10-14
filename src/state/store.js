/* 상태 ================================================================== */
export const state = {
  route: { page: 'home', screenId: null },   // page: home · all · login · screen
  history: [],
  isLoggedIn: false,
  pendingScreenId: null,                     // 로그인 후 이어서 열 화면
  ui: {
    largeText: false,                        // 큰글씨모드
    openMenuSections: new Set(),             // 전체메뉴에서 펼친 2Depth
  },
  screen: freshScreenState(),                // 지금 보고 있는 업무 화면의 진행 상태
  variableNo: null,                          // 변액보험 조회·펀드변경에서 고른 변액 계약 (화면을 옮겨도 유지)
};

export function freshScreenState() {
  return {
    flow: null,   // T3·T4·T5: { step, pick, values, agreed, receiptNo }
    list: {},     // T2: { period, filters, selectedRow, contractTab }
  };
}
