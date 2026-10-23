/* 보험료 납입 상태: 마지막 납입이 덮는 기간(월납 1개월·선납 N개월·연납 12개월)을 오늘이 넘기면 연체 */
import { paidUntil, payStatus, payStatusNote } from '../../src/features/payStatus';

test('paidUntil: 마지막 납입일 + 덮는 개월 수 (말일 보정)', () => {
  expect(paidUntil({ date: '2026.09.25', months: 1 })).toBe('2026.10.25');
  expect(paidUntil({ date: '2026.07.25', months: 3 })).toBe('2026.10.25');
  expect(paidUntil({ date: '2025.11.20', months: 12 })).toBe('2026.11.20');
  expect(paidUntil({ date: '2026.01.31', months: 1 })).toBe('2026.02.28');
});

test('월납: 직전 납입 후 1개월 초과면 연체, 딱 1개월은 정상', () => {
  expect(payStatus({ date: '2026.09.25', months: 1 }, '2026.10.02')).toBe('정상');
  expect(payStatus({ date: '2026.09.02', months: 1 }, '2026.10.02')).toBe('정상');
  expect(payStatus({ date: '2026.09.01', months: 1 }, '2026.10.02')).toBe('연체');
  expect(payStatus({ date: '2026.08.10', months: 1 }, '2026.10.02')).toBe('연체');
});

test('선납(3·6·12개월): 선납 기간을 넘기면 연체', () => {
  expect(payStatus({ date: '2026.07.25', months: 3 }, '2026.10.02')).toBe('정상');
  expect(payStatus({ date: '2026.03.15', months: 6 }, '2026.10.02')).toBe('연체');
  expect(payStatus({ date: '2025.12.01', months: 12 }, '2026.10.02')).toBe('정상');
});

test('연납: 직전 연보험료 납입 후 12개월 초과면 연체', () => {
  expect(payStatus({ date: '2025.11.20', months: 12, cycle: '연납' }, '2026.10.02')).toBe('정상');
  expect(payStatus({ date: '2025.08.05', months: 12, cycle: '연납' }, '2026.10.02')).toBe('연체');
});

test('payStatusNote: 납입 방식과 최종 납입일', () => {
  expect(payStatusNote({ date: '2026.09.25', months: 1 })).toBe('월납 · 최종 납입 2026.09.25');
  expect(payStatusNote({ date: '2026.07.25', months: 3 })).toBe('3개월 선납 · 최종 납입 2026.07.25');
  expect(payStatusNote({ date: '2025.11.20', months: 12, cycle: '연납' })).toBe('연납 · 최종 납입 2025.11.20');
});
