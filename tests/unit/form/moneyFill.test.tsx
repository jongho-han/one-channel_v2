/* 금액 자동 채움(fillWhen): 다른 항목 값마다 정한 금액을 금액칸에 넣고 고정 — 대출 전액 상환은 현재 잔액, 이자만 납입은 0원 */
import { render, screen } from '@testing-library/react';
import { Field } from '../../../src/components/form/Field';
import type { FieldSpec } from '../../../src/components/form/fieldSpec';
import { applyFills } from '../../../src/form/fills';
import { STEP_FLOWS } from '../../../src/screens/stepFlows';

const FIELD: FieldSpec = { id: 'amt', label: '상환 금액', type: 'money', max: 3000000, quick: [100000, 'max'], optional: true,
  fillWhen: { field: 'kind', amounts: { '전액 상환': 3000000, '이자만 납입': 0 } } };
const input = () => screen.getByLabelText(/상환 금액/) as HTMLInputElement;
const quickDisabled = () => screen.getAllByRole('button').map(button => (button as HTMLButtonElement).disabled);

test('전액 상환이면 잔액, 이자만 납입이면 0원으로 채우고 고정(빠른 금액 버튼도 막힘), 일부 상환이면 비우고 입력 가능', () => {
  const { rerender } = render(<Field field={FIELD} values={{ kind: '전액 상환' }} />);
  expect([input().value, input().readOnly]).toEqual(['3,000,000', true]);
  expect(quickDisabled()).toEqual([true, true]);
  rerender(<Field field={FIELD} values={{ kind: '이자만 납입', amt: 3000000 }} />);
  expect([input().value, input().readOnly]).toEqual(['0', true]);
  expect(quickDisabled()).toEqual([true, true]);
  rerender(<Field field={FIELD} values={{ kind: '일부 상환', amt: 0 }} />);
  expect([input().value, input().readOnly]).toEqual(['', false]);
  expect(quickDisabled()).toEqual([false, false]);
});

test('applyFills: 정한 값이면 그 금액, 정한 값에서 벗어나면 0 (이전 자동 금액이 계산에 남지 않게)', () => {
  expect(applyFills([FIELD], { kind: '전액 상환', amt: 0 }, {})).toEqual({ kind: '전액 상환', amt: 3000000 });
  expect(applyFills([FIELD], { kind: '이자만 납입', amt: 3000000 }, { kind: '전액 상환', amt: 3000000 })).toEqual({ kind: '이자만 납입', amt: 0 });
  expect(applyFills([FIELD], { kind: '일부 상환', amt: 3000000 }, { kind: '전액 상환', amt: 3000000 })).toEqual({ kind: '일부 상환', amt: 0 });
  expect(applyFills([FIELD], { kind: '일부 상환', amt: 500000 }, { kind: '일부 상환', amt: 0 })).toEqual({ kind: '일부 상환', amt: 500000 });
});

test('보험계약대출 상환(LN-04): 전액 상환은 현재 잔액, 이자만 납입은 0원', () => {
  const amt = STEP_FLOWS['LN-04'].fieldsFor?.({}, 'l1').find(field => field.id === 'amt');
  expect(amt?.fillWhen).toEqual({ field: 'kind', amounts: { '전액 상환': 3000000, '이자만 납입': 0 } });
});
