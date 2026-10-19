/* core/format: TS 전환 전후 동작이 같아야 함 (특성 테스트) */
import { formatClock, formatWon, maskPhone, nextDay, parseYmd, toNumber, withObjectParticle } from '../../src/core/format';

describe('format', () => {
  test('formatWon: 숫자는 천 단위 구분 + 원, 숫자가 아니면 그대로', () => {
    expect(formatWon(1234567)).toBe('1,234,567원');
    expect(formatWon('-')).toBe('-');
  });

  test('toNumber: 숫자만 남기고 없으면 0', () => {
    expect(toNumber('1,200원')).toBe(1200);
    expect(toNumber('abc')).toBe(0);
  });

  test('maskPhone: 가운데 4자리 가림', () => {
    expect(maskPhone('010-1234-5678')).toBe('010-****-5678');
  });

  test('formatClock: 초 → mm:ss', () => {
    expect(formatClock(185)).toBe('03:05');
  });

  test('parseYmd · nextDay: 월말 다음 날', () => {
    expect(parseYmd('2026.10.02').getDate()).toBe(2);
    expect(nextDay('2026.10.31')).toBe('2026.11.01');
  });

  test('withObjectParticle: 받침에 따라 을/를', () => {
    expect(withObjectParticle('계약')).toBe('계약을');
    expect(withObjectParticle('나이')).toBe('나이를');
    expect(withObjectParticle('ABC')).toBe('ABC을(를)');
  });
});
