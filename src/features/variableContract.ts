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
export type VariableInsuranceContract = InsuranceContract & VariableContract;
export const VARIABLE_CONTRACTS: readonly VariableInsuranceContract[] = CONTRACTS.filter((contract): contract is VariableInsuranceContract => Boolean(contract.isVariable && contract.variable));
export const selectedVariableContract = (): VariableInsuranceContract => VARIABLE_CONTRACTS.find(contract => contract.no === state.variableNo) ?? VARIABLE_CONTRACTS[0];
export const activeFunds = (): readonly Fund[] => selectedVariableContract().variable.funds;


/** 누적 수익률 = 적립금 ÷ 납입 원금 − 1 (소수 둘째 자리, 이익이면 +) */
export function cumulativeReturn(reserve: number, principal: number): string {
  const rate = ((reserve / principal - 1) * 100).toFixed(2);
  return `${Number(rate) >= 0 ? '+' : ''}${rate}%`;
}
