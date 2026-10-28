/* 금액 자동 채움(fillWhen): 조건이 맞으면 정해진 금액, 조건에서 벗어나면 0 (이전 자동 금액이 계산에 남지 않게) */
import { isFilled, type FieldSpec, type FieldValues } from '../components/form/fieldSpec';

export function applyFills(fields: readonly FieldSpec[], values: FieldValues, previous: FieldValues): FieldValues {
  const next = { ...values };
  for (const field of fields) {
    if (!field.fillWhen) continue;
    if (isFilled(field, next)) next[field.id] = field.fillWhen.amount;
    else if (isFilled(field, previous)) next[field.id] = 0;
  }
  return next;
}
