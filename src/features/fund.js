import { APP } from '../core/config';
import { $, $$, each, escapeHtml, focusElement, scrollToTop } from '../core/dom.js';
import { formatWon, nextDay, parseYmd } from '../core/format';
import { FUND_GRADE_NAMES, INVEST_PROFILES, SUITABILITY, SUITABILITY_QUESTIONS } from '../data/fundRepository.js';
import { rerenderScreen } from '../pages/screen.js';
import { state } from '../state/store.js';
import { announce, openModal, toast } from '../ui/overlay.js';
import { infoBox, summaryTiles } from '../ui/widgets.js';
import { activeFunds, selectedVariableContract, variableContractTabs } from './variableContract.js';

/* 변액보험 펀드변경 (CH-01) + 적합성진단 -------------------------
   변경하기 → 진단 필요 판단
     조건1) 마지막 적합성진단 후 3년 경과   조건2) 변경 후 포트폴리오 위험이 현재 투자성향 범위를 넘음
   → 둘 다 아니면 바로 인증 / 하나라도 맞으면 안내 후 적합성진단
   → 진단 결과로 변경 가능하면 인증 후 변경, 불가하면 불가 안내(익일 재진행)            */
const fundGradeOf   = risk => Number(String(risk).match(/\d/)[0]);      // '4등급(보통위험)' → 4 (숫자가 작을수록 위험)
const profileByName = name => INVEST_PROFILES.find(profile => profile.name === name);


function currentFundRatios(flow) {
  return activeFunds().map(([, ratio], index) => flow.fundRatios?.[index] ?? ratio);
}

/** 편입비율 가중평균 위험등급 (반올림) */
function portfolioGrade(ratios) {
  const total = ratios.reduce((sum, ratio) => sum + ratio, 0) || 1;
  const average = activeFunds().reduce((sum, fund, index) => sum + fundGradeOf(fund[3]) * ratios[index], 0) / total;
  return { average, grade: Math.round(average) };
}
/** 이 위험등급에 투자하려면 필요한 최소 투자성향 */
const requiredProfileFor = grade => INVEST_PROFILES.find(profile => grade >= profile.minGrade);
const gradeLabel = grade => `${grade}등급(${FUND_GRADE_NAMES[grade]})`;
const investableRange = profileName => `${gradeLabel(profileByName(profileName).minGrade)}까지`;

function suitabilityCheck(ratios) {
  const today = parseYmd(APP.today);
  const expiry = parseYmd(SUITABILITY.diagnosedAt);
  expiry.setFullYear(expiry.getFullYear() + 3);
  const { grade } = portfolioGrade(ratios);
  const profile = profileByName(SUITABILITY.profile);
  const required = requiredProfileFor(grade);
  const reasons = [];
  if (today >= expiry) reasons.push(`마지막 적합성진단(${SUITABILITY.diagnosedAt}) 후 3년이 지났습니다.`);
  if (required.level > profile.level) reasons.push(`변경 후 편입비율의 위험이 ${gradeLabel(grade)}으로, 현재 투자성향 ${profile.name}의 투자 가능 범위인 ${investableRange(profile.name)}를 넘습니다.`);
  return { grade, profile, required, reasons };
}

