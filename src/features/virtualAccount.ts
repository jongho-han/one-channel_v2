/* 보험료 납입 (PM-01): 가상계좌 발급 */
import type { FieldValues } from '../components/form/fieldSpec';
import { randomDigits } from '../core/format';

export const PAY_BY_ACCOUNT = '내 계좌에서 출금';
export const PAY_BY_VIRTUAL = '가상계좌로 이체';
/** 발급 가능 은행 → 가상계좌번호 형식(샘플) */
export const VIRTUAL_ACCOUNT_BANKS: Record<string, () => string> = {
  'iM뱅크': () => `508-90-${randomDigits(6)}-${randomDigits(1)}`,
  '농협':   () => `790-${randomDigits(4)}-${randomDigits(4)}-${randomDigits(2)}`,
};
export const VIRTUAL_ACCOUNT_DEADLINE = '오후 6시';

export interface VirtualAccount {
  bank: string;
  number: string;
  holder: string;
}

export const isVirtualPayment = (values: FieldValues): boolean => values.how === PAY_BY_VIRTUAL;

/** 고른 은행의 가상계좌 발급 (샘플 번호) */
export function issueVirtualAccount(values: FieldValues): VirtualAccount {
  const bank = String(values.vbank || Object.keys(VIRTUAL_ACCOUNT_BANKS)[0]);
  return { bank, number: VIRTUAL_ACCOUNT_BANKS[bank](), holder: 'iM라이프' };
}
