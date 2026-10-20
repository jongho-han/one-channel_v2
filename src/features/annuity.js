import { $, $$, each, escapeHtml, focusElement } from '../core/dom.js';
import { formatWon } from '../core/format';
import { CONTRACTS, insuredLabel } from '../data/customerRepository';
import { state } from '../state/store';

/* 보험기간/연금개시연도 변경 (CH-05): 연금 계약 카드를 라디오로 선택 ------ */
export const ANNUITY_AGE_RANGE = [55, 80];
const ANNUITY_AGE_CHOICES = [55, 60, 62, 65, 70, 75, 80];

export const pickedAnnuityContract = () => {
  const key = state.screen.flow?.pick;
  return key ? CONTRACTS.find(contract => contract.no === key) : null;
};

/** 개시 나이 → '62세 (2040.11.20 개시)' (현재 나이는 빼서 같은 값으로 변경하지 않게) */
export function annuityAgeOptions(contract) {
  const [year, month, day] = contract.annuityDate.split('.');
  return ANNUITY_AGE_CHOICES
    .filter(age => age !== contract.annuityAge)
    .map(age => `${age}세 (${Number(year) + age - contract.annuityAge}.${month}.${day} 개시)`);
}

function annuityContractCard(contract, isOn) {
  const id = `ap-${contract.no}`;
  return `
  <label class="loan-card annuity-card ${isOn ? 'on' : ''}" for="${id}">
    <div class="lc-head">
      <input type="radio" class="lc-radio" name="annuityPick" id="${id}" value="${contract.no}" ${isOn ? 'checked' : ''}>
      <span class="lc-name"><b>${escapeHtml(contract.name)}</b><small class="num">증권번호 ${contract.no} · 피보험자 ${escapeHtml(insuredLabel(contract))}</small></span>
    </div>
    <dl>
      <div><dt>현재 연금개시</dt><dd class="num">${contract.annuityAge}세 (${contract.annuityDate})</dd></div>
      <div><dt>납입 현황</dt><dd class="num">${contract.paidCount}/${contract.totalCount}회 (${contract.payEnd} 완료)</dd></div>
      <div><dt>적립금(해지환급금)</dt><dd class="num">${formatWon(contract.surrender)}</dd></div>
    </dl>
  </label>`;
}

export function renderAnnuityPickStep(screen, config, flow) {
  const contracts = CONTRACTS.filter(contract => contract.isAnnuity);
  return `
  <div class="card">
    <h2 id="pickTitle">${config.pick.label}</h2>
    <p class="sub-desc">연금이 아직 개시되지 않은 계약만 보여 드립니다.</p>
    <div class="loan-list" role="radiogroup" aria-labelledby="pickTitle" aria-describedby="pickErr">
      ${each(contracts, contract => annuityContractCard(contract, flow.pick === contract.no))}
    </div>
    <p class="err" id="pickErr" role="alert"></p>
  </div>
  <div class="navrow">
    <button class="btn lg" data-action="back">취소</button>
    <button class="btn pri lg" id="next">다음</button>
  </div>`;
}

export function bindAnnuityPickStep(root, flow) {
  $$('input[name="annuityPick"]', root).forEach(radio => {
    radio.onchange = () => {
      if (flow.pick !== radio.value) delete flow.values.age;   // 계약을 바꾸면 고른 나이는 초기화
      flow.pick = radio.value;
      $$('.annuity-card', root).forEach(card => card.classList.toggle('on', card.contains(radio)));
      $('#pickErr', root).textContent = '';
    };
  });
}

export function validateAnnuityPick(root, flow) {
  if (flow.pick) return true;
  $('#pickErr', root).textContent = '연금개시 나이를 바꿀 계약을 선택해 주세요.';
  focusElement($('input[name="annuityPick"]', root));
  return false;
}


/* 연금개시유형 선택/변경 (CH-07) 선택조건 ------------------------------------
   연금유형에 따라 일부 항목은 값이 고정됨(lockRules) → 고정 항목은 다른 선택지를 숨기고 고정값만 보여줌 */
