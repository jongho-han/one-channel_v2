/* 출금·입금 계좌 목록과 은행 계좌 확인(시뮬레이션) */
import { NEW_ACCOUNT, accountOptions, addAccount, registeredAccounts, verifyAccount } from '../../src/data/accountRepository';

test('accountOptions: 등록 계좌 + 맨 끝에 「다른 본인 계좌 등록」', () => {
  const options = accountOptions();
  expect(options.at(-1)).toBe(NEW_ACCOUNT);
  expect(options).toContain('iM뱅크 508-12-****91 (본인)');
});

test('addAccount: 새 계좌는 등록 목록 끝(새 계좌 등록 앞)에, 같은 계좌는 다시 넣지 않음', () => {
  const before = registeredAccounts().length;
  expect(addAccount('농협은행 352-****-789 (본인)')).toBe(true);
  expect(addAccount('농협은행 352-****-789 (본인)')).toBe(false);
  expect(registeredAccounts()).toHaveLength(before + 1);
  expect(accountOptions().slice(-2)).toEqual(['농협은행 352-****-789 (본인)', NEW_ACCOUNT]);
});

describe('verifyAccount: 은행 계좌 확인 (시뮬레이션)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  const check = async (number: string) => {
    const result = verifyAccount('농협은행', number, '홍길동');
    await vi.runAllTimersAsync();
    return result;
  };

  test('정상: 예금주가 본인', async () => {
    expect(await check('3520123456789')).toEqual({ ok: true, holder: '홍길동' });
  });
  test('끝자리 000: 은행에 없는 계좌', async () => {
    expect(await check('3520123456000')).toEqual({ ok: false, reason: '은행에서 계좌를 찾을 수 없습니다. 은행과 계좌번호를 확인해 주세요.' });
  });
  test('끝자리 999: 예금주가 본인이 아님', async () => {
    expect(await check('3520123456999')).toEqual({ ok: false, reason: '예금주(김*수)가 본인과 다릅니다. 본인 명의 계좌만 등록할 수 있습니다.' });
  });
});
