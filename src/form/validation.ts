/* 입력 검증 규칙 */
import { otherInputId, type FieldSpec, type FieldValues } from '../components/form/fieldSpec';
import { NEW_ACCOUNT } from '../data/accountRepository';
import { EMAIL_PATTERN, PHONE_PATTERN, formatWon, withObjectParticle } from '../core/format';

type FieldValue = FieldValues[string] | readonly string[];

/** 항목 하나의 오류 문구 ('' = 통과). 선택 항목(optional) 여부는 호출하는 쪽에서 판단 */
export function validationMessage(field: Pick<FieldSpec, 'label' | 'type' | 'placeholder' | 'max' | 'min'>, value: FieldValue): string {
  switch (field.type) {
    case 'money': {
      const amount = Number(value) || 0;
      if (!amount) return `${field.label}을(를) 입력해 주세요.`;
      if (field.max && amount > field.max) return `최대 ${formatWon(field.max)}까지 가능합니다.`;
      if (field.min && amount < field.min) return `최소 ${formatWon(field.min)} 이상 입력해 주세요.`;
      return '';
    }
    case 'checks': return Array.isArray(value) && value.length ? '' : '한 개 이상 선택해 주세요.';
    case 'file':   return Array.isArray(value) && value.length ? '' : '증빙서류를 1장 이상 올려 주세요.';
    case 'tel':    return PHONE_PATTERN.test(String(value ?? '')) ? '' : '전화번호 형식을 확인해 주세요. 예: 010-1234-5678';
    case 'email':  return EMAIL_PATTERN.test(String(value ?? '')) ? '' : '이메일 주소 형식을 확인해 주세요.';
    case 'select': return field.placeholder && !value ? `${withObjectParticle(field.label)} 선택해 주세요.` : '';
    case 'account': return value === NEW_ACCOUNT ? `${withObjectParticle(field.label)} 선택하거나 새 계좌를 등록해 주세요.` : '';
    case 'radio': case 'addr': return '';
    default:       return String(value ?? '').trim() ? '' : `${field.label}을(를) 입력해 주세요.`;
  }
}

/** 필수 항목을 검사해 오류만 모음: 항목 id → 문구 */
export function validateValues(fields: readonly FieldSpec[], values: FieldValues): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    if (field.optional) continue;
    const message = validationMessage(field, values[field.id]);
    if (message) errors[field.id] = message;
    else if (field.other && values[field.id] === field.other.option && !String(values[otherInputId(field)] ?? '').trim()) {
      errors[field.id] = `${withObjectParticle(`${field.other.option} ${field.label}`)} 입력해 주세요.`;
    }
  }
  return errors;
}
