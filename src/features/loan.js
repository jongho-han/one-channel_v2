import { $, $$, each, escapeHtml, when } from '../core/dom.js';
import { formatWon, toNumber } from '../core/format';
import { CONTRACTS } from '../data/customerRepository.js';
import { renderField, validateFields } from '../form/formEngine.js';
import { announce } from '../ui/overlay.js';
import { summaryTiles } from '../ui/widgets.js';

/* 보험계약대출 (LN-02): 신청금액을 이율이 낮은 계약부터 나눠 배정 ----- */
const LOAN_MIN_AMOUNT = 100000;
export const loanAvailable   = contract => contract.loanLimit - contract.loan;
const formatRate      = rate => `연 ${(rate * 100).toFixed(2)}%`;
const monthlyInterest = (amount, rate) => Math.round(amount * rate / 12);

/** 대출 가능한 계약을 이율이 낮은 순서로 */
function loanableContracts() {
  return CONTRACTS.filter(contract => loanAvailable(contract) > 0).sort((a, b) => a.loanRate - b.loanRate);
}
const totalLoanAvailable = () => loanableContracts().reduce((sum, contract) => sum + loanAvailable(contract), 0);

/** 신청금액을 낮은 이율 계약부터 가능금액만큼 채워 배정 → [{ contract, available, amount }] */
function allocateLoan(requested) {
  let remaining = requested;
  return loanableContracts().map(contract => {
    const available = loanAvailable(contract);
    const amount = Math.min(available, Math.max(remaining, 0));
    remaining -= amount;
    return { contract, available, amount };
  });
}
const executedLoans = requested => allocateLoan(requested).filter(loan => loan.amount > 0);

function loanTotals(requested) {
  const loans = executedLoans(requested);
  const amount = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const interest = loans.reduce((sum, loan) => sum + monthlyInterest(loan.amount, loan.contract.loanRate), 0);
  const averageRate = amount ? loans.reduce((sum, loan) => sum + loan.amount * loan.contract.loanRate, 0) / amount : 0;
  return { loans, amount, interest, averageRate };
}

const loanAmountField = () => ({
  id: 'loanAmount', label: '대출 신청금액', type: 'money', min: LOAN_MIN_AMOUNT, max: totalLoanAvailable(),
  quick: [1000000, 5000000, 10000000, 'max'],
  help: '대출 가능금액보다 적게 신청하면 이율이 낮은 계약부터 먼저 대출됩니다.',
});

/** 계약 카드: plan(선택 단계 · 배정 미리보기) / result(확인·완료 단계 · 실행 내역) */
function loanCard({ contract, available, amount }, { mode, rank, hasRequest }) {
  const rate = contract.loanRate;
  const cardState = mode === 'result' || amount ? 'on' : hasRequest ? 'unused' : '';
  const facts = mode === 'plan'
    ? [['대출 가능금액', formatWon(available)], ['이번 대출금액', amount ? formatWon(amount) : '-', 'take'], ['예상 월 이자', amount ? formatWon(monthlyInterest(amount, rate)) : '-']]
    : [['대출금액', formatWon(amount), 'take'], ['적용 이율', formatRate(rate)], ['예상 월 이자', formatWon(monthlyInterest(amount, rate))]];

  return `
  <article class="loan-card ${cardState}">
    <div class="lc-head">
      <div>
        ${when(mode === 'plan', `<span class="lc-rank">${rank}순위</span>`)}
        <b>${escapeHtml(contract.name)}</b>
        <small class="num">증권번호 ${contract.no}${contract.loan ? ` · 기존 대출 ${formatWon(contract.loan)}` : ''}</small>
      </div>
      <span class="lc-rate num">${formatRate(rate)}</span>
    </div>
    <dl>${each(facts, ([label, value, tone]) => `<div><dt>${label}</dt><dd class="num ${tone || ''}">${value}</dd></div>`)}</dl>
  </article>`;
}

/** 선택 단계: 계약 목록 + 배정 합계 (금액을 입력할 때마다 다시 그림) */
function loanPlanList(requested) {
  const plan = allocateLoan(requested);
  const assigned = plan.reduce((sum, loan) => sum + loan.amount, 0);
  return `
  <div class="loan-list">${each(plan, (loan, index) => loanCard(loan, { mode: 'plan', rank: index + 1, hasRequest: requested > 0 }))}</div>
  <div class="sumline">배정 합계 <span class="num">${formatWon(assigned)}</span></div>`;
}

export function renderLoanPickStep(screen, config, flow) {
  const requested = flow.values.loanAmount || 0;
  return `
  ${summaryTiles([['전체 대출 가능금액', formatWon(totalLoanAvailable())], ['대출 가능 계약', `${loanableContracts().length}건`]])}
  <div class="card"><h2>대출 신청금액</h2><div class="form">${renderField(loanAmountField(), flow.values)}</div></div>
  <div class="card">
    <h2 class="split center">대출 가능 계약<small class="h-note">이율 낮은 순</small></h2>
    <div id="loanPlan">${loanPlanList(requested)}</div>
  </div>
  <div class="navrow">
    <button class="btn lg" data-action="back">취소</button>
    <button class="btn pri lg" id="next">다음</button>
  </div>`;
}

export function bindLoanPickStep(root, flow) {
  const input = $('#loanAmount', root);
  const refresh = () => {
    flow.values.loanAmount = toNumber(input.value);
    $('#e-loanAmount', root).textContent = '';   // 금액을 고치면 이전 오류 문구는 지움
    input.classList.remove('bad');
    $('#loanPlan', root).innerHTML = loanPlanList(flow.values.loanAmount);
    const { loans, amount } = loanTotals(flow.values.loanAmount);
    announce(amount ? `${loans.length}개 계약에 배정, 배정 합계 ${formatWon(amount)}` : '');
  };
  input.addEventListener('input', refresh);
  $$('[data-add]', root).forEach(button => button.addEventListener('click', refresh));
}

export function validateLoanPick(root, flow) {
  flow.values.loanAmount = toNumber($('#loanAmount', root).value);
  return validateFields(root, [loanAmountField()], flow.values);
}

/** 입력 단계 상단: 신청금액과 실행 계약 수 */
export function describeLoanRequest(flow) {
  const { loans, amount } = loanTotals(flow.values.loanAmount || 0);
  return `<b>대출 신청금액 ${formatWon(amount)}</b>${loans.length}개 계약에서 이율이 낮은 순서로 대출됩니다.`;
}

/** 확인·완료 단계: 대출 실행 계약 카드 */
export function loanResultSection(flow, step) {
  const title = step === 'done' ? '대출 실행 계약' : '대출 실행 예정 계약';
  const { loans, amount } = loanTotals(flow.values.loanAmount || 0);
  return `
  <div class="card">
    <h2 class="split center">${title}<small class="h-note num">${loans.length}건 · 합계 ${formatWon(amount)}</small></h2>
    <div class="loan-list">${each(loans, loan => loanCard(loan, { mode: 'result' }))}</div>
  </div>`;
}

export function loanCalc(values) {
  const { loans, amount, interest, averageRate } = loanTotals(values.loanAmount || 0);
  return [['대출 신청금액', formatWon(amount)], ['실행 계약', `${loans.length}건`], ['평균 적용 이율', formatRate(averageRate)], ['예상 월 이자', formatWon(interest), true]];
}
