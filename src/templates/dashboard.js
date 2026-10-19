import { APP } from '../core/config';
import { each, escapeHtml, when } from '../core/dom.js';
import { formatWon } from '../core/format';
import { CONTRACTS, insuredLabel, isInsuredOther } from '../data/customerRepository.js';
import { loanAvailable } from '../features/loan.js';
import { infoBox, statusChip } from '../ui/widgets.js';

/* T1 대시보드 (계약종합현황) ----------------------------------------- */
export function renderDashboard() {
  const monthlyPremium = CONTRACTS.filter(c => c.status === '정상').reduce((sum, c) => sum + c.premium, 0);
  const totalSurrender = CONTRACTS.reduce((sum, c) => sum + c.surrender, 0);
  const totalLoan      = CONTRACTS.reduce((sum, c) => sum + c.loan, 0);

  return `
  <dl class="tiles">
    <div class="tile hl"><dt>보유계약</dt><dd class="num">${CONTRACTS.length}<small>건</small></dd></div>
    <div class="tile"><dt>월 보험료 합계</dt><dd class="num">${monthlyPremium.toLocaleString()}<small>원</small></dd></div>
    <div class="tile"><dt>예상 해지환급금 합계</dt><dd class="num">${totalSurrender.toLocaleString()}<small>원</small></dd></div>
    <div class="tile"><dt>보험계약대출 잔액</dt><dd class="num">${totalLoan.toLocaleString()}<small>원</small></dd></div>
  </dl>
  <p class="footnote">예상 해지환급금은 ${APP.today} 기준 예시 금액이며 실제 지급액과 다를 수 있습니다.</p>
  <div class="ct-list">${each(CONTRACTS, contractCard)}</div>`;
}

function contractCard(contract) {
  const progress = typeof contract.totalCount === 'number' ? Math.round(contract.paidCount / contract.totalCount * 100) : null;
  return `
  <article class="ct">
    <div class="ct-head">
      <div><b>${escapeHtml(contract.name)}</b><small class="num">증권번호 ${contract.no} · 피보험자 ${insuredLabel(contract)}</small></div>
      <div class="badges">${when(isInsuredOther(contract), '<span class="bdg">타인 피보험자</span>')}${statusChip(contract.status)}</div>
    </div>
    <dl>
      <div><dt>월 보험료</dt><dd class="num">${formatWon(contract.premium)}</dd></div>
      <div><dt>예상 해지환급금</dt><dd class="num">${contract.surrender ? formatWon(contract.surrender) : '-'}</dd></div>
      <div><dt>대출 잔액</dt><dd class="num">${contract.loan ? formatWon(contract.loan) : '없음'}</dd></div>
    </dl>
    ${progress !== null
      ? `<div><div class="bar-l"><span>납입 ${contract.paidCount}/${contract.totalCount}회</span><span>${progress}%</span></div><div class="bar"><i style="width:${progress}%"></i></div></div>`
      : '<div class="bar-l"><span>갱신형 · 다음 갱신 2026.12.31</span></div>'}
    ${when(contract.status === '납입유예', infoBox('warn compact', 'alert', '납입유예 중입니다. 월대체보험료가 적립금에서 차감됩니다.'))}
    <div class="acts">${each(contractShortcuts(contract), ([label, id]) => `<button class="btn sm" data-action="open" data-id="${id}"${contract.isVariable ? ` data-variable="${contract.no}"` : ''}>${label}</button>`)}</div>
  </article>`;
}


/** 계약 성격에 맞는 바로가기 버튼 */
function contractShortcuts(contract) {
  return [
    ['계약상세', 'CT-02'],
    contract.isVariable  && ['펀드 수익률', 'CT-03'],
    contract.isUniversal && ['자유납입', 'PM-04'],
    loanAvailable(contract) > 0 && [`대출 가능 ${Math.round(loanAvailable(contract) / 10000).toLocaleString()}만원`, 'LN-02'],
    ['실손', '어린이', '암'].includes(contract.kind) && ['보험금 청구', 'PY-01'],
    ['증명서', 'CF-02'],
  ].filter(Boolean);
}
