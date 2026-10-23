/* 개인정보변경(MY-01): 연락처(휴대폰·이메일) · 자택정보 · 직장정보 — 현재 정보는 가려서 보여주고, 입력한 항목만 변경 */
import { useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { RequiredMark } from '../../components/form/Field';
import { Icon } from '../../components/Icon';
import { maskPhone } from '../../core/format';
import { maskDetail, maskEmailLocal, splitAddress, splitEmail, telParts, type PrivacyErrors, type PrivacyValues } from '../../form/privacyRules';

export interface PrivacyCurrent {
  phone: string; email: string;
  homeZip: string; homeAddress: string; homeTel: string;
  workZip: string; workAddress: string; workTel: string;
}

export interface PrivacyFormProps {
  current: PrivacyCurrent;
  values: PrivacyValues;
  errors: PrivacyErrors;
  domains: readonly string[];                                   // 이메일 도메인 선택지
  callCenter: string;
  onChange: (values: PrivacyValues) => void;                    // 진행 상태에 저장
  verifyPhone: (phone: string, onDone: () => void) => void;     // 새 휴대폰 본인 인증
  searchZip: (onPick: (zip: string, address: string) => void) => void;
  isEmailTaken: (email: string) => boolean;
}

type Place = 'H' | 'W';
const ADDRESS_NOTE = '자택, 직장 중 1개 이상의 주소를 꼭 입력해 주세요.';

function Err({ id, message }: { id: string; message?: string }) {
  return <span className="err" id={id} role="alert">{message ?? ''}</span>;
}

export function PrivacyForm({ current, values, errors, domains, callCenter, onChange, verifyPhone, searchZip, isEmailTaken }: PrivacyFormProps) {
  const [vals, setVals] = useState<PrivacyValues>(values);
  const [mobMessage, setMobMessage] = useState('');
  const [emailTaken, setEmailTaken] = useState(false);
  const detailRefs = { H: useRef<HTMLInputElement>(null), W: useRef<HTMLInputElement>(null) };
  const [currentLocal, currentDomain] = splitEmail(current.email);
  const domainOptions = [...new Set([currentDomain, ...domains])];

  const update = (patch: PrivacyValues) => {
    const next = { ...vals, ...patch };
    flushSync(() => setVals(next));
    onChange(next);
    return next;
  };

  const requestPhone = () => {
    const phone = String(vals.mob ?? '').trim();
    if (!phone) { flushSync(() => setMobMessage('변경할 휴대폰번호를 입력해 주세요.')); return; }
    flushSync(() => setMobMessage(''));
    verifyPhone(phone, () => update({ mobVerified: true }));
  };

  const checkEmail = () => {
    const local = String(vals.emailLocal ?? '').trim();
    if (!local) { flushSync(() => setEmailTaken(false)); update({ emailChecked: false }); return; }
    const taken = isEmailTaken(`${local}@${vals.emailDomain ?? currentDomain}`);
    flushSync(() => setEmailTaken(taken));
    update({ emailChecked: !taken });
  };

  const pickAddress = (place: Place) => searchZip((zip, address) => {
    update({ [`addr${place}_zip`]: zip, [`addr${place}`]: address, [`addr${place}_d`]: '' });
    detailRefs[place].current?.focus();
  });

  const address = (place: Place, label: string, required: boolean) => {
    const [zip, full] = place === 'H' ? [current.homeZip, current.homeAddress] : [current.workZip, current.workAddress];
    const [base, detail] = splitAddress(full);
    const id = `addr${place}` as const;
    const searched = Boolean(vals[id]);
    const shown = searched ? `[${vals[`${id}_zip`]}] ${vals[id]}` : `[${zip}] ${base}`;
    return (
      <div className="fld">
        <label htmlFor={id}>{label}{required && <RequiredMark />}</label>
        <div className="inrow addr-search">
          <input className={errors[id] ? 'inp bad' : 'inp'} id={id} value={shown} readOnly aria-describedby={`e-${id}`} />
          <button type="button" className="btn icon-only" data-zip={id} aria-label={`${label} 검색`} onClick={() => pickAddress(place)}><Icon name="search" /></button>
        </div>
        <input className="inp mt-8" id={`${id}_d`} ref={detailRefs[place]} key={shown} aria-label={`${place === 'H' ? '자택' : '직장'} 상세주소`}
               placeholder={searched ? '상세주소' : maskDetail(detail)} defaultValue={vals[`${id}_d`] ?? ''} aria-invalid={errors[id] ? true : undefined}
               onInput={event => update({ [`${id}_d`]: event.currentTarget.value })} />
        <ul className="dots note-sm mt-8"><li>{ADDRESS_NOTE}</li></ul>
        <Err id={`e-${id}`} message={errors[id]} />
      </div>
    );
  };

  const tel = (place: Place, label: string) => {
    const key = `tel${place}` as const;
    const parts = telParts(place === 'H' ? current.homeTel : current.workTel);
    const names = ['앞자리', '가운데자리', '끝자리'];
    return (
      <div className="fld">
        <span className="lb" id={`lb-${key}`}>{label}</span>
        <div className="tel3" role="group" aria-labelledby={`lb-${key}`}>
          {parts.map((placeholder, index) => {
            const name = `${key}${index + 1}` as keyof PrivacyValues;
            return (
              <input key={name} className={errors[key] ? 'inp num bad' : 'inp num'} id={name} inputMode="numeric" maxLength={4} placeholder={placeholder}
                     aria-label={`${label} ${names[index]}`} defaultValue={String(vals[name] ?? '')} aria-describedby={`e-${key}`}
                     onInput={event => update({ [name]: event.currentTarget.value })} />
            );
          })}
        </div>
        <Err id={`e-${key}`} message={errors[key]} />
      </div>
    );
  };

  const section = (title: string, children: ReactNode, aside?: ReactNode) => (
    <div className="card privacy-sec">
      <div className="sec-head"><h2>{title}</h2>{aside}</div>
      {children}
    </div>
  );

  return (
    <>
      {section('연락처', <>
        <div className="fld">
          <label htmlFor="mob">휴대폰번호<RequiredMark /></label>
          <div className="inrow">
            <input className={errors.mob || mobMessage ? 'inp num bad' : 'inp num'} id="mob" inputMode="tel" autoComplete="tel" placeholder={maskPhone(current.phone)}
                   defaultValue={vals.mob ?? ''} aria-describedby="h-mob e-mob" aria-invalid={errors.mob || mobMessage ? true : undefined}
                   onInput={event => { flushSync(() => setMobMessage('')); update({ mob: event.currentTarget.value, mobVerified: false }); }} />
            <button type="button" className="btn pri" id="mobVerify" onClick={requestPhone}>휴대폰인증</button>
          </div>
          {vals.mobVerified && <span className="ok-msg" id="mobOk"><Icon name="check" />휴대폰 인증 완료</span>}
          <span className="help" id="h-mob">휴대폰번호를 변경하려면 본인명의 휴대폰 인증이 필요합니다. 본인명의 휴대폰이 없다면 콜센터({callCenter})로 문의해 주세요.</span>
          <Err id="e-mob" message={errors.mob || mobMessage} />
        </div>
        <div className="fld" role="group" aria-label="이메일">
          <div className="lb-row"><span className="lb">이메일<RequiredMark /></span>
            <button type="button" className="btn sm" id="emailCheck" onClick={checkEmail}>중복확인</button></div>
          <div className="email-row">
            <input className={errors.email ? 'inp bad' : 'inp'} id="emailLocal" aria-label="이메일 아이디" autoComplete="email" placeholder={maskEmailLocal(currentLocal)}
                   defaultValue={vals.emailLocal ?? ''} aria-describedby="e-email" aria-invalid={errors.email ? true : undefined}
                   onInput={event => { flushSync(() => setEmailTaken(false)); update({ emailLocal: event.currentTarget.value, emailDomain: vals.emailDomain ?? currentDomain, emailChecked: false }); }} />
            <span aria-hidden="true">@</span>
            <select className="inp" id="emailDomain" aria-label="이메일 도메인" defaultValue={vals.emailDomain ?? currentDomain}
                    onChange={event => { flushSync(() => setEmailTaken(false)); update({ emailDomain: event.currentTarget.value, emailChecked: false }); }}>
              {domainOptions.map(domain => <option key={domain}>{domain}</option>)}
            </select>
          </div>
          {vals.emailChecked && <span className="ok-msg" id="emailOk">사용할 수 있는 이메일입니다.</span>}
          <Err id="e-email" message={emailTaken ? '이미 사용 중인 이메일입니다.' : errors.email} />
        </div>
      </>, <p className="req-note"><span className="req" aria-hidden="true">*</span>표시는 필수 입력 항목입니다.</p>)}
      {section('자택정보', <>{address('H', '자택주소', true)}{tel('H', '자택전화')}</>)}
      {section('직장정보', <>{address('W', '직장주소', false)}{tel('W', '직장전화')}</>)}
      <p className="err" id="e-form" role="alert">{errors.form ?? ''}</p>
    </>
  );
}
