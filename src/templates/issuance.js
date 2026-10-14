import { APP } from '../core/config.js';
import { $, $$, each, escapeHtml, scrollToTop } from '../core/dom.js';
import { PHONE_PATTERN } from '../core/format.js';
import { USER } from '../data/customerRepository.js';
import { readFieldValues, renderField } from '../form/formEngine.js';
import { rerenderScreen } from '../pages/screen.js';
import { CERTIFICATES, FORM_DOWNLOADS } from '../screens/certificates.js';
import { state } from '../state/store.js';
import { icon } from '../ui/icons.js';
import { infoBox } from '../ui/widgets.js';

/* T5 발급: 조건 선택 → 즉시 발급(견본 증명서) ------------------------- */
const RECEIVE_FIELD = { id: 'recv', label: '받는 방법', type: 'radio', options: ['화면에서 보기', 'PDF로 저장', '이메일로 받기', '팩스로 받기'] };

export function renderIssuance(screen) {
  if (screen.authLevel === 'A0') return renderFormDownloads(screen);

  const config = CERTIFICATES[screen.id];
  const flow = state.screen.flow ??= { step: 0, values: {} };
  if (flow.step === 1) return issuedCertificate(config, flow);

  return `
  <div class="card"><h2>발급 조건</h2><div class="form" id="frm">${each(config.fields, field => renderField(field, flow.values))}</div></div>
  ${config.preview ? `<div class="card"><h2>발급 미리보기</h2>${config.preview()}</div>` : ''}
  <div class="card"><div class="form">
    ${renderField(RECEIVE_FIELD, flow.values)}
    <div class="fld" id="emailF" hidden><label for="email">받을 이메일</label><input class="inp" id="email" type="email" value="${USER.email}"></div>
    <div class="fld" id="faxF" hidden><label for="fax">받을 팩스번호</label><input class="inp num" id="fax" type="tel" placeholder="02-000-0000"><span class="err" id="faxErr"></span></div>
  </div></div>
  <div class="navrow">
    <button class="btn lg" data-action="back">취소</button>
    <button class="btn pri lg" id="issue">발급하기</button>
  </div>`;
}

/** 비로그인 서류 내려받기 (CS-01·02) */
function renderFormDownloads(screen) {
  const tone = { '필수': 'r', '안내': 'b' };
  return `
  ${infoBox('ok', 'info', '<b>로그인하지 않아도 받을 수 있습니다</b>서류를 출력해 작성한 뒤, 사이버창구·모바일 청구 또는 우편·팩스로 제출하세요.', 'mb-14')}
  <div class="card"><h2>${escapeHtml(screen.depth3)}</h2><div class="picks">
    ${each(FORM_DOWNLOADS[screen.id], ([name, desc, kind]) => `
      <div class="pick static">
        <span class="ic doc-ic" aria-hidden="true">${icon('doc')}</span>
        <span class="pm"><b>${name}</b><small>${desc}</small></span>
        <span class="st ${tone[kind] || 'n'}">${kind}</span>
        <button class="btn sm" data-action="toast" data-message="${name} PDF는 실제 서비스에서 내려받습니다." aria-label="${name} PDF 받기">PDF 받기</button>
      </div>`)}
  </div></div>
  <div class="navrow">
    <button class="btn lg" data-action="nav" data-page="home">홈으로</button>
    <button class="btn pri lg" data-action="open" data-id="PY-01">모바일로 바로 청구하기</button>
  </div>`;
}

function issuedCertificate(config, flow) {
  const values = flow.values;
  flow.issueNo ??= 'No. ' + APP.today.replace(/\./g, '') + '-' + String(Math.floor(Math.random() * 900000) + 100000);
  const randomCode = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  const [[, title], ...rows] = config.document(values);
  const deliveryNote = {
    '이메일로 받기': `${escapeHtml(values.email || USER.email)}(으)로 보냈습니다.`,
    '팩스로 받기':   `${escapeHtml(values.fax)}(으)로 전송했습니다.`,
    'PDF로 저장':    '실제 서비스에서는 PDF 파일로 저장됩니다.',
  }[values.recv] || '아래 증명서를 확인하세요.';

  return `
  ${infoBox('ok', 'check', `<b>발급이 완료되었습니다</b>${deliveryNote} 문서확인번호로 진위를 확인할 수 있습니다.`, 'mb-14')}
  <div class="cert">
    <div class="issuer">iM라이프생명보험</div>
    <h2>${escapeHtml(title)}</h2>
    <div class="no num">${flow.issueNo} · 문서확인번호 ${randomCode()}-${randomCode()}</div>
    <table><tbody>
      <tr><th>계약자</th><td>${USER.name} (${USER.birth.slice(0, 4)}.**.**)</td></tr>
      ${each(rows, ([key, value]) => `<tr><th>${escapeHtml(key)}</th><td class="num">${escapeHtml(value)}</td></tr>`)}
    </tbody></table>
    <p class="attest">위와 같이 증명합니다.</p>
    <div class="sign num">${APP.today}<br>iM라이프생명보험주식회사<small>본 문서는 기획 검토용 견본이며 효력이 없습니다.</small></div>
  </div>
  <div class="navrow">
    <button class="btn lg" data-action="reset-flow">다시 발급</button>
    <button class="btn pri lg" data-action="nav" data-page="home">완료</button>
  </div>`;
}

export function bindIssuance(screen, root) {
  if (screen.authLevel === 'A0' || state.screen.flow.step === 1) return;
  const config = CERTIFICATES[screen.id];

  const syncReceiveFields = () => {
    const method = $('input[name=recv]:checked', root).value;
    $('#emailF', root).hidden = method !== '이메일로 받기';
    $('#faxF', root).hidden = method !== '팩스로 받기';
  };
  $$('input[name=recv]', root).forEach(radio => { radio.onchange = syncReceiveFields; });
  syncReceiveFields();

  $('#issue', root).onclick = () => {
    const values = readFieldValues(root, [...config.fields, RECEIVE_FIELD]);
    values.email = $('#email', root).value;
    values.fax = $('#fax', root).value;
    if (values.recv === '팩스로 받기' && !PHONE_PATTERN.test(values.fax)) {
      $('#faxErr', root).textContent = '팩스번호를 확인해 주세요.';
      return;
    }
    for (const key of ['from', 'to', 'base']) if (values[key]) values[key] = values[key].replace(/-/g, '.');

    Object.assign(state.screen.flow, { values, step: 1 });
    rerenderScreen();
    scrollToTop();
  };
}
