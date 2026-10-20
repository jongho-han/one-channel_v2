/* T4 전용 화면 본문: 안내장 수신설정(MY-02) · 마케팅 동의(MY-03) */
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { focusElement } from '../../core/dom.js';

/** [안내장, 구분(법정·선택), 현재 수신 방법] */
export type NoticeSetting = readonly [name: string, type: string, method: string];

const NOTICE_METHODS = ['모바일', '이메일', '우편(자택)', '우편(직장)'];
const NOTICE_OPT_OUT = '받지 않음';
const NOTICE_E_CONSENT_TEXT = '보험서비스에 관련된 안내장을 전자적방법(이메일, 모바일 등)으로 수신하는 것에 동의 합니다.';
const ELECTRONIC_METHODS = ['모바일', '이메일'];   // 전자적방법 → 수신동의 필요
const POST_DEFAULT = '우편(자택)';                 // 동의 해제 시 바꿀 수신 방법

/** 법정 안내장은 반드시 받아야 하므로 '받지 않음' 없음 */
const methodsFor = (type: string) => (type === '법정' ? NOTICE_METHODS : [...NOTICE_METHODS, NOTICE_OPT_OUT]);
const isElectronic = (method: string) => ELECTRONIC_METHODS.includes(method);

interface NoticeSettingsProps {
  notices: readonly NoticeSetting[];
  contact: { phone: string; email: string };
  methods: readonly string[];                    // 안내장별 선택한 수신 방법
  consent: boolean;                              // 전자적방법 수신동의
  onChange: (methods: string[], consent: boolean) => void;
  confirmRelease: (onYes: () => void, onNo: () => void) => void;   // 동의 해제 확인 창
  announce: (message: string) => void;
  toast: (message: string) => void;
}

/* 수신 방법 ↔ 전자적방법 수신동의 연동
   ① 모바일·이메일을 고르면 수신동의 자동 체크
   ② 수신동의 해제 시 확인 → 예: 모바일·이메일 → 우편(자택) / 아니오: 그대로 */
export function NoticeSettings({ notices, contact, methods: initialMethods, consent: initialConsent, onChange, confirmRelease, announce, toast }: NoticeSettingsProps) {
  const [methods, setMethods] = useState<string[]>([...initialMethods]);
  const [consent, setConsent] = useState(initialConsent);
  const consentRef = useRef<HTMLInputElement>(null);

  const update = (nextMethods: string[], nextConsent: boolean) => {
    flushSync(() => { setMethods(nextMethods); setConsent(nextConsent); });
    onChange(nextMethods, nextConsent);
  };

  const changeMethod = (index: number, method: string) => {
    const next = methods.map((value, i) => (i === index ? method : value));
    const autoConsent = isElectronic(method) && !consent;
    update(next, consent || autoConsent);
    if (autoConsent) announce('모바일·이메일 수신을 선택해 전자적방법 수신동의에 체크했습니다.');
  };

  const changeConsent = (checked: boolean) => {
    if (checked) return update(methods, true);
    confirmRelease(() => {   // 확인 전까지 체크 유지 (제어 컴포넌트라 값이 그대로)
      const changed = methods.filter(isElectronic).length;
      update(methods.map(method => (isElectronic(method) ? POST_DEFAULT : method)), false);
      toast(changed ? `${changed}개 안내장의 수신 방법을 ${POST_DEFAULT}으로 바꿨습니다.` : '전자적방법 수신동의를 해제했습니다.');
      focusElement(consentRef.current);
    }, () => focusElement(consentRef.current));
  };

  return (
    <>
      <div className="card"><h2>안내장 받으실 곳</h2>
        <dl className="kv">
          <dt>휴대폰</dt><dd className="num">{contact.phone}</dd>
          <dt>이메일</dt><dd>{contact.email}</dd>
        </dl>
        <div className="agree checks e-consent">
          <label><input type="checkbox" id="eConsent" ref={consentRef} checked={consent} onChange={event => changeConsent(event.currentTarget.checked)} /><span>{NOTICE_E_CONSENT_TEXT}</span></label>
        </div>
        <p className="note-sm">휴대폰·이메일 주소는 <button className="link" data-action="open" data-id="MY-01">개인정보변경</button>에서 바꿀 수 있습니다.</p>
      </div>
      <div className="card"><h2>안내장별 수신 방법</h2>
        <div className="tbl-wrap plain"><table className="tbl min-460">
          <caption className="sr-only">안내장별 수신 방법 · 법정 안내장은 받지 않음을 고를 수 없음</caption>
          <thead><tr><th scope="col">안내장</th><th scope="col">구분</th><th scope="col">수신 방법</th></tr></thead>
          <tbody>
            {notices.map(([name, type], index) => (
              <tr key={name}><td>{name}</td>
                <td>{type === '법정' ? <span className="st b">법정</span> : <span className="st n">선택</span>}</td>
                <td><select className="inp sm narrow" id={`nt${index}`} data-notice-method="" aria-label={`${name} 수신 방법`} value={methods[index]}
                            onChange={event => changeMethod(index, event.currentTarget.value)}>
                  {methodsFor(type).map(option => <option key={option}>{option}</option>)}
                </select></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
      <div id="frm" />
    </>
  );
}

/** [동의 항목, 동의일, 동의 여부] */
export type MarketingConsent = readonly [name: string, date: string, agreed: boolean];

export function MarketingConsents({ consents }: { consents: readonly MarketingConsent[] }) {
  return (
    <>
      <div className="card"><h2>마케팅 활용 동의 현황</h2>
        {consents.map(([name, date, agreed], index) => (
          <div className="toggle-row" key={name}>
            <div><b>{name}</b><small>{agreed ? `동의일 ${date}` : '미동의'}</small></div>
            <label className="tg"><input type="checkbox" id={`mk${index}`} defaultChecked={agreed} aria-label={name} /><span /></label>
          </div>
        ))}
      </div>
      <div id="frm" />
    </>
  );
}
