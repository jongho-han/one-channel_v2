/* 새 계좌 등록: 계좌번호 규칙 · 표시 이름 */
import { accountLabel, accountNumberError, normalizeAccountNumber } from '../../../src/form/accountRules';

test('normalizeAccountNumber: 숫자만 남김', () => {
  expect(normalizeAccountNumber(' 352-0123-4567-89 ')).toBe('3520123456789');
});

test('accountNumberError: 비었으면 입력 안내, 숫자 10~14자리만 통과', () => {
  expect(accountNumberError('')).toBe('계좌번호를 입력해 주세요.');
  expect(accountNumberError('12-34')).toBe('계좌번호는 숫자 10~14자리로 입력해 주세요.');
  expect(accountNumberError('123456789012345')).toBe('계좌번호는 숫자 10~14자리로 입력해 주세요.');
  expect(accountNumberError('12a4567890')).toBe('계좌번호는 숫자 10~14자리로 입력해 주세요.');
  expect(accountNumberError('352-0123-4567-89')).toBe('');
});

test('accountLabel: 앞 3자리·끝 3자리만 보이고 (본인)', () => {
  expect(accountLabel('농협은행', '352-0123-4567-89')).toBe('농협은행 352-****-789 (본인)');
});
