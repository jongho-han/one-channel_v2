/* 변액보험 펀드변경 (CH-01) + 적합성진단 규칙 — 화면과 분리한 순수 로직
   변경하기 → 진단 필요 판단
     조건1) 마지막 적합성진단 후 3년 경과   조건2) 변경 후 포트폴리오 위험이 현재 투자성향 범위를 넘음
   → 둘 다 아니면 바로 비교·인증 / 하나라도 맞으면 안내 후 적합성진단
   → 진단 결과로 변경 가능하면 인증 후 변경, 불가하면 불가 안내(익일 재진행) */
import { parseYmd } from '../../core/format';
import { FUND_GRADE_NAMES, INVEST_PROFILES, type Fund, type InvestProfile } from '../../data/fundRepository';

export type { Fund };

export interface Suitability {
  profile: string;
  diagnosedAt: string;   // YYYY.MM.DD
}

const PROFILES = INVEST_PROFILES;
const GRADE_NAMES = FUND_GRADE_NAMES;

/** '4등급(보통위험)' → 4 */
export const fundGradeOf = (risk: string): number => Number(/\d/.exec(risk)?.[0]);
export const profileByName = (name: string): InvestProfile => PROFILES.find(profile => profile.name === name) ?? PROFILES[0];
export const gradeLabel = (grade: number): string => `${grade}등급(${GRADE_NAMES[grade]})`;
export const investableRange = (profileName: string): string => `${gradeLabel(profileByName(profileName).minGrade)}까지`;

/** 이 위험등급에 투자하려면 필요한 최소 투자성향 */
export const requiredProfileFor = (grade: number): InvestProfile => PROFILES.find(profile => grade >= profile.minGrade) ?? PROFILES[PROFILES.length - 1];

export const scoreToProfile = (score: number): InvestProfile => PROFILES.find(profile => score <= profile.maxScore) ?? PROFILES[PROFILES.length - 1];

const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);

/** 편입비율 가중평균 위험등급 (반올림) */
export function portfolioGrade(funds: readonly Fund[], ratios: readonly number[]): { average: number; grade: number } {
  const total = sum(ratios) || 1;
  const average = funds.reduce((acc, fund, index) => acc + fundGradeOf(fund[3]) * ratios[index], 0) / total;
  return { average, grade: Math.round(average) };
}

export const canInvest = (grade: number, profileName: string): boolean => requiredProfileFor(grade).level <= profileByName(profileName).level;

/** 적합성진단이 필요한 사유 (없으면 바로 변경 가능) */
export function suitabilityCheck(funds: readonly Fund[], ratios: readonly number[], suitability: Suitability, today: string) {
  const expiry = parseYmd(suitability.diagnosedAt);
  expiry.setFullYear(expiry.getFullYear() + 3);
  const { grade } = portfolioGrade(funds, ratios);
  const reasons: string[] = [];
  if (parseYmd(today) >= expiry) reasons.push(`마지막 적합성진단(${suitability.diagnosedAt}) 후 3년이 지났습니다.`);
  if (!canInvest(grade, suitability.profile)) {
    reasons.push(`변경 후 편입비율의 위험이 ${gradeLabel(grade)}으로, 현재 투자성향 ${suitability.profile}의 투자 가능 범위인 ${investableRange(suitability.profile)}를 넘습니다.`);
  }
  return { grade, reasons };
}

/** 비율이나 자동재배분이 바뀌었는지 (현재 자동재배분: 미신청) */
export const REBALANCE_BEFORE = false;
export const hasFundChange = (funds: readonly Fund[], after: readonly number[], rebalance: boolean): boolean =>
  funds.some(([, before], index) => before !== after[index]) || rebalance !== REBALANCE_BEFORE;

/** 합계 표시 — 색에만 의존하지 않도록 글자로도 안내 */
export const totalLabel = (total: number) => ({ text: total === 100 ? '100%' : `${total}% (100%로 맞춰 주세요)`, valid: total === 100 });
export const ratioTotal = sum;

/** 변경 후 포트폴리오 위험 (합계가 100%일 때만) */
export function riskSummary(funds: readonly Fund[], ratios: readonly number[], profileName: string) {
  if (sum(ratios) !== 100) return null;
  const { average, grade } = portfolioGrade(funds, ratios);
  return { grade, average: average.toFixed(1), fits: canInvest(grade, profileName) };
}
