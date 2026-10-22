/* 폼 값 표시·조건부 항목·처음 그려질 때의 값 */
import type { FieldSpec, FieldValues } from '../components/form/fieldSpec';
import { formatWon, toNumber } from '../core/format';
import { accountOptions } from '../data/accountRepository';

type Value = FieldValues[string];

/** 항목의 현재 값 (없으면 기본값, 라디오는 첫 선택지) */
const currentFieldValue = (field: FieldSpec, values: FieldValues): Value =>
  values[field.id] ?? field.value ?? (field.type === 'radio' ? field.options?.[0] : '');

/** 조건부 항목: showWhen { field, value } — 다른 항목 값이 맞을 때만 보이고 검증함 */
export function isFieldVisible(field: FieldSpec, fields: readonly FieldSpec[], values: FieldValues): boolean {
  if (!field.showWhen) return true;
  const source = fields.find(item => item.id === field.showWhen?.field);
  return !source || currentFieldValue(source, values) === field.showWhen.value;
}

/** 확인 단계에 보여줄 값 */
export function displayValue(field: FieldSpec, values: FieldValues): string {
  const value = values[field.id];
  if (field.type === 'money') return value ? formatWon(Number(value)) : '-';
  if (field.type === 'addr') return `(${values[`${field.id}_zip`]}) ${values[field.id]} ${values[`${field.id}_d`] || ''}`;
  if (Array.isArray(value)) return value.length ? value.join(', ') : '-';
  return String(value ?? '');
}

const firstOrPick = (options: readonly string[], value: string, placeholder?: string) =>
  (options.includes(value) ? value : placeholder ? '' : options[0] ?? '');

/** 입력칸이 처음 그려졌을 때 화면에서 읽히는 값 (readFieldValues 와 같은 결과) — 첫 계산·고정 규칙에 사용 */
export function renderedValues(fields: readonly FieldSpec[], values: FieldValues): FieldValues {
  const result: FieldValues = {};
  for (const field of fields) {
    const { id } = field;
    const value = values[id] ?? field.value ?? '';
    switch (field.type) {
      case 'radio':   result[id] = String(value || field.options?.[0] || ''); break;
      case 'select':  result[id] = firstOrPick(field.options ?? [], String(value), field.placeholder); break;
      case 'account': result[id] = firstOrPick(accountOptions(), String(value)); break;
      case 'checks':  result[id] = Array.isArray(value) ? value : []; break;
      case 'money':   result[id] = toNumber(value); break;
      case 'file':    result[id] = []; break;
      case 'addr':
        result[id] = String(value);
        result[`${id}_zip`] = String(values[`${id}_zip`] ?? field.zip ?? '');
        result[`${id}_d`] = String(values[`${id}_d`] ?? '');
        break;
      default:        result[id] = String(value);
    }
  }
  return result;
}