export function fundAllocationBody(flow) {
  if (flow.phase === 'diagnose') return suitabilityQuestionsView(flow);
  if (flow.phase === 'result')   return suitabilityResultView(flow);
  if (flow.phase === 'compare')  return fundCompareView(flow);
  const ratios = currentFundRatios(flow);
  return `
  ${variableContractTabs()}
  ${summaryTiles([['적립금', formatWon(selectedVariableContract().variable.reserve)], ['올해 남은 변경', `${selectedVariableContract().variable.fundChangesLeft}회`], ['투자성향', SUITABILITY.profile]])}
  <p class="suit-meta">최근 적합성진단 <b class="num">${SUITABILITY.diagnosedAt}</b> · 투자 가능 범위 <b>${investableRange(SUITABILITY.profile)}</b></p>
  <div class="card"><h2>펀드 편입비율 변경</h2>
    <div class="tbl-wrap plain fundtbl"><table class="tbl min-520">
      <thead><tr><th>펀드</th><th>위험등급</th><th class="r">1년 수익률</th><th class="r">현재</th><th class="r">변경 후</th></tr></thead>
      <tbody>
        ${each(activeFunds(), ([name, ratio, yieldRate, risk], index) => `
          <tr><td>${name}</td><td class="sub">${risk}</td><td class="r num">${yieldRate}</td><td class="r num">${ratio}%</td>
            <td class="r"><input class="inp num" id="fd${index}" data-fund inputmode="numeric" value="${ratios[index]}" aria-label="${name} 변경 후 비율"> %</td></tr>`)}
      </tbody>
    </table></div>
    <div class="sumline" aria-live="polite">합계 <span class="num" id="fsum">100%</span></div>
    <div class="risk-line" id="riskLine" aria-live="polite"></div>
    <div class="toggle-row divided">
      <div><b>자동재배분</b><small>3개월마다 지정한 비율로 자동 조정합니다.</small></div>
      <label class="tg"><input type="checkbox" id="rebal" aria-label="자동재배분" ${flow.rebalance ? 'checked' : ''}><span></span></label>
    </div>
  </div>
  ${infoBox('warn', 'alert', '변액보험은 투자 실적에 따라 원금 손실이 발생할 수 있습니다. 마지막 적합성진단 후 3년이 지났거나, 변경 후 편입비율이 투자성향보다 위험하면 적합성진단을 먼저 진행합니다.', 'mt-14')}
  <div id="frm"></div>`;
}

/** 변경 후 포트폴리오 위험등급을 실시간으로 보여줌 */
function updateRiskLine(root, flow) {
  const line = $('#riskLine', root);
  if (!line) return;
  const ratios = currentFundRatios(flow);
  if (ratios.reduce((sum, ratio) => sum + ratio, 0) !== 100) { line.innerHTML = ''; return; }
  const { average, grade } = portfolioGrade(ratios);
  const profile = profileByName(SUITABILITY.profile);
  const fits = requiredProfileFor(grade).level <= profile.level;
  line.className = `risk-line ${fits ? 'ok' : 'over'}`;
  line.innerHTML = `변경 후 포트폴리오 위험 <b>${gradeLabel(grade)}</b> <span class="num">(가중평균 ${average.toFixed(1)})</span> · ${fits
    ? `현재 투자성향(${profile.name}) 범위 안입니다.`
    : `현재 투자성향(${profile.name})보다 위험합니다. 변경하려면 적합성진단이 필요합니다.`}`;
}

function suitabilityQuestionsView(flow) {
  const answers = flow.suitAnswers || {};
  return `
  <div class="card">
    <h2 id="phaseTitle" tabindex="-1">투자자 적합성진단</h2>
    <p class="sub-desc">모든 문항에 답하면 투자성향이 정해집니다. 진단 결과는 오늘부터 3년간 적용됩니다.</p>
    <ol class="suit-qs">
      ${each(SUITABILITY_QUESTIONS, ([question, options], qIndex) => `
        <li class="suit-q" id="sq${qIndex}">
          <fieldset aria-describedby="sqErr${qIndex}">
            <legend><span class="num">${qIndex + 1}.</span> ${question}</legend>
            <div class="radios col">
              ${each(options, ([text, score], oIndex) => `<label><input type="radio" name="sq${qIndex}" value="${score}" data-q="${qIndex}" ${answers[qIndex] === oIndex ? 'checked' : ''} data-o="${oIndex}">${text}</label>`)}
            </div>
            <p class="err" id="sqErr${qIndex}"></p>
          </fieldset>
        </li>`)}
    </ol>
  </div>
  <div class="navrow">
    <button class="btn lg" data-action="suit-edit">이전</button>
    <button class="btn pri lg" data-action="suit-submit">진단 결과 보기</button>
  </div>`;
}

