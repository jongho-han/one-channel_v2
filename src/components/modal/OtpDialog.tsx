/* 금전 거래(A2)용 휴대폰 추가인증 — 남은 시간·시간 연장(KWCAG 11번 응답시간 조절)·재전송 */
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { formatClock } from '../../core/format';
import { ModalTitle } from './ModalTitle';

const OTP_SECONDS = 180;
const EXPIRED = '입력 시간이 지났습니다. 재전송 후 다시 입력해 주세요.';

interface OtpDialogProps {
  phone: string;                         // 가린 휴대폰 번호
  title?: string;                        // 기본: 추가인증
  message?: string;                      // 기본: 금전 거래 추가인증 안내
  onConfirm: () => void;
  announce: (message: string) => void;
  toast: (message: string) => void;
}

export function OtpDialog({ phone, title = '추가인증', message, onConfirm, announce, toast }: OtpDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [left, setLeft] = useState(OTP_SECONDS);
  const [startedAt, setStartedAt] = useState(0);   // 타이머 다시 시작 표시
  const [error, setError] = useState('');
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setLeft(seconds => {
        const next = Math.max(seconds - 1, 0);
        if (next === 60) announce('추가인증 남은 시간이 1분입니다. 시간 연장 버튼으로 늘릴 수 있습니다.');
        if (next === 0) { clearInterval(timer); setError(EXPIRED); }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [startedAt, announce]);

  const restart = () => flushSync(() => { setLeft(OTP_SECONDS); setStartedAt(time => time + 1); });

  const confirm = () => {
    const value = inputRef.current?.value ?? '';
    if (!/^\d{6}$/.test(value) || left === 0) {
      flushSync(() => { setError(left === 0 ? EXPIRED : '인증번호 6자리를 정확히 입력해 주세요.'); setInvalid(true); });
      inputRef.current?.focus();
      return;
    }
    onConfirm();
  };

  return (
    <>
      <ModalTitle>{title}</ModalTitle>
      <p>{message ?? `계좌·지급 등 금전 거래는 추가인증이 필요합니다. 등록된 휴대폰(${phone})으로 인증번호를 보냈습니다.`}</p>
      <div className="fld">
        <label htmlFor="otp">인증번호 6자리</label>
        <div className="inrow">
          <input className={invalid ? 'inp num bad' : 'inp num'} id="otp" ref={inputRef} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="숫자 6자리"
                 aria-describedby="otpHelp otpErr" aria-invalid={invalid || undefined} />
          <button className="btn" id="otpResend" onClick={() => { restart(); flushSync(() => setError('')); toast('인증번호를 다시 보냈습니다.'); }}>재전송</button>
        </div>
        <span className="help" id="otpHelp">프로토타입: 아무 숫자 6자리나 입력하세요. 남은 시간 <span id="otpTime" className="num">{formatClock(left)}</span>
          <button type="button" className="link" id="otpExtend" onClick={() => { restart(); announce('남은 시간을 3분으로 연장했습니다.'); }}>시간 연장</button></span>
        <span className="err" id="otpErr" role="alert">{error}</span>
      </div>
      <div className="navrow inline mt-18">
        <button className="btn" data-action="close-modal">취소</button>
        <button className="btn pri" id="otpOk" onClick={confirm}>확인</button>
      </div>
    </>
  );
}
