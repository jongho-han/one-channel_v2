import { APP } from '../core/config.js';
import { $, $$, each, escapeHtml, focusElement, scrollToTop, when } from '../core/dom.js';
import { clockTime, receiptNo } from '../core/format.js';
import { RETENTION_OPTIONS } from '../data/homeContent.js';
import { bindFormBehaviors, displayValue, isFieldVisible, readFieldValues, renderField, validateFields } from '../form/formEngine.js';
import { rerenderScreen } from '../pages/screen.js';
import { STEP_FLOWS } from '../screens/stepFlows.js';
import { SIGN_METHODS, signAndConfirm } from '../services/auth.js';
import { state } from '../state/store.js';
import { icon } from '../ui/icons.js';
import { agreementList, calcBox, doneCard, infoBox, keyValueList, stepper } from '../ui/widgets.js';

/* T3 단계형 신청: 선택 → 입력 → 확인 → 인증 → 완료 ---------------------- */
export function stepsOf(config) {
  return [...(config.pick ? ['선택'] : []), '입력', ...(config.skipConfirm ? [] : ['확인']), '인증', '완료'];
}

function currentFlow() {
  return (state.screen.flow ??= { step: 0, pick: null, values: {}, agreed: [] });
}

export function renderStepFlow(screen) {
  const config = STEP_FLOWS[screen.id];
  const flow = currentFlow();
  const steps = stepsOf(config);
  const renderStep = {
    '선택': stepPick, '입력': stepInput, '확인': stepConfirm, '인증': stepSign, '완료': stepDone,
  }[steps[flow.step]];

  return stepper(steps, flow.step) + renderStep(screen, config, flow);
}



const pickedItem = (config, flow) => config.pick?.items?.().find(item => item.key === flow.pick);

/* 선택 단계는 기본(카드 하나 고르기) 외에 화면별 맞춤 단계도 쓸 수 있음
   pick.render(screen, config, flow) · pick.bind(root, flow) · pick.validate(root, flow)
   pick.onPick(flow, key): 카드를 고를 때 · pick.describe(flow): 입력 단계 상단 안내 · pick.summary(flow, step): 확인·완료 단계 카드 */
function stepPick(screen, config, flow) {
  if (config.pick.render) return config.pick.render(screen, config, flow);
  return `
  <div class="card"><h2 id="pickTitle">${config.pick.label}</h2><div class="picks" role="group" aria-labelledby="pickTitle">
    ${each(config.pick.items(), item => `
      <button class="pick ${flow.pick === item.key ? 'on' : ''}" aria-pressed="${flow.pick === item.key}" data-action="pick" data-key="${item.key}">
        <span class="rd" aria-hidden="true"></span>
        <span class="pm"><b>${escapeHtml(item.title)}</b><small class="num">${escapeHtml(item.sub)}</small></span>
        <span class="pv num">${escapeHtml(item.value)}</span>
      </button>`)}
  </div></div>
  ${when(config.retain, retentionOptions())}
  <div class="navrow">
    <button class="btn lg" data-action="back">취소</button>
    <button class="btn pri lg" id="next" ${flow.pick ? '' : 'disabled'} aria-describedby="pickHint">다음</button>
    <span class="sr-only" id="pickHint">${flow.pick ? '' : '먼저 위에서 하나를 선택해야 다음 단계로 갈 수 있습니다.'}</span>
  </div>`;
}

function stepInput(screen, config, flow) {
  const picked = pickedItem(config, flow);
  const intro = config.intro;
  return `
  ${picked ? infoBox('ok', 'check', `<b>${escapeHtml(picked.title)}</b>${escapeHtml(picked.sub)} · ${escapeHtml(picked.value)}`, 'mb-14') : ''}
  ${config.pick?.describe ? infoBox('ok', 'check', config.pick.describe(flow), 'mb-14') : ''}
  ${intro ? infoBox(intro.tone, intro.tone === 'warn' ? 'alert' : 'info', `<b>${intro.title}</b>${intro.desc}`, 'mb-14') : ''}
  ${config.fields.length
    ? `<div class="card"><h2>입력하기</h2><div class="form${config.compact ? ' compact' : ''}" id="frm">${each(config.fields, field => renderField(field, flow.values, config.fields))}</div></div>`
    : '<div id="frm"></div>'}
  ${when(config.calc, '<div class="mt-14" id="calc" aria-live="polite"></div>')}
  ${when(config.warn, infoBox('warn', 'alert', config.warn, 'mt-14'))}
  ${config.agree ? agreementList(config.agree, flow.agreed) : ''}
  <div class="navrow">
    <button class="btn lg" data-action="step-prev">이전</button>
    <button class="btn pri lg" id="next">다음</button>
  </div>`;
}

