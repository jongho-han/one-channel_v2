import { each, escapeHtml } from '../core/dom.js';
import { CONTRACTS } from '../data/customerRepository.js';
import { state } from '../state/store';

/* 변액 계약 선택: 변액보험 조회(CT-03)·펀드변경(CH-01)이 같은 선택(state.variableNo)을 공유 */
const VARIABLE_CONTRACTS = CONTRACTS.filter(contract => contract.isVariable);
export const selectedVariableContract = () => VARIABLE_CONTRACTS.find(contract => contract.no === state.variableNo) || VARIABLE_CONTRACTS[0];
export const activeFunds = () => selectedVariableContract().variable.funds;

export function variableContractTabs() {
  const selected = selectedVariableContract();
  return `
  <div class="seg block mb-14" role="group" aria-label="변액 계약 선택">
    ${each(VARIABLE_CONTRACTS, contract => `<button class="${contract === selected ? 'on' : ''}" aria-pressed="${contract === selected}" data-action="variable-tab" data-no="${contract.no}">${escapeHtml(contract.name.replace('(무)iM ', ''))}</button>`)}
  </div>`;
}
