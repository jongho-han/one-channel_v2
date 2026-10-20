/* 펀드변경(CH-01) 단계 진행: 변경하기 → (진단 필요 안내) → 적합성진단 → 결과 → 변경 전후 비교 → 인증
   단계는 진행 상태(flow.phase)에 두고 화면을 다시 그림 — 버튼은 data-action (controller/actions.js) */
import { APP } from '../../core/config';
import { $, focusElement, scrollToTop } from '../../core/dom.js';
import { nextDay } from '../../core/format';
import { SUITABILITY, SUITABILITY_QUESTIONS } from '../../data/fundRepository';
import { activeFunds } from '../../features/variableContract';
import { rerenderScreen } from '../../pages/screen.js';
import { state } from '../../state/store';
import { announce, openModal, toast } from '../../ui/overlay.js';
import { infoBoxHtml } from '../../ui/infoBoxHtml';
import { canInvest, gradeLabel, hasFundChange, portfolioGrade, scoreToProfile, suitabilityCheck, type Fund } from './fundRules';
import type { SuitabilityResultData } from './FundViews';

export type FundPhase = 'edit' | 'diagnose' | 'result' | 'compare';

export interface FundFlow {
  step: number;
  phase?: FundPhase;
  fundRatios?: number[] | null;              // 변경 후 비율 (입력 전이면 현재 비율)
  rebalance?: boolean;
  suitAnswers?: Record<number, number>;      // 문항 → 보기 순번
  suitMissing?: number[];                    // 제출 시 답하지 않은 문항
  result?: SuitabilityResultData;
}

const funds = (): readonly Fund[] => activeFunds();
const questions = () => SUITABILITY_QUESTIONS;

export const currentFundRatios = (flow: FundFlow): number[] => funds().map(([, ratio], index) => flow.fundRatios?.[index] ?? ratio);

export function showFundPhase(phase: FundPhase): void {
  (state.screen.flow as FundFlow).phase = phase;
  rerenderScreen();
  scrollToTop();
  focusElement($('#phaseTitle') || $('#main h1'));
}

/** 변경하기: 진단이 필요한지 판단 */
export function submitFundChange(flow: FundFlow): void {
  const ratios = currentFundRatios(flow);
  if (!hasFundChange(funds(), ratios, Boolean(flow.rebalance))) return toast('변경된 내용이 없습니다. 변경 후 비율이나 자동재배분을 바꿔 주세요.');
  const check = suitabilityCheck(funds(), ratios, SUITABILITY, APP.today);
  if (!check.reasons.length) return showFundPhase('compare');

  if (SUITABILITY.failedOn === APP.today) {
    openModal(`
      <h2>오늘은 적합성진단을 다시 할 수 없습니다</h2>
      <p>오늘 진행한 적합성진단 결과(${SUITABILITY.profile})로는 변경 후 편입비율(${gradeLabel(check.grade)})에 투자할 수 없습니다.</p>
      ${infoBoxHtml('warn', 'alert', `${nextDay(APP.today)}(익일) 이후 적합성진단을 다시 진행해 주세요. 투자성향 범위 안으로 비율을 조정하면 바로 변경할 수 있습니다.`)}
      <button class="btn pri block mt-16" data-action="close-modal">확인</button>`);
    return;
  }

  openModal(`
    <h2>적합성진단이 필요합니다</h2>
    <p>아래 사유로 펀드를 변경하기 전에 투자자 적합성진단을 먼저 진행합니다.</p>
    <ul class="reason-list">${check.reasons.map(reason => `<li>${reason}</li>`).join('')}</ul>
    <div class="navrow inline mt-16">
      <button class="btn lg" data-action="close-modal">취소</button>
      <button class="btn pri lg" data-action="suit-start">적합성진단 시작</button>
    </div>`);
}

/** 적합성진단 시작: 답 초기화 */
export function startSuitability(flow: FundFlow): void {
  flow.suitAnswers = {};
  flow.suitMissing = [];
  showFundPhase('diagnose');
}

/** 적합성진단 제출: 모든 문항 확인 → 투자성향 산정 → 변경 가능 여부 판단 */
export function submitSuitability(): void {
  const flow = state.screen.flow as FundFlow;
  const answers = flow.suitAnswers ?? {};
  const missing = questions().map((_, index) => index).filter(index => answers[index] === undefined);
  flow.suitMissing = missing;
  if (missing.length) {
    rerenderScreen();
    announce(`${missing.length}개 문항에 답하지 않았습니다.`);
    focusElement($(`#sq${missing[0]} input`));
    return;
  }
  const score = questions().reduce((total, [, options], index) => total + options[answers[index]][1], 0);
  const profile = scoreToProfile(score);
  const { grade } = portfolioGrade(funds(), currentFundRatios(flow));
  const ok = canInvest(grade, profile.name);
  Object.assign(SUITABILITY, { profile: profile.name, diagnosedAt: APP.today, failedOn: ok ? null : APP.today });
  flow.result = { ok, profile: profile.name, score, grade };
  showFundPhase('result');
}
