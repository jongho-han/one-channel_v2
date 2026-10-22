/* 다른 본인 계좌 등록: ① 은행·계좌번호 입력 → ② 계좌 확인(은행 조회) → ③ 등록. 확인 전·확인 후 입력을 바꾸면 등록 불가 */
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type { AccountCheck, VerifyAccount } from '../../data/accountRepository';
import { accountLabel, accountNumberError, normalizeAccountNumber } from '../../form/accountRules';
import { InfoBox } from '../widgets';
import { ModalTitle } from './ModalTitle';

interface AccountRegisterDialogProps {
  banks: readonly string[];
  holderName: string;                  // 예금주 = 로그인한 본인
  registered: readonly string[];       // 이미 등록된 계좌 (중복 등록 방지)
  verify: VerifyAccount;               // 은행 계좌 확인
  onRegister: (label: string) => void;
}

type Status = { kind: 'idle' | 'checking' } | { kind: 'done'; result: AccountCheck };
interface Errors { bank?: string; number?: string; form?: string }

export function AccountRegisterDialog({ banks, holderName, registered, verify, onRegister }: AccountRegisterDialogProps) {
  const [bank, setBank] = useState('');
  const [number, setNumber] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [errors, setErrors] = useState<Errors>({});
  const bankRef = useRef<HTMLSelectElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);
  const checkRef = useRef<HTMLButtonElement>(null);
  const request = useRef(0);   // 확인 중에 입력을 바꾸면 늦게 온 응답은 버림

  const verified = status.kind === 'done' && status.result.ok;
  const update = (apply: () => void) => flushSync(() => { apply(); request.current++; setStatus({ kind: 'idle' }); setErrors({}); });

  const check = () => {
    if (status.kind === 'checking') return;
    const found: Errors = { bank: bank ? undefined : '은행을 선택해 주세요.', number: accountNumberError(number) || undefined };
    if (!found.bank && !found.number && registered.includes(accountLabel(bank, number))) found.number = '이미 등록된 계좌입니다.';
    if (found.bank || found.number) {
      flushSync(() => setErrors(found));
      (found.bank ? bankRef : numberRef).current?.focus();
      return;
    }
    const id = ++request.current;
    flushSync(() => { setErrors({}); setStatus({ kind: 'checking' }); });
    void verify(bank, normalizeAccountNumber(number), holderName).then(result => {
      if (id !== request.current) return;
      flushSync(() => setStatus({ kind: 'done', result }));
    });
  };

  const register = () => {
    if (!verified) {
      if (status.kind !== 'done') flushSync(() => setErrors({ form: '계좌 확인을 먼저 해 주세요.' }));
      checkRef.current?.focus();
      return;
    }
    onRegister(accountLabel(bank, number));
  };

  const failure = status.kind === 'done' && !status.result.ok ? status.result.reason : '';
  return (
    <>
      <ModalTitle>다른 본인 계좌 등록</ModalTitle>
      <p>본인 명의 계좌만 등록할 수 있습니다. <b>계좌 확인</b>으로 은행에서 예금주를 확인한 뒤 등록하세요.</p>
      <div className="fld">
        <label htmlFor="nbHolder">예금주</label>
        <input className="inp" id="nbHolder" value={holderName} readOnly />
      </div>
      <div className="fld">
        <label htmlFor="nbBank">은행</label>
        <select className={errors.bank ? 'inp bad' : 'inp'} id="nbBank" ref={bankRef} value={bank} aria-required aria-invalid={errors.bank ? true : undefined}
                aria-describedby={errors.bank ? 'nbBankErr' : undefined} onChange={event => update(() => setBank(event.target.value))}>
          <option value="">은행을 선택하세요</option>
          {banks.map(name => <option key={name}>{name}</option>)}
        </select>
        {errors.bank && <span className="err" id="nbBankErr" role="alert">{errors.bank}</span>}
      </div>
      <div className="fld">
        <label htmlFor="nbNo">계좌번호</label>
        <div className="inrow">
          <input className={errors.number ? 'inp num bad' : 'inp num'} id="nbNo" ref={numberRef} inputMode="numeric" placeholder="- 없이 숫자만" value={number}
                 aria-required aria-invalid={errors.number ? true : undefined} aria-describedby={errors.number ? 'nbNoErr' : 'nbNoHelp'}
                 onInput={event => update(() => setNumber(event.currentTarget.value))} onChange={() => {}} />
          <button type="button" className="btn navy" id="nbCheck" ref={checkRef} aria-disabled={status.kind === 'checking' || undefined} onClick={check}>
            {status.kind === 'checking' ? '확인 중…' : '계좌 확인'}
          </button>
        </div>
        {errors.number
          ? <span className="err" id="nbNoErr" role="alert">{errors.number}</span>
          : <span className="help" id="nbNoHelp">숫자 10~14자리 · 시연: 끝자리 000은 없는 계좌, 999는 타인 명의로 확인됩니다.</span>}
      </div>
      <div aria-live="polite">
        {status.kind === 'checking' && <p className="note-sm">은행에 계좌를 확인하고 있습니다.</p>}
        {verified && <InfoBox tone="ok mt-12" icon="check">예금주 {holderName} · 본인 계좌 확인 완료</InfoBox>}
      </div>
      {(failure || errors.form) && <p className="err mt-12" role="alert">{failure || errors.form}</p>}
      <div className="navrow inline mt-16">
        <button type="button" className="btn" data-action="close-modal">취소</button>
        <button type="button" className="btn pri" id="nbRegister" onClick={register}>등록</button>
      </div>
    </>
  );
}
