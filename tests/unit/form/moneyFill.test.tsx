/* 금액 자동 채움(fillWhen): 다른 항목이 정한 값이면 금액칸에 정해진 금액을 넣고 고정 — 대출 전액 상환 시 현재 잔액 */
import { render, screen } from '@testing-library/react';
import { Field } from '../../../src/components/form/Field';
import type { FieldSpec } from '../../../src/components/form/fieldSpec';
import { STEP_FLOWS } from '../../../src/screens/stepFlows';

const FIELD: FieldSpec = { id: 'amt', label: '상환 금액', type: 'money', max: 3000000, quick: [100000, 'max'], optional: true,
  fillWhen: { field: 'kind', value: '전액 상환', amount: 3000000 } };

test('전액 상환이면 금액칸에 잔액이 채워지고 고정(빠른 금액 버튼도 막힘), 다른 구분이면 비우고 입력 가능', () => {
  const { rerender } = render(<Field field={FIELD} values={{ kind: '전액 상환' }} />);
  const input = () => screen.getByLabelText(/상환 금액/) as HTMLInputElement;
  expect(input().value).toBe('3,000,000');
  expect(input().readOnly).toBe(true);
  expect(screen.getAllByRole('button').every(button => (button as HTMLButtonElement).disabled)).toBe(true);
  rerender(<Field field={FIELD} values={{ kind: '일부 상환', amt: 3000000 }} />);
  expect(input().value).toBe('');
  expect(input().readOnly).toBe(false);
  expect(screen.getAllByRole('button').some(button => (button as HTMLButtonElement).disabled)).toBe(false);
});

test('보험계약대출 상환(LN-04): 전액 상환이면 상환 금액에 현재 잔액', () => {
  const amt = STEP_FLOWS['LN-04'].fields.find(field => field.id === 'amt');
  expect(amt?.fillWhen).toEqual({ field: 'kind', value: '전액 상환', amount: 3000000 });
});

test('applyFills: 조건이 맞으면 정해진 금액, 조건에서 벗어나면 0으로 (이전 자동 금액이 계산에 남지 않게)', async () => {
  const { applyFills } = await import('../../../src/form/fills');
  expect(applyFills([FIELD], { kind: '전액 상환', amt: 0 }, {})).toEqual({ kind: '전액 상환', amt: 3000000 });
  expect(applyFills([FIELD], { kind: '일부 상환', amt: 3000000 }, { kind: '전액 상환', amt: 3000000 })).toEqual({ kind: '일부 상환', amt: 0 });
  expect(applyFills([FIELD], { kind: '일부 상환', amt: 500000 }, { kind: '일부 상환', amt: 0 })).toEqual({ kind: '일부 상환', amt: 500000 });
});