function stepConfirm(screen, config, flow) {
  const picked = pickedItem(config, flow);
  const rows = [];
  if (picked) rows.push([config.pick.label.replace(/을 선택하세요|를 선택하세요/, ''), picked.title]);
  for (const field of config.fields.filter(item => isFieldVisible(item, config.fields, flow.values))) rows.push([field.label, displayValue(field, flow.values) || '-']);

  return `
  ${config.pick?.summary ? config.pick.summary(flow, 'confirm') : ''}
  <div class="card"><h2>신청 내용을 확인해 주세요</h2>${keyValueList(rows)}</div>
  ${config.calc ? `<div class="mt-14">${calcBox(config.calc(flow.values, flow.pick))}</div>` : ''}
  <div class="navrow">
    <button class="btn lg" data-action="step-prev">수정</button>
    <button class="btn pri lg" id="next">신청 내용이 맞습니다</button>
  </div>`;
}

function stepSign(screen) {
  const needsExtraAuth = screen.authLevel === 'A2';
  return `
  <div class="card sign-card">
    <div class="donebox"><div class="ck">${icon(needsExtraAuth ? 'lock' : 'key')}</div></div>
    <h2>${needsExtraAuth ? '전자서명 + 휴대폰 추가인증' : '전자서명'}</h2>
    <p>${needsExtraAuth ? '본인 계좌로 돈이 오가는 업무라 인증서 서명 후 휴대폰 인증을 한 번 더 진행합니다.' : '신청 내용에 인증서로 서명하면 접수가 완료됩니다.'}</p>
    <div class="auth-grid">
      ${each(SIGN_METHODS, method => `<button class="auth-opt" data-auth="${method.name}"><b>${method.name}</b><small>${method.desc}</small></button>`)}
    </div>
  </div>
  <div class="navrow"><button class="btn lg" data-action="step-prev">이전</button></div>`;
}

function stepDone(screen, config, flow) {
  flow.receiptNo ??= receiptNo(config.receiptPrefix || 'R2610');
  const totals = config.calc ? config.calc(flow.values, flow.pick).filter(([, , isTotal]) => isTotal) : [];
  const [nextLabel, nextScreenId] = config.doneNext || ['내 계약 보기', 'CT-01'];

  return `
  ${doneCard({
    title: config.doneTitle?.(flow.values) || (screen.bizType === '지급' ? '신청이 완료되었습니다' : '처리가 완료되었습니다'),
    message: typeof config.done === 'function' ? config.done(flow.values) : config.done,
    rows: [['접수번호', flow.receiptNo], ['접수일시', `${APP.today} ${clockTime()}`], ...totals.map(([label, value]) => [label, value]), ['안내', escapeHtml(config.doneGuide?.(flow.values) || screen.result), true]],
  })}
  ${config.pick?.summary ? config.pick.summary(flow, 'done') : ''}
  ${config.doneExtra ? config.doneExtra(flow) : ''}
  <div class="navrow inline">
    <button class="btn lg" data-action="nav" data-page="home">홈으로</button>
    <button class="btn pri lg" data-action="open" data-id="${nextScreenId}">${nextLabel}</button>
  </div>`;
}

/** 해지 전에 먼저 보여주는 대안 (대출 · 감액완납 · 자동대출납입) */
function retentionOptions() {
  return `
  <div class="card retain-card">
    <h2>해지하기 전에 이런 방법도 있어요</h2>
    <p>보장은 그대로 두고 필요한 문제만 해결할 수 있습니다.</p>
    <div class="retain">
      ${each(RETENTION_OPTIONS, ([title, desc, id]) => `<button data-action="open" data-id="${id}"><b>${title}</b><small>${desc}</small></button>`)}
    </div>
  </div>`;
}



export function bindStepFlow(screen, root) {
  const config = STEP_FLOWS[screen.id];
  const flow = currentFlow();
  const stepName = stepsOf(config)[flow.step];
  const goNext = () => { flow.step++; showNextStep(); };

  bindFormBehaviors(root, config, flow);

  if (stepName === '인증') {
    $$('[data-auth]', root).forEach(button => {
      button.onclick = () => signAndConfirm(screen, button.dataset.auth, goNext);
    });
    return;
  }

  if (stepName === '선택') config.pick.bind?.(root, flow);

  const nextButton = $('#next', root);
  if (!nextButton) return;
  nextButton.onclick = () => {
    if (stepName === '선택' && config.pick.validate && !config.pick.validate(root, flow)) return;
    if (stepName === '입력' && !isInputStepValid(root, config, flow)) return;
    goNext();
  };
}

function isInputStepValid(root, config, flow) {
  Object.assign(flow.values, readFieldValues(root, config.fields));
  if (!validateFields(root, config.fields, flow.values)) return false;
  if (config.agree && flow.agreed.length < config.agree.length) {
    $('#agrErr', root).textContent = '필수 확인 항목에 모두 체크해 주세요.';
    $('#agr', root).scrollIntoView({ behavior: 'smooth', block: 'center' });
    focusElement($('#agr input:not(:checked)', root));
    return false;
  }
  return true;
}

/** 단계를 옮긴 뒤 초점을 '현재 단계'로 옮겨 화면낭독기가 새 단계를 읽게 함 */
export function showNextStep() {
  rerenderScreen();
  scrollToTop();
  focusElement($('#currentStep') || $('#main h1'));
}
