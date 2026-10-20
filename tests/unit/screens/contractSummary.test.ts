/* T1 계약종합현황 계산 로직 */
import { contractShortcuts, paymentProgress, summarizeContracts, type Contract } from '../../../src/screens/dashboard/contractSummary';

const contract = (overrides: Partial<Contract> = {}): Contract => ({
  no: '2000-0000001', name: '테스트보험', kind: '종신', status: '정상', insured: '홍길동',
  premium: 100000, paidCount: 10, totalCount: 40, surrender: 500000, loan: 0, loanLimit: 0,
  ...overrides,
});

describe('summarizeContracts', () => {
  test('보험료는 정상 계약만, 해지환급금·대출은 전체 합계', () => {
    const summary = summarizeContracts([
      contract({ premium: 100000, surrender: 1000, loan: 300 }),
      contract({ status: '납입유예', premium: 50000, surrender: 2000, loan: 0 }),
    ]);
    expect(summary).toEqual({ count: 2, monthlyPremium: 100000, totalSurrender: 3000, totalLoan: 300 });
  });
});

describe('paymentProgress', () => {
  test('납입 회차 비율(반올림), 갱신형은 null', () => {
    expect(paymentProgress(contract({ paidCount: 99, totalCount: 240 }))).toBe(41);
    expect(paymentProgress(contract({ totalCount: '갱신형' }))).toBeNull();
  });
});

describe('contractShortcuts', () => {
  const ids = (c: Contract) => contractShortcuts(c).map(([, id]) => id);

  test('기본: 계약상세·증명서', () => {
    expect(contractShortcuts(contract())).toEqual([['계약상세', 'CT-02'], ['증명서', 'CF-02']]);
  });

  test('변액·유니버설·대출 가능·청구 가능 종목이면 버튼 추가 (순서 유지)', () => {
    expect(ids(contract({ isVariable: true }))).toEqual(['CT-02', 'CT-03', 'CF-02']);
    expect(ids(contract({ isUniversal: true }))).toEqual(['CT-02', 'PM-04', 'CF-02']);
    expect(ids(contract({ kind: '암' }))).toEqual(['CT-02', 'PY-01', 'CF-02']);
  });

  test('대출 가능 금액은 만원 단위로 표시', () => {
    expect(contractShortcuts(contract({ loanLimit: 5890000, loan: 3000000 }))[1]).toEqual(['대출 가능 289만원', 'LN-02']);
  });
});
