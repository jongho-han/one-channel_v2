/* 입력 검증 규칙 (formEngine.js 와 React 폼 공용) */
import { validateValues, validationMessage } from '../../../src/form/validation';

describe('validationMessage', () => {
  test.each([
    [{ id: 'nm', label: '이름' }, '', '이름을(를) 입력해 주세요.'],
    [{ id: 'nm', label: '이름' }, '  ', '이름을(를) 입력해 주세요.'],
    [{ id: 'nm', label: '이름' }, '홍길동', ''],
    [{ id: 't', label: '휴대폰', type: 'tel' }, '010-1234', '전화번호 형식을 확인해 주세요. 예: 010-1234-5678'],
    [{ id: 't', label: '휴대폰', type: 'tel' }, '01012345678', ''],
    [{ id: 'm', label: '이메일', type: 'email' }, 'a@b', '이메일 주소 형식을 확인해 주세요.'],
    [{ id: 's', label: '관계', type: 'select', placeholder: '선택' }, '', '관계를 선택해 주세요.'],
    [{ id: 's', label: '은행', type: 'select' }, '', ''],
    [{ id: 'r', label: '구분', type: 'radio' }, '', ''],
    [{ id: 'c', label: '항목', type: 'checks' }, [], '한 개 이상 선택해 주세요.'],
    [{ id: 'f', label: '서류', type: 'file' }, [], '증빙서류를 1장 이상 올려 주세요.'],
    [{ id: 'a', label: '금액', type: 'money', max: 500, min: 100 }, 0, '금액을(를) 입력해 주세요.'],
    [{ id: 'a', label: '금액', type: 'money', max: 500, min: 100 }, 600, '최대 500원까지 가능합니다.'],
    [{ id: 'a', label: '금액', type: 'money', max: 500, min: 100 }, 50, '최소 100원 이상 입력해 주세요.'],
  ] as const)('%o · %o → %s', (field, value, message) => {
    expect(validationMessage(field, value)).toBe(message);
  });
});

describe('validateValues', () => {
  test('선택 항목은 건너뛰고 오류만 모음', () => {
    const fields = [{ id: 'nm', label: '이름' }, { id: 'memo', label: '메모', optional: true }, { id: 'tel', label: '휴대폰', type: 'tel' as const }];
    expect(validateValues(fields, { nm: '', memo: '', tel: '010-1234-5678' })).toEqual({ nm: '이름을(를) 입력해 주세요.' });
  });
});

test('계좌: 「다른 본인 계좌 등록」을 고른 채로는 진행하지 않음', () => {
  expect(validationMessage({ label: '출금 계좌', type: 'account' }, '다른 본인 계좌 등록')).toBe('출금 계좌를 선택하거나 새 계좌를 등록해 주세요.');
  expect(validationMessage({ label: '출금 계좌', type: 'account' }, 'iM뱅크 508-12-****91 (본인)')).toBe('');
});