function suitabilityResultView(flow) {
  const { result } = flow;
  const head = result.ok
    ? infoBox('ok', 'check', `<b>변경 후 편입비율로 변경할 수 있습니다</b>진단 결과 투자성향(${result.profile})으로 ${gradeLabel(result.grade)} 포트폴리오에 투자할 수 있습니다. 변경 전후 내용을 확인한 뒤 인증하면 변경됩니다.`)
    : infoBox('warn', 'alert', `<b>변경 후 편입비율로 변경할 수 없습니다</b>진단 결과 투자성향(${result.profile})으로는 ${gradeLabel(result.grade)} 포트폴리오에 투자할 수 없습니다. 오늘은 적합성진단을 다시 할 수 없으며, <b class="inl">${nextDay(APP.today)}(익일) 이후 다시 진행</b>해 주세요.`);
  return `
  <div class="card">
    <h2 id="phaseTitle" tabindex="-1">적합성진단 결과</h2>
    <dl class="kv">
      <dt>진단일</dt><dd class="num">${APP.today}</dd>
      <dt>투자성향</dt><dd><b>${result.profile}</b> (${result.score}점)</dd>
      <dt>투자 가능 범위</dt><dd>${investableRange(result.profile)}</dd>
      <dt>변경 후 포트폴리오</dt><dd>${gradeLabel(result.grade)}</dd>
    </dl>
  </div>
  <div class="mt-14">${head}</div>
  <div class="navrow">
    ${result.ok
      ? `<button class="btn lg" data-action="suit-edit">비율 다시 보기</button><button class="btn pri lg" data-action="fund-compare">변경 내용 확인</button>`
      : `<button class="btn lg" data-action="nav" data-page="home">홈으로</button><button class="btn pri lg" data-action="suit-edit">편입비율 다시 조정</button>`}
  </div>`;
}

/** 변경하기: 진단이 필요한지 판단 */
export function submitFundChange(flow) {
  const ratios = currentFundRatios(flow);
  if (!hasFundChange(flow)) return toast('변경된 내용이 없습니다. 변경 후 비율이나 자동재배분을 바꿔 주세요.');
  const check = suitabilityCheck(ratios);
  if (!check.reasons.length) return showFundPhase('compare');

  if (SUITABILITY.failedOn === APP.today) {
    return openModal(`
      <h2>오늘은 적합성진단을 다시 할 수 없습니다</h2>
      <p>오늘 진행한 적합성진단 결과(${SUITABILITY.profile})로는 변경 후 편입비율(${gradeLabel(check.grade)})에 투자할 수 없습니다.</p>
      ${infoBox('warn', 'alert', `${nextDay(APP.today)}(익일) 이후 적합성진단을 다시 진행해 주세요. 투자성향 범위 안으로 비율을 조정하면 바로 변경할 수 있습니다.`)}
      <button class="btn pri block mt-16" data-action="close-modal">확인</button>`);
  }

  openModal(`
    <h2>적합성진단이 필요합니다</h2>
    <p>아래 사유로 펀드를 변경하기 전에 투자자 적합성진단을 먼저 진행합니다.</p>
    <ul class="reason-list">${each(check.reasons, reason => `<li>${reason}</li>`)}</ul>
    <div class="navrow inline mt-16">
      <button class="btn lg" data-action="close-modal">취소</button>
      <button class="btn pri lg" data-action="suit-start">적합성진단 시작</button>
    </div>`);
}

function scoreToProfile(score) {
  return INVEST_PROFILES.find(profile => score <= profile.maxScore) || INVEST_PROFILES[INVEST_PROFILES.length - 1];
}

const FUND_REBALANCE_BEFORE = false;   // 현재 자동재배분 신청 여부 (샘플)
const FUND_BAR_COLORS = ['#00754A', '#2558C4', '#8F5800', '#6B7A8C', '#7A3FB0', '#B0413E'];

