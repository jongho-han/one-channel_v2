import { contractByNo, type InsuranceContract } from './customerRepository';

/* 계약별 내려받을 수 있는 서류 (약관 · 보험상품안내장, 모두 가입 당시 기준) — 샘플 */

export interface ContractDocument {
  id: string;
  kind: '약관' | '안내장';
  title: string;
  date: string;
}

/** 계약의 서류 목록 */
export function contractDocuments(contract: Pick<InsuranceContract, 'startDate'>): ContractDocument[] {
  return [
    { id: 'terms', kind: '약관', title: '보험약관', date: contract.startDate },
    { id: 'product-notice', kind: '안내장', title: '보험상품안내장', date: contract.startDate },
  ];
}

/** 증권번호 + 서류 id → { contract, document } (없으면 document: undefined) */
export function findContractDocument(no: string, id: string): { contract: InsuranceContract; document: ContractDocument | undefined } {
  const contract = contractByNo(no);
  return { contract, document: contractDocuments(contract).find(item => item.id === id) };
}
