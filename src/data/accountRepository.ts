/* 출금·입금 계좌: 본인 등록 계좌 목록과 은행 계좌 확인(시뮬레이션 — 운영에서는 은행 예금주 조회 연동) */

export const NEW_ACCOUNT = '다른 본인 계좌 등록';

export const BANKS: readonly string[] = ['iM뱅크', 'KB국민은행', '신한은행', '우리은행', '하나은행', 'NH농협은행', 'IBK기업은행', '카카오뱅크', '토스뱅크', '케이뱅크', '우체국'];

const accounts: string[] = ['iM뱅크 508-12-****91 (본인)', '국민은행 123-45-****01 (본인)', '신한은행 110-***-***882 (본인)'];

export const registeredAccounts = (): readonly string[] => accounts;

/** 계좌 선택칸 목록: 등록 계좌 + 맨 끝에 「다른 본인 계좌 등록」 */
export const accountOptions = (): readonly string[] => [...accounts, NEW_ACCOUNT];

/** 계좌 확인을 마친 새 계좌 추가 — 이미 있으면 false */
export function addAccount(label: string): boolean {
  if (accounts.includes(label)) return false;
  accounts.push(label);
  return true;
}

export type AccountCheck = { ok: true; holder: string } | { ok: false; reason: string };
export type VerifyAccount = (bank: string, number: string, holderName: string) => Promise<AccountCheck>;

const BANK_RESPONSE_MS = 800;

/**
 * 은행 계좌 확인 (시뮬레이션): 계좌가 있고 예금주가 본인인지
 * 시연용 — 끝자리 000: 은행에 없는 계좌 / 끝자리 999: 예금주가 본인이 아님 / 그 외: 본인 계좌
 */
export const verifyAccount: VerifyAccount = (_bank, number, holderName) => new Promise(resolve => {
  setTimeout(() => {
    if (number.endsWith('000')) resolve({ ok: false, reason: '은행에서 계좌를 찾을 수 없습니다. 은행과 계좌번호를 확인해 주세요.' });
    else if (number.endsWith('999')) resolve({ ok: false, reason: '예금주(김*수)가 본인과 다릅니다. 본인 명의 계좌만 등록할 수 있습니다.' });
    else resolve({ ok: true, holder: holderName });
  }, BANK_RESPONSE_MS);
});