export const NOT_APPLICABLE = '해당없음';
export const ANNUITY_OPTION_FIELDS = [
  { id: 'type',   label: '연금유형',            type: 'radio', wide: true, options: ['종신연금', '확정연금', '상속연금(종신)'] },
  { id: 'payee',  label: '개인형/부부형',        type: 'radio', options: ['개인형', '부부형'] },
  { id: 'ratio',  label: '연금비율',            type: 'radio', options: ['50%', '80%', '100%'], value: '100%' },
  { id: 'growth', label: '체증형태',            type: 'radio', options: ['정액형', '체증형'] },
  { id: 'gTerm',  label: '체증기간',            type: 'radio', options: ['5년', '10년', NOT_APPLICABLE] },
  { id: 'gRate',  label: '체증율',              type: 'radio', options: ['5%', '10%', NOT_APPLICABLE] },
  { id: 'fixed',  label: '확정기간',            type: 'radio', options: ['10년', '15년', '20년', NOT_APPLICABLE] },
  { id: 'guar',   label: '보증기간',            type: 'radio', wide: true, options: ['10년', '20년', '80세', '100세', NOT_APPLICABLE] },
  { id: 'cycle',  label: '지급주기',            type: 'radio', wide: true, options: ['1개월', '3개월', '6개월', '매년'] },
  { id: 'early',  label: '조기집중형보장배수',   type: 'radio', wide: true, options: ['1.5배', '2배', '3배'] },
];

/** 현재 선택값 → 고정할 항목 { 항목id: [고정값, 사유] } */
export function annuityLockRules(values) {
  const locks = {};
  const lock = (ids, value, reason) => ids.forEach(id => { locks[id] = [value, reason]; });
  const byType = `${values.type} 선택 시`;
  if (values.type === '종신연금') lock(['fixed'], NOT_APPLICABLE, byType);
  if (values.type === '확정연금') {
    lock(['growth'], '정액형', byType);
    lock(['gTerm', 'gRate', 'guar'], NOT_APPLICABLE, byType);
  }
  if (values.type === '상속연금(종신)') {
    lock(['growth'], '정액형', byType);
    lock(['gTerm', 'gRate', 'fixed', 'guar'], NOT_APPLICABLE, byType);
  }
  /* 종신연금에서 정액형을 고르면 체증기간·체증율은 의미가 없으므로 해당없음 */
  if (!locks.growth && values.growth === '정액형') lock(['gTerm', 'gRate'], NOT_APPLICABLE, '정액형 선택 시');
  return locks;
}

/** 선택 요약 + 회당 예상 연금액(예시) */
export function annuityOptionCalc(values) {
  const v = { ...values };
  const base = { '종신연금': 1032000, '상속연금(종신)': 746000,
                 '확정연금': { '10년': 2050000, '15년': 1420000, '20년': 1168000 }[v.fixed] || 1168000 }[v.type || '종신연금'];
  const coupleFactor = v.payee === '부부형' ? { '50%': 0.95, '80%': 0.92, '100%': 0.88 }[v.ratio] || 0.88 : 1;
  const guarFactor = { '10년': 1, '20년': 0.98, '80세': 0.97, '100세': 0.93 }[v.guar] || 1;
  const growthFactor = v.growth === '체증형' ? (v.gRate === '10%' ? 0.78 : 0.88) : 1;
  const months = { '1개월': 1, '3개월': 3, '6개월': 6, '매년': 12 }[v.cycle] || 1;
  const monthly = Math.round(base * coupleFactor * guarFactor * growthFactor / 100) * 100;
  const shape = [v.type, v.payee, v.payee === '부부형' ? `연금비율 ${v.ratio}` : '', v.growth].filter(Boolean).join(' · ');
  return [
    ['선택한 연금형태', shape],
    ['지급주기', v.cycle || '1개월'],
    ['월 환산 예상액(예시)', formatWon(monthly)],
    [`회당 예상 연금액(${v.cycle || '1개월'})`, formatWon(monthly * months), true],
  ];
}
