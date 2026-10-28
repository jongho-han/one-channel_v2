/* 보험계약대출 상환/이자납입(LN-04) 계산: 경과 이자 다음에 연체 이자, 출금 금액 = 상환 원금 + 경과 이자 + 연체 이자 */
import { STEP_FLOWS } from '../../../../src/screens/stepFlows';

const calc = STEP_FLOWS['LN-04'].calc!;
const labels = (rows: readonly (readonly unknown[])[]) => rows.map(row => row[0]);

test('계산 항목: 대출 잔액 · 경과 이자 · 연체 이자 · 상환 원금 · 출금 금액 · 상환 후 잔액', () => {
  expect(labels(calc({ kind: '일부 상환', amt: 500000 }))).toEqual(['대출 잔액', '경과 이자', '연체 이자', '상환 원금', '출금 금액', '상환 후 잔액']);
});

test('출금 금액에 연체 이자 포함', () => {
  const rows = calc({ kind: '전액 상환' });
  const won = (label: string) => Number(String(rows.find(row => row[0] === label)?.[1]).replace(/[^\d]/g, ''));
  expect(won('출금 금액')).toBe(won('상환 원금') + won('경과 이자') + won('연체 이자'));
  expect(rows.find(row => row[0] === '출금 금액')?.[2]).toBe(true);
});
