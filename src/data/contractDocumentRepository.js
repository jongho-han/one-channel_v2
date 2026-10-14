import { contractByNo } from './customerRepository.js';

/* 계약별 내려받을 수 있는 서류 (약관 · 보험상품안내장, 모두 가입 당시 기준) — 샘플 */

/** 계약의 서류 목록 → [{ id, kind: '약관'|'안내장', title, date }] */
export function contractDocuments(contract) {
  return [
    { id: 'terms', kind: '약관', title: '보험약관', date: contract.startDate },
    { id: 'product-notice', kind: '안내장', title: '보험상품안내장', date: contract.startDate },
  ];
}

/** 증권번호 + 서류 id → { contract, document } (없으면 document: undefined) */
export function findContractDocument(no, id) {
  const contract = contractByNo(no);
  return { contract, document: contractDocuments(contract).find(item => item.id === id) };
}
