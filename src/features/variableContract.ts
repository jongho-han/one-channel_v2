import { each, escapeHtml } from '../core/dom.js';
import { CONTRACTS, type InsuranceContract } from '../data/customerRepository';
import type { Fund } from '../data/fundRepository';
import { state } from '../state/store';

/* 변액 계약 선택: 변액보험 조회(CT-03)·펀드변경(CH-01)이 같은 선택(state.variableNo)을 공유 */
export interface VariableContract {
  no: string;
  name: string;
  variable: { reserve: number; principal: number; fundChangesLeft: number; funds: readonly Fund[] };
}

/** 샘플 계약 중 변액 계약 (isVariable 이면 variable 정보가 있음) */
export const VARIABLE_CONTRACTS: readonly VariableContract[] = CONTRACTS.filter((contract): contract is InsuranceContract & VariableContract => Boolean(contract.isVariable && contract.variable));
export const selectedVariableContract = (): VariableContract => VARIABLE_CONTRACTS.find(contract => contract.no === state.variableNo) ?? VARIABLE_CONTRACTS[0];
export const activeFunds = (): readonly Fund[] => selectedVariableContract().variable.funds;

/** 변액 계약 탭 HTML (기존 JS 화면 CT-03 용 — React 화면은 FundViews 의 VariableContractTabs) */
export function variableContractTabs(): string {
  const selected = selectedVariableContract();
  return `
  <div class="seg block mb-14" role="group" aria-label="변액 계약 선택">
    ${each(VARIABLE_CONTRACTS, (contract: VariableContract) => `<button class="${contract === selected ? 'on' : ''}" aria-pressed="${contract === selected}" data-action="variable-tab" data-no="${contract.no}">${escapeHtml(contract.name.replace('(무)iM ', ''))}</button>`)}
  </div>`;
}