function hasFundChange(flow) {
  const after = currentFundRatios(flow);
  const ratioChanged = activeFunds().some(([, before], index) => before !== after[index]);
  return ratioChanged || Boolean(flow.rebalance) !== FUND_REBALANCE_BEFORE;
}

/** 편입비율 막대 (시각 보조용 · 같은 내용은 표로 제공) */
const allocationBar = ratios => `
  <div class="alloc-bar" aria-hidden="true">${each(activeFunds(), (fund, index) => ratios[index]
    ? `<span style="width:${ratios[index]}%;background:${FUND_BAR_COLORS[index]}"></span>` : '')}</div>`;

function changeBadge(delta) {
  if (!delta) return '<span class="delta same" aria-hidden="true">–</span><span class="sr-only">변동 없음</span>';
  return delta > 0
    ? `<span class="delta up">▲ ${delta}%p<span class="sr-only"> 증가</span></span>`
    : `<span class="delta down">▼ ${-delta}%p<span class="sr-only"> 감소</span></span>`;
}

/** 변경 전후 비교 → 최종 인증 */
function fundCompareView(flow) {
  const before = activeFunds().map(([, ratio]) => ratio);
  const after = currentFundRatios(flow);
  const beforeGrade = portfolioGrade(before).grade;
  const afterGrade = portfolioGrade(after).grade;
  const rows = activeFunds().map(([name, , , risk], index) => ({ name, risk, before: before[index], after: after[index], delta: after[index] - before[index] }))
    .filter(row => row.before || row.after);
  const onOff = value => (value ? '신청' : '미신청');

  return `
  <div class="card">
    <h2 id="phaseTitle" tabindex="-1">변경 전후 비교</h2>
    <p class="sub-desc">아래 내용으로 펀드 편입비율을 변경합니다. 확인 후 인증해 주세요.</p>
    <div class="alloc-compare">
      <div class="alloc-row"><span class="alloc-lb">변경 전</span>${allocationBar(before)}</div>
      <div class="alloc-row"><span class="alloc-lb">변경 후</span>${allocationBar(after)}</div>
      <ul class="alloc-legend" aria-hidden="true">${each(activeFunds(), ([name], index) => (before[index] || after[index])
        ? `<li><i style="background:${FUND_BAR_COLORS[index]}"></i>${name}</li>` : '')}</ul>
    </div>
    <div class="tbl-wrap plain"><table class="tbl cmp-tbl">
      <caption class="sr-only">펀드별 변경 전후 편입비율</caption>
      <thead><tr><th scope="col">펀드 (위험등급)</th><th scope="col" class="r">변경 전</th><th scope="col" class="r">변경 후</th><th scope="col" class="r dcol">증감</th></tr></thead>
      <tbody>
        ${each(rows, row => `
          <tr class="${row.delta ? 'changed' : ''}"><th scope="row">${row.name}<small>${row.risk}</small></th>
            <td class="r num">${row.before}%</td><td class="r num"><b>${row.after}%</b><span class="delta-inline">${changeBadge(row.delta)}</span></td><td class="r dcol">${changeBadge(row.delta)}</td></tr>`)}
      </tbody>
      <tfoot><tr><th scope="row">합계</th><td class="r num">100%</td><td class="r num"><b>100%</b></td><td class="dcol"></td></tr></tfoot>
    </table></div>
  </div>
  <div class="card">
    <h2>함께 바뀌는 내용</h2>
    <dl class="kv cmp-kv">
      <dt>포트폴리오 위험등급</dt><dd>${gradeLabel(beforeGrade)} → <b>${gradeLabel(afterGrade)}</b></dd>
      <dt>투자성향</dt><dd>${SUITABILITY.profile} <span class="sub">(진단일 ${SUITABILITY.diagnosedAt} · ${investableRange(SUITABILITY.profile)})</span></dd>
      <dt>자동재배분</dt><dd>${onOff(FUND_REBALANCE_BEFORE)} → <b>${onOff(flow.rebalance)}</b></dd>
      <dt>대상 계약</dt><dd>${escapeHtml(selectedVariableContract().name)}</dd>
      <dt>올해 남은 변경 횟수</dt><dd class="num">${selectedVariableContract().variable.fundChangesLeft}회 → <b>${selectedVariableContract().variable.fundChangesLeft - 1}회</b></dd>
      <dt>적용 기준가</dt><dd>접수일 다음 영업일 기준가</dd>
    </dl>
  </div>
  ${infoBox('warn', 'alert', '변액보험은 투자 실적에 따라 원금 손실이 발생할 수 있으며, 변경 후 수익률은 보장되지 않습니다.', 'mt-14')}
  <div class="navrow">
    <button class="btn lg" data-action="suit-edit">이전</button>
    <button class="btn pri lg" data-action="fund-sign">인증 후 변경</button>
  </div>`;
}

