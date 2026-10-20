/** [펀드, 편입비율, 1년 수익률, 위험등급] */
export type Fund = readonly [name: string, ratio: number, yieldRate: string, risk: string];

export interface InvestProfile {
  level: number;      // 클수록 위험 감내
  name: string;
  minGrade: number;   // 이 등급(숫자)까지 투자 가능 — 숫자가 작을수록 위험
  maxScore: number;   // 진단 점수 상한
}

/** [질문, [[보기, 점수], ...]] */
export type SuitabilityQuestion = readonly [question: string, options: readonly (readonly [text: string, score: number])[]];

/* 투자성향: level이 클수록 위험 감내 / minGrade 이상(숫자) 등급까지 투자 가능 / maxScore: 진단 점수 상한 */
export const INVEST_PROFILES: readonly InvestProfile[] = [
  { level: 1, name: '안정형',     minGrade: 6, maxScore: 8 },
  { level: 2, name: '안정추구형', minGrade: 5, maxScore: 12 },
  { level: 3, name: '위험중립형', minGrade: 4, maxScore: 16 },
  { level: 4, name: '적극투자형', minGrade: 2, maxScore: 20 },
  { level: 5, name: '공격투자형', minGrade: 1, maxScore: 99 },
];
export const FUND_GRADE_NAMES: Readonly<Record<number, string>> = { 1: '매우높은위험', 2: '높은위험', 3: '다소높은위험', 4: '보통위험', 5: '낮은위험', 6: '매우낮은위험' };
/* 고객의 현재 적합성진단 (샘플: 3년 경과 → 펀드변경 시 재진단 필요) */
export const SUITABILITY: { profile: string; diagnosedAt: string; failedOn: string | null } = { profile: '위험중립형', diagnosedAt: '2023.08.14', failedOn: null };
/* [질문, [[보기, 점수], ...]] */
export const SUITABILITY_QUESTIONS: readonly SuitabilityQuestion[] = [
  ['이 보험의 투자 기간은 얼마나 생각하시나요?', [['1년 미만', 1], ['1년 ~ 3년', 2], ['3년 ~ 5년', 3], ['5년 ~ 10년', 4], ['10년 이상', 5]]],
  ['투자해 본 경험이 있는 금융상품은 무엇인가요? (가장 위험한 것 기준)', [['예·적금만', 1], ['채권·채권형 펀드', 2], ['혼합형 펀드', 3], ['주식·주식형 펀드', 4], ['ELS·파생상품 등', 5]]],
  ['금융상품에 대한 이해 수준은 어느 정도인가요?', [['잘 모름', 1], ['예·적금 등 기본 상품 정도', 2], ['펀드·주식의 구조를 이해함', 4], ['파생상품까지 충분히 이해함', 5]]],
  ['투자 원금에서 어느 정도 손실까지 감내할 수 있나요?', [['원금 손실은 원하지 않음', 1], ['10% 이내', 2], ['20% 이내', 3], ['30% 이내', 4], ['높은 수익을 위해 큰 손실도 감수', 5]]],
  ['현재 소득 상황은 어떤가요?', [['소득이 없거나 불안정함', 1], ['일정하지만 줄어들 것 같음', 2], ['일정하고 유지될 것 같음', 3], ['일정하고 늘어날 것 같음', 5]]],
];
