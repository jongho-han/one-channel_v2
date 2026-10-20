/* 보험계약대출 배정 규칙 */
import { allocateLoan, loanCalcRows, loanTotals, type LoanContract } from '../../../../src/features/loanRules';

const CONTRACTS: LoanContract[] = [
  { no: 'A', name: '종신', loanLimit: 5890000, loan: 3000000, loanRate: 0.043 },
  { no: 'B', name: '연금', loanLimit: 11200000, loan: 0, loanRate: 0.0475 },
  { no: 'C', name: '유니버설', loanLimit: 13200000, loan: 0, loanRate: 0.0395 },
  { no: 'D', name: '실손', loanLimit: 0, loan: 0, loanRate: 0 },
];

test('이율 낮은 계약부터 가능금액만큼 배정 (대출 불가 계약 제외)', () => {
  expect(allocateLoan(CONTRACTS, 15000000).map(loan => [loan.contract.no, loan.available, loan.amount])).toEqual([
    ['C', 13200000, 13200000], ['A', 2890000, 1800000], ['B', 11200000, 0],
  ]);
});

test('합계·월 이자·평균 이율, 계산 행', () => {
  const totals = loanTotals(CONTRACTS, 15000000);
  expect(totals.amount).toBe(15000000);
  expect(totals.loans).toHaveLength(2);
  expect(totals.interest).toBe(Math.round(13200000 * 0.0395 / 12) + Math.round(1800000 * 0.043 / 12));
  expect(loanCalcRows(CONTRACTS, 15000000)).toEqual([
    ['대출 신청금액', '15,000,000원'], ['실행 계약', '2건'], ['평균 적용 이율', `연 ${(totals.averageRate * 100).toFixed(2)}%`], ['예상 월 이자', `${totals.interest.toLocaleString()}원`, true],
  ]);
  expect(loanCalcRows(CONTRACTS, 0)[2]).toEqual(['평균 적용 이율', '연 0.00%']);
});
