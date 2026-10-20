/* 펀드변경(CH-01) 단계 진행: 변경하기 → (진단 필요 안내) → 적합성진단 → 결과 → 변경 전후 비교 → 인증
   단계는 진행 상태(flow.phase)에 두고 화면을 다시 그림 — 버튼은 data-action (controller/actions.js) */
import { FundBlockedDialog, SuitabilityRequiredDialog } from '../../components/modal/FundDialogs';
import { APP } from '../../core/config';
import { $, focusElement, scrollToTop } from '../../core/dom';
import { nextDay } from '../../core/format';
import { SUITABILITY, SUITABILITY_QUESTIONS } from '../../data/fundRepository';
import { activeFunds } from '../../features/variableContract';
import { rerenderScreen } from '../../pages/screen';
import { state } from '../../state/store';
import { openModal } from '../../ui/modal';
import { announce, toast } from '../../ui/overlay';
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
    openModal(<FundBlockedDialog profile={SUITABILITY.profile} grade={gradeLabel(check.grade)} nextDay={nextDay(APP.today)} />);
    return;
  }
  openModal(<SuitabilityRequiredDialog reasons={check.reasons} />);
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
