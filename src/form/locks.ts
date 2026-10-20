/* 고정 규칙: 한 항목의 선택에 따라 다른 라디오 항목 값을 고정 (예: 연금유형 → 확정기간 해당없음) */
import type { FieldSpec, FieldValues } from '../components/form/fieldSpec';

export const NOT_APPLICABLE = '해당없음';

/** 항목 id → [고정값, 사유] */
export type Locks = Record<string, readonly [value: string, reason: string]>;
export type LockRules = (values: FieldValues) => Locks;

/** 고정 항목은 고정값으로, 풀린 항목이 '해당없음'이면 첫 선택지로 바꾼 값과 고정 목록 */
export function applyLocks(fields: readonly FieldSpec[], values: FieldValues, lockRules?: LockRules): { values: FieldValues; locks: Locks } {
  if (!lockRules) return { values, locks: {} };
  const locks = lockRules(values);
  const next = { ...values };
  for (const field of fields) {
    if (field.type !== 'radio') continue;
    const lock = locks[field.id];
    if (lock) next[field.id] = lock[0];
    else if (next[field.id] === NOT_APPLICABLE) next[field.id] = field.options?.[0];
  }
  return { values: next, locks: lockRules(next) };
}

/** 고정 상태가 바뀐 항목 안내 문구: '확정기간 다시 선택 가능', '체증형태 「정액형」 고정' */
export function lockChanges(fields: readonly FieldSpec[], before: Locks, after: Locks): string[] {
  return fields.filter(field => Boolean(before[field.id]) !== Boolean(after[field.id]))
    .map(field => (after[field.id] ? `${field.label} 「${after[field.id][0]}」 고정` : `${field.label} 다시 선택 가능`));
}
