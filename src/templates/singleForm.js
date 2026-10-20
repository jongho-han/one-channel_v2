import { APP } from '../core/config';
import { $, each, escapeHtml, scrollToTop, when } from '../core/dom.js';
import { clockTime, receiptNo } from '../core/format';
import { bindFundExtras, bindFundTotal, fundAllocationBody, fundTotal, submitFundChange } from '../features/fund.js';
import { marketingConsentBody } from '../features/marketing.js';
import { bindNoticeSettings, noticeSettingsBody } from '../features/noticeSettings.js';
import { bindFormBehaviors, readFieldValues, renderField, validateFields } from '../form/formEngine.js';
import { rerenderScreen } from '../pages/screen.js';
import { CHANGE_FORMS } from '../screens/changeForms.js';
import { chooseSignMethod } from '../services/auth.js';
import { state } from '../state/store';
import { toast } from '../ui/overlay.js';
import { agreementList, doneCard, infoBox } from '../ui/widgets.js';

/* T4 단일폼 변경: 현재값 확인 → 변경 → 전자서명 ------------------------ */
export function renderSingleForm(screen) {
  const config = CHANGE_FORMS[screen.id];
  const flow = state.screen.flow ??= { step: 0, values: {}, agreed: [] };
  if (flow.step === 1) return singleFormDone(screen, config, flow);

  const body = {
    notice: () => noticeSettingsBody(flow),
    marketing: marketingConsentBody,
    fund: () => fundAllocationBody(flow),
  }[config.custom] || (() => standardChangeBody(config, flow));

  if (config.custom === 'fund' && flow.phase && flow.phase !== 'edit') return body();   // 진단·결과 화면은 자체 버튼 사용

  return `
  ${body()}
  ${when(config.note, infoBox('info', 'info', config.note, 'mt-14'))}
  ${config.agree ? agreementList(config.agree, flow.agreed) : ''}
  <div class="navrow">
    <button class="btn lg" data-action="back">취소</button>
    <button class="btn pri lg" id="next">${config.nextLabel || (screen.authLevel === 'A2' ? '추가인증 후 변경' : '변경하기')}</button>
  </div>`;
}

function standardChangeBody(config, flow) {
  return `
  <div class="card"><h2>현재 등록된 정보</h2>
    <dl class="kv">${each(config.current, ([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`)}</dl>
  </div>
  <div class="card"><h2>변경할 내용</h2><div class="form" id="frm">${each(config.fields, field => renderField(field, flow.values))}</div></div>
  ${when(config.calc, '<div class="mt-14" id="calc" aria-live="polite"></div>')}`;
}



function singleFormDone(screen, config, flow) {
  flow.receiptNo ??= receiptNo('M2610');
  return `
  ${doneCard({
    title: '변경이 완료되었습니다',
    message: config.done,
    rows: [['처리번호', flow.receiptNo], ['처리일시', `${APP.today} ${clockTime()}`], ['안내', escapeHtml(screen.result), true]],
  })}
  <div class="navrow inline">
    <button class="btn lg" data-action="nav" data-page="home">홈으로</button>
    <button class="btn pri lg" data-action="reset-flow">다시 보기</button>
  </div>`;
}

export function bindSingleForm(screen, root) {
  const config = CHANGE_FORMS[screen.id];
  const flow = state.screen.flow;
  bindFormBehaviors(root, config, flow);
  const fundInputs = bindFundTotal(root);
  if (config.custom === 'fund') bindFundExtras(root, flow);
  if (config.custom === 'notice') bindNoticeSettings(root, flow);

  const nextButton = $('#next', root);
  if (!nextButton) return;
  nextButton.onclick = () => {
    if (config.fields) {
      Object.assign(flow.values, readFieldValues(root, config.fields));
      if (!validateFields(root, config.fields, flow.values)) return;
    }
    if (fundInputs.length && fundTotal(fundInputs) !== 100) return toast('변경 후 비율 합계를 100%로 맞춰 주세요.');
    if (config.agree && flow.agreed.length < config.agree.length) {
      $('#agrErr', root).textContent = '필수 확인 항목에 체크해 주세요.';
      return;
    }
    if (config.custom === 'fund') return submitFundChange(flow);
    chooseSignMethod(screen, () => completeSingleForm(flow));
  };
}

/** 단일폼 변경 완료 화면으로 */
export function completeSingleForm(flow) {
  flow.phase = 'edit';
  flow.step = 1;
  rerenderScreen();
  scrollToTop();
  toast('변경되었습니다.');
}
