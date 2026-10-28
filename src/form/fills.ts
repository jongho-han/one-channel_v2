/* 금액 자동 채움(fillWhen): 정한 값이면 그 금액, 정한 값에서 벗어나면 0 (이전 자동 금액이 계산에 남지 않게) */
import { filledAmount, type FieldSpec, type FieldValues } from '../components/form/fieldSpec';

export function applyFills(fields: readonly FieldSpec[], values: FieldValues, previous: FieldValues): FieldValues {
  const next = { ...values };
  for (const field of fields) {
    const amount = filledAmount(field, next);
    if (amount !== undefined) next[field.id] = amount;
    else if (filledAmount(field, previous) !== undefined) next[field.id] = 0;
  }
  return next;
}
