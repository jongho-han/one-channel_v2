/* 보험계약대출 (LN-02): 신청금액을 이율이 낮은 계약부터 나눠 배정 — 순수 로직 */
import type { CalcRow } from '../components/widgets';
import { formatWon } from '../core/format';

export interface LoanContract {
  no: string;
  name: string;
  loanLimit: number;
  loan: number;       // 기존 대출 잔액
  loanRate: number;   // 연 이율 (0.043 = 4.3%)
}

export interface LoanAllocation<T extends LoanContract = LoanContract> {
  contract: T;
  available: number;
  amount: number;
}

export const LOAN_MIN_AMOUNT = 100000;
export const loanAvailable = (contract: Pick<LoanContract, 'loanLimit' | 'loan'>): number => contract.loanLimit - contract.loan;
export const formatRate = (rate: number): string => `연 ${(rate * 100).toFixed(2)}%`;
export const monthlyInterest = (amount: number, rate: number): number => Math.round(amount * rate / 12);

/** 대출 가능한 계약을 이율이 낮은 순서로 */
export const loanableContracts = <T extends LoanContract>(contracts: readonly T[]): T[] =>
  contracts.filter(contract => loanAvailable(contract) > 0).sort((a, b) => a.loanRate - b.loanRate);

export const totalLoanAvailable = (contracts: readonly LoanContract[]): number =>
  loanableContracts(contracts).reduce((sum, contract) => sum + loanAvailable(contract), 0);

/** 신청금액을 낮은 이율 계약부터 가능금액만큼 채워 배정 */
export function allocateLoan<T extends LoanContract>(contracts: readonly T[], requested: number): LoanAllocation<T>[] {
  let remaining = requested;
  return loanableContracts(contracts).map(contract => {
    const available = loanAvailable(contract);
    const amount = Math.min(available, Math.max(remaining, 0));
    remaining -= amount;
    return { contract, available, amount };
  });
}

export function loanTotals<T extends LoanContract>(contracts: readonly T[], requested: number) {
  const loans = allocateLoan(contracts, requested).filter(loan => loan.amount > 0);
  const amount = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const interest = loans.reduce((sum, loan) => sum + monthlyInterest(loan.amount, loan.contract.loanRate), 0);
  const averageRate = amount ? loans.reduce((sum, loan) => sum + loan.amount * loan.contract.loanRate, 0) / amount : 0;
  return { loans, amount, interest, averageRate };
}

export function loanCalcRows(contracts: readonly LoanContract[], requested: number): CalcRow[] {
  const { loans, amount, interest, averageRate } = loanTotals(contracts, requested);
  return [['대출 신청금액', formatWon(amount)], ['실행 계약', `${loans.length}건`], ['평균 적용 이율', formatRate(averageRate)], ['예상 월 이자', formatWon(interest), true]];
}
