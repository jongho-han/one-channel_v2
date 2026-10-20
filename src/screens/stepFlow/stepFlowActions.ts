/* T3 단계 이동 (#next · 인증 완료 · data-action="step-prev") */
import { $, focusElement, scrollToTop } from '../../core/dom.js';
import { rerenderScreen } from '../../pages/screen';
import { state, updateScreenFlow } from '../../state/store';

/** 단계를 옮긴 뒤 초점을 '현재 단계'로 옮겨 화면낭독기가 새 단계를 읽게 함 */
export function showNextStep(): void {
  rerenderScreen();
  scrollToTop();
  focusElement($('#currentStep') || $('#main h1'));
}

export function goToStep(delta: number): void {
  const flow = state.screen.flow;
  if (!flow) return;
  updateScreenFlow({ step: Number(flow.step) + delta });
  showNextStep();
}
