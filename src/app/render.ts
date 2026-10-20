import { redrawMain, saveScreenInputs } from '../pages/screen';
import { state } from '../state/store';

/** 화면 설정(큰글씨)만 바꿔 다시 그림: 입력 중인 값은 유지 */
export function refresh(): void {
  saveScreenInputs();
  render();
}

/** 셸 + 본문(#main) 다시 그리기 — 본문은 현재 route 의 페이지를 새로 마운트 */
export function render(): void {
  state.ui.mega = null;   // 화면을 다시 그리면 메가메뉴는 닫힘
  redrawMain();
}