export function showFundPhase(phase) {
  state.screen.flow.phase = phase;
  rerenderScreen();
  scrollToTop();
  focusElement($('#phaseTitle') || $('#main h1'));
}

export function bindFundExtras(root, flow) {
  if (flow.phase === 'diagnose') {
    $$('input[data-q]', root).forEach(radio => radio.addEventListener('change', () => {
      (flow.suitAnswers ??= {})[radio.dataset.q] = Number(radio.dataset.o);
      $('#sqErr' + radio.dataset.q, root).textContent = '';
    }));
    return;
  }
  if (flow.phase === 'result') return;
  $$('[data-fund]', root).forEach((input, index) => input.addEventListener('input', () => {
    (flow.fundRatios ??= currentFundRatios(flow))[index] = Number(input.value) || 0;
    updateRiskLine(root, flow);
  }));
  const rebalance = $('#rebal', root);
  if (rebalance) rebalance.onchange = () => { flow.rebalance = rebalance.checked; };
  updateRiskLine(root, flow);
}


export const fundTotal = inputs => inputs.reduce((sum, input) => sum + (Number(input.value) || 0), 0);

/** 펀드 비율 합계를 실시간으로 보여주고 100%가 아니면 빨간색으로 */
export function bindFundTotal(root) {
  const inputs = $$('[data-fund]', root);
  if (!inputs.length) return inputs;
  const totalLabel = $('#fsum', root);
  const update = () => {
    const total = fundTotal(inputs);
    totalLabel.textContent = total === 100 ? '100%' : `${total}% (100%로 맞춰 주세요)`;   // 색에만 의존하지 않도록 글자로도 안내
    totalLabel.className = `num ${total === 100 ? 'is-valid' : 'is-invalid'}`;
  };
  inputs.forEach(input => { input.oninput = update; });
  update();
  return inputs;
}

/** 적합성진단 제출: 모든 문항 확인 → 투자성향 산정 → 변경 가능 여부 판단 */
export function submitSuitability() {
  const flow = state.screen.flow;
  const answers = flow.suitAnswers || {};
  const missing = SUITABILITY_QUESTIONS.map((_, index) => index).filter(index => answers[index] === undefined);
  missing.forEach(index => { $('#sqErr' + index).textContent = '답을 선택해 주세요.'; });
  if (missing.length) {
    announce(`${missing.length}개 문항에 답하지 않았습니다.`);
    return focusElement($(`#sq${missing[0]} input`));
  }
  const score = SUITABILITY_QUESTIONS.reduce((sum, [, options], index) => sum + options[answers[index]][1], 0);
  const profile = scoreToProfile(score);
  const { grade } = portfolioGrade(currentFundRatios(flow));
  const ok = requiredProfileFor(grade).level <= profile.level;
  Object.assign(SUITABILITY, { profile: profile.name, diagnosedAt: APP.today, failedOn: ok ? null : APP.today });
  flow.result = { ok, profile: profile.name, score, grade };
  showFundPhase('result');
}
