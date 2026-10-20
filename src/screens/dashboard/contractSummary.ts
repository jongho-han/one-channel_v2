/* T1 계약종합현황: 계약 요약·바로가기 계산 (화면과 분리한 순수 로직) */
import { loanAvailable } from '../../features/loan.js';

export interface Contract {
  no: string;
  name: string;
  kind: string;
  status: string;
  insured: string;
  insuredRelation?: string;     // 피보험자가 계약자가 아닐 때 관계
  premium: number;
  paidCount: number;
  totalCount: number | string;  // 갱신형은 문자열
  surrender: number;
  loan: number;
  loanLimit: number;
  isVariable?: boolean;
  isUniversal?: boolean;
}

export interface ContractsSummary {
  count: number;
  monthlyPremium: number;
  totalSurrender: number;
  totalLoan: number;
}

const sum = (contracts: readonly Contract[], pick: (contract: Contract) => number) => contracts.reduce((total, contract) => total + pick(contract), 0);

/** 월 보험료는 정상 계약만, 해지환급금·대출 잔액은 전체 합계 */
export function summarizeContracts(contracts: readonly Contract[]): ContractsSummary {
  return {
    count: contracts.length,
    monthlyPremium: sum(contracts.filter(contract => contract.status === '정상'), contract => contract.premium),
    totalSurrender: sum(contracts, contract => contract.surrender),
    totalLoan: sum(contracts, contract => contract.loan),
  };
}

/** 납입 진행률(%) — 갱신형처럼 총 회차가 없으면 null */
export const paymentProgress = (contract: Contract): number | null =>
  (typeof contract.totalCount === 'number' ? Math.round(contract.paidCount / contract.totalCount * 100) : null);

export const insuredLabel = (contract: Contract): string =>
  (contract.insuredRelation ? `${contract.insured}(${contract.insuredRelation})` : contract.insured);

/** 바로가기 버튼 [이름, 화면 id] — 계약 성격에 맞는 것만 */
export type Shortcut = readonly [label: string, screenId: string];

const CLAIMABLE_KINDS = ['실손', '어린이', '암'];

export function contractShortcuts(contract: Contract): Shortcut[] {
  const available: number = loanAvailable(contract);
  const candidates: (Shortcut | false)[] = [
    ['계약상세', 'CT-02'],
    Boolean(contract.isVariable) && ['펀드 수익률', 'CT-03'],
    Boolean(contract.isUniversal) && ['자유납입', 'PM-04'],
    available > 0 && [`대출 가능 ${Math.round(available / 10000).toLocaleString()}만원`, 'LN-02'],
    CLAIMABLE_KINDS.includes(contract.kind) && ['보험금 청구', 'PY-01'],
    ['증명서', 'CF-02'],
  ];
  return candidates.filter((shortcut): shortcut is Shortcut => shortcut !== false);
}
