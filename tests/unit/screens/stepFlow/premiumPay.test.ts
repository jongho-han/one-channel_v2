/* 보험료 납입 관리(PM-01): 여러 계약을 함께 납입 — 고른 계약 보험료 합계로 계산 */
import { CONTRACTS } from '../../../../src/data/customerRepository';
import { STEP_FLOWS } from '../../../../src/screens/stepFlows';

const config = STEP_FLOWS['PM-01'];

test('계약 선택은 여러 개 고르기', () => {
  expect(config.pick?.multiple).toBe(true);
});

test('납입 보험료 = 고른 계약 보험료 합계 × 회차, 선납 할인도 합계 기준', () => {
  const [a, b] = CONTRACTS.filter(contract => contract.status === '정상');
  const sum = a.premium + b.premium;
  const won = (n: number) => `${n.toLocaleString()}원`;
  expect(config.calc?.({ cnt: '이번 회차(10월분)' }, `${a.no},${b.no}`)).toEqual([['납입 보험료', won(sum)], ['선납 할인', '0원'], ['납입할 금액', won(sum), true]]);
  const discount = Math.round(sum * 1 * 0.004);
  expect(config.calc?.({ cnt: '2개월 선납' }, `${a.no},${b.no}`)).toEqual([['납입 보험료', won(sum * 2)], ['선납 할인', won(discount)], ['납입할 금액', won(sum * 2 - discount), true]]);
});
