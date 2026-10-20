import { render, screen, within } from '@testing-library/react';
import { Dashboard } from '../../../src/screens/dashboard/Dashboard';
import type { Contract } from '../../../src/screens/dashboard/contractSummary';

const CONTRACTS: Contract[] = [
  { no: '2018-0012345', name: '종신보험', kind: '종신', status: '정상', insured: '홍길동',
    premium: 128400, paidCount: 99, totalCount: 240, surrender: 9842000, loan: 3000000, loanLimit: 5890000 },
  { no: '2020-0456789', name: '변액연금', kind: '변액연금', status: '납입유예', insured: '홍서연', insuredRelation: '자녀',
    premium: 300000, paidCount: 1, totalCount: '갱신형', surrender: 0, loan: 0, loanLimit: 0, isVariable: true },
];

describe('Dashboard', () => {
  test('요약 타일과 기준일 안내', () => {
    const { container } = render(<Dashboard contracts={CONTRACTS} today="2026.10.02" />);
    const tiles = [...container.querySelectorAll('.tiles .tile')].map(tile => tile.textContent);
    expect(tiles).toEqual(['보유계약2건', '월 보험료 합계128,400원', '예상 해지환급금 합계9,842,000원', '보험계약대출 잔액3,000,000원']);
    expect(screen.getByText(/2026\.10\.02 기준 예시 금액/)).toBeTruthy();
  });

  test('계약 카드: 피보험자·상태·금액·납입 진행·바로가기', () => {
    render(<Dashboard contracts={CONTRACTS} today="2026.10.02" />);
    const [first, second] = screen.getAllByRole('article');

    expect(within(first).getByText(/증권번호 2018-0012345 · 피보험자 홍길동/)).toBeTruthy();
    expect(within(first).getByText('정상').className).toBe('st g');
    expect(within(first).getByText('3,000,000원')).toBeTruthy();
    expect(within(first).getByText('납입 99/240회')).toBeTruthy();
    expect(first.querySelector<HTMLElement>('.bar i')?.style.width).toBe('41%');
    expect(within(first).getByRole('button', { name: '대출 가능 289만원' }).dataset).toMatchObject({ action: 'open', id: 'LN-02' });

    expect(within(second).getByText('타인 피보험자')).toBeTruthy();
    expect(within(second).getByText(/피보험자 홍서연\(자녀\)/)).toBeTruthy();
    expect(within(second).getByText('없음')).toBeTruthy();
    expect(within(second).getByText('-')).toBeTruthy();
    expect(within(second).getByText(/갱신형 · 다음 갱신/)).toBeTruthy();
    expect(within(second).getByText(/납입유예 중입니다/)).toBeTruthy();
    expect(within(second).getByRole('button', { name: '펀드 수익률' }).dataset.variable).toBe('2020-0456789');
  });
});
