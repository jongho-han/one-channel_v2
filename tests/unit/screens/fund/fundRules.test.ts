/* 펀드변경·적합성진단 규칙 */
import {
  gradeLabel, hasFundChange, investableRange, portfolioGrade, requiredProfileFor, riskSummary, scoreToProfile, suitabilityCheck, totalLabel, type Fund,
} from '../../../../src/screens/fund/fundRules';

const FUNDS: Fund[] = [
  ['글로벌주식형', 40, '+14.2%', '4등급(보통위험)'], ['국내채권형', 30, '+3.1%', '5등급(낮은위험)'], ['국내주식인덱스형', 20, '+8.4%', '3등급(다소높은위험)'],
  ['단기채권형(MMF)', 10, '+2.9%', '6등급(매우낮은위험)'], ['미국S&P500인덱스형', 0, '+19.6%', '3등급(다소높은위험)'],
];

describe('fundRules', () => {
  test('포트폴리오 위험등급: 편입비율 가중평균(반올림)', () => {
    expect(portfolioGrade(FUNDS, [30, 30, 20, 10, 10])).toEqual({ average: 4.2, grade: 4 });
    expect(portfolioGrade(FUNDS, [0, 0, 0, 0, 100]).grade).toBe(3);
  });

  test('필요 투자성향·등급 이름·투자 가능 범위', () => {
    expect(requiredProfileFor(4).name).toBe('위험중립형');
    expect(requiredProfileFor(3).name).toBe('적극투자형');
    expect(gradeLabel(4)).toBe('4등급(보통위험)');
    expect(investableRange('위험중립형')).toBe('4등급(보통위험)까지');
  });

  test('진단 점수 → 투자성향', () => {
    expect(scoreToProfile(5).name).toBe('안정형');
    expect(scoreToProfile(16).name).toBe('위험중립형');
    expect(scoreToProfile(25).name).toBe('공격투자형');
  });

  test('적합성진단 필요 사유: 3년 경과 · 투자성향 초과', () => {
    const recent = { profile: '위험중립형', diagnosedAt: '2025.01.01' };
    expect(suitabilityCheck(FUNDS, [30, 30, 20, 10, 10], recent, '2026.10.02').reasons).toEqual([]);
    const reasons = suitabilityCheck(FUNDS, [0, 0, 0, 0, 100], { profile: '위험중립형', diagnosedAt: '2023.08.14' }, '2026.10.02').reasons;
    expect(reasons).toEqual([
      '마지막 적합성진단(2023.08.14) 후 3년이 지났습니다.',
      '변경 후 편입비율의 위험이 3등급(다소높은위험)으로, 현재 투자성향 위험중립형의 투자 가능 범위인 4등급(보통위험)까지를 넘습니다.',
    ]);
  });

  test('변경 여부: 비율 또는 자동재배분', () => {
    expect(hasFundChange(FUNDS, [40, 30, 20, 10, 0], false)).toBe(false);
    expect(hasFundChange(FUNDS, [40, 30, 20, 10, 0], true)).toBe(true);
    expect(hasFundChange(FUNDS, [30, 30, 20, 10, 10], false)).toBe(true);
  });

  test('합계 표시·위험 안내', () => {
    expect(totalLabel(100)).toEqual({ text: '100%', valid: true });
    expect(totalLabel(90)).toEqual({ text: '90% (100%로 맞춰 주세요)', valid: false });
    expect(riskSummary(FUNDS, [30, 30, 20, 10, 10], '위험중립형')).toEqual({ grade: 4, average: '4.2', fits: true });
    expect(riskSummary(FUNDS, [0, 0, 0, 0, 100], '위험중립형')?.fits).toBe(false);
    expect(riskSummary(FUNDS, [30, 30, 20, 10, 0], '위험중립형')).toBeNull();
  });
});
