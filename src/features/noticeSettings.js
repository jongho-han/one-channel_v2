import { $, $$, each, focusElement } from '../core/dom.js';
import { NOTICE_E_CONSENT_DEFAULT, NOTICE_SETTINGS } from '../data/consentRepository.js';
import { USER } from '../data/customerRepository.js';
import { announce, confirmDialog, toast } from '../ui/overlay.js';

/** 안내장 수신 방법 (선택 안내장에만 '받지 않음' 추가) */
const NOTICE_METHODS = ['모바일', '이메일', '우편(자택)', '우편(직장)'];
const NOTICE_OPT_OUT = '받지 않음';
/* 전자적방법(이메일·모바일) 안내장 수신 동의 */
const NOTICE_E_CONSENT_TEXT = '보험서비스에 관련된 안내장을 전자적방법(이메일, 모바일 등)으로 수신하는 것에 동의 합니다.';
const NOTICE_ELECTRONIC_METHODS = ['모바일', '이메일'];   // 전자적방법 → 수신동의 필요
const NOTICE_POST_DEFAULT = '우편(자택)';                 // 동의 해제 시 바꿀 수신 방법


export function noticeSettingsBody(flow) {
  /* 법정 안내장은 반드시 받아야 하므로 '받지 않음'을 목록에 넣지 않음 */
  const methodsFor = type => [...NOTICE_METHODS, ...(type === '법정' ? [] : [NOTICE_OPT_OUT])];
  const eConsent = flow.values.eConsent ?? NOTICE_E_CONSENT_DEFAULT;
  return `
  <div class="card"><h2>안내장 받으실 곳</h2>
    <dl class="kv">
      <dt>휴대폰</dt><dd class="num">${USER.phone}</dd>
      <dt>이메일</dt><dd>${USER.email}</dd>
    </dl>
    <div class="agree checks e-consent">
      <label><input type="checkbox" id="eConsent" ${eConsent ? 'checked' : ''}><span>${NOTICE_E_CONSENT_TEXT}</span></label>
    </div>
    <p class="note-sm">휴대폰·이메일 주소는 <button class="link" data-action="open" data-id="MY-01">개인정보변경</button>에서 바꿀 수 있습니다.</p>
  </div>
  <div class="card"><h2>안내장별 수신 방법</h2>
    <div class="tbl-wrap plain"><table class="tbl min-460">
      <caption class="sr-only">안내장별 수신 방법 · 법정 안내장은 받지 않음을 고를 수 없음</caption>
      <thead><tr><th scope="col">안내장</th><th scope="col">구분</th><th scope="col">수신 방법</th></tr></thead>
      <tbody>
        ${each(NOTICE_SETTINGS, ([name, type, savedMethod], index) => { const method = flow.values.noticeMethods?.[index] ?? savedMethod; return `
          <tr><td>${name}</td>
            <td>${type === '법정' ? '<span class="st b">법정</span>' : '<span class="st n">선택</span>'}</td>
            <td><select class="inp sm narrow" id="nt${index}" data-notice-method aria-label="${name} 수신 방법">${each(methodsFor(type), option => `<option ${option === method ? 'selected' : ''}>${option}</option>`)}</select></td>
          </tr>`; })}
      </tbody>
    </table></div>
  </div><div id="frm"></div>`;
}


/* 안내장수신설정 (MY-02): 수신 방법 ↔ 전자적방법 수신동의 연동
   ① 모바일·이메일을 고르면 수신동의 자동 체크
   ② 수신동의 해제 시 확인 팝업 → 예: 모바일·이메일 → 우편(자택) / 아니오·X: 그대로 */
export function bindNoticeSettings(root, flow) {
  const consent = $('#eConsent', root);
  if (!consent) return;   // 완료 화면
  const selects = $$('[data-notice-method]', root);
  const saveMethods = () => { flow.values.noticeMethods = selects.map(select => select.value); };
  const setConsent = checked => { consent.checked = checked; flow.values.eConsent = checked; };
  const isElectronic = method => NOTICE_ELECTRONIC_METHODS.includes(method);

  selects.forEach(select => select.addEventListener('change', () => {
    saveMethods();
    if (isElectronic(select.value) && !consent.checked) {
      setConsent(true);
      announce('모바일·이메일 수신을 선택해 전자적방법 수신동의에 체크했습니다.');
    }
  }));

  consent.addEventListener('change', () => {
    if (consent.checked) return setConsent(true);
    setConsent(true);   // 팝업에서 '예'를 고를 때까지 체크 유지
    confirmDialog({
      title: '전자적방법 수신동의 해제',
      message: '전자적방법 수신동의 체크 해제 시 안내장별 수신 방법을 우편으로 선택하셔야 합니다. 해제하시겠습니까?',
      onYes: () => {
        const changed = selects.filter(select => isElectronic(select.value));
        changed.forEach(select => { select.value = NOTICE_POST_DEFAULT; });
        saveMethods();
        setConsent(false);
        toast(changed.length ? `${changed.length}개 안내장의 수신 방법을 ${NOTICE_POST_DEFAULT}으로 바꿨습니다.` : '전자적방법 수신동의를 해제했습니다.');
        focusElement(consent);
      },
      onNo: () => focusElement(consent),
    });
  });
}
