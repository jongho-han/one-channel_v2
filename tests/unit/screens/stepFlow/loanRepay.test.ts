/* 보험계약대출 상환/이자납입(LN-04): 시연용 연체 대출 1건 — 대출별 잔액·경과 이자·연체 이자로 계산, 전액 상환은 그 대출 잔액 */
import { STEP_FLOWS } from '../../../../src/screens/stepFlows';

const config = STEP_FLOWS['LN-04'];
const calc = config.calc!;
const won = (rows: readonly (readonly unknown[])[], label: string) => Number(String(rows.find(row => row[0] === label)?.[1]).replace(/[^\d]/g, ''));

test('상환할 대출 카드: 정상 1건 + 연체 1건(시연용), 상태 표시', () => {
  const items = config.pick?.items?.() ?? [];
  expect(items.map(item => [item.key, item.status])).toEqual([['l1', '정상'], ['l2', '연체']]);
  expect(items[1].detail).toMatch(/미납/);
});

test('계산 항목: 대출 잔액 · 경과 이자 · 연체 이자 · 상환 원금 · 출금 금액 · 상환 후 잔액', () => {
  expect(calc({ kind: '일부 상환', amt: 500000 }, 'l1').map(row => row[0])).toEqual(['대출 잔액', '경과 이자', '연체 이자', '상환 원금', '출금 금액', '상환 후 잔액']);
});

test('정상 대출은 연체 이자 0원, 연체 대출은 연체 이자가 출금 금액에 더해짐', () => {
  const normal = calc({ kind: '전액 상환' }, 'l1');
  expect(won(normal, '연체 이자')).toBe(0);
  const overdue = calc({ kind: '전액 상환' }, 'l2');
  expect(won(overdue, '대출 잔액')).toBe(1500000);
  expect(won(overdue, '연체 이자')).toBeGreaterThan(0);
  expect(won(overdue, '출금 금액')).toBe(won(overdue, '상환 원금') + won(overdue, '경과 이자') + won(overdue, '연체 이자'));
  expect(won(overdue, '상환 후 잔액')).toBe(0);
});

test('입력 항목: 고른 대출 잔액이 최대 금액·전액 상환 자동 금액', () => {
  const amt = (pick: string) => config.fieldsFor?.({}, pick).find(field => field.id === 'amt');
  expect(amt('l1')).toMatchObject({ max: 3000000, fillWhen: { field: 'kind', amounts: { '전액 상환': 3000000, '이자만 납입': 0 } } });
  expect(amt('l2')).toMatchObject({ max: 1500000, fillWhen: { field: 'kind', amounts: { '전액 상환': 1500000, '이자만 납입': 0 } } });
});
