/* 변액 계약 누적 수익률 */
import { cumulativeReturn } from '../../src/features/variableContract';

test('cumulativeReturn: 적립금 ÷ 납입 원금 − 1, 소수 둘째 자리, 이익이면 +', () => {
  expect(cumulativeReturn(10_800_000, 10_000_000)).toBe('+8.00%');
  expect(cumulativeReturn(9_500_000, 10_000_000)).toBe('-5.00%');
  expect(cumulativeReturn(23_710_400, 22_016_000)).toBe('+7.70%');
});
