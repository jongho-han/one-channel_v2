/* 새 계좌 등록: 계좌번호 규칙 · 목록에 보일 이름 */

/** 입력한 계좌번호에서 숫자만 남김 (- 와 공백 허용) */
export const normalizeAccountNumber = (value: string): string => value.replace(/[\s-]/g, '');

/** 계좌번호 오류 문구 ('' = 통과): 숫자 10~14자리 */
export function accountNumberError(value: string): string {
  const number = normalizeAccountNumber(value);
  if (!number) return '계좌번호를 입력해 주세요.';
  return /^\d{10,14}$/.test(number) ? '' : '계좌번호는 숫자 10~14자리로 입력해 주세요.';
}

/** 목록 표시 이름: 앞 3자리·끝 3자리만 보이게 가림 — 예: 농협은행 352-****-789 (본인) */
export function accountLabel(bank: string, value: string): string {
  const number = normalizeAccountNumber(value);
  return `${bank} ${number.slice(0, 3)}-****-${number.slice(-3)} (본인)`;
}
