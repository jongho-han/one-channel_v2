import type { ReactNode } from 'react';
import type { FieldSpec, FieldValues } from '../components/form/fieldSpec';
import { formatWon } from '../core/format';
import { CONTRACTS, USER } from '../data/customerRepository';

/* T5 발급 (document(values) → [[항목, 값]] · 첫 줄은 증명서 이름) */
export interface CertificateConfig {
  fields: FieldSpec[];
  preview?: () => ReactNode;
  document: (values: FieldValues) => [string, string][];
}

interface SampleContract { name: string; surrender: number; loan: number }
const contracts = CONTRACTS as SampleContract[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type V = Record<string, any>;

export const CERTIFICATES: Record<string, CertificateConfig> = {
  'CF-01': {
    fields: [{ id: 'yr', label: '귀속 연도', type: 'radio' as const, options: ['2025년', '2024년', '2023년'] }],
    preview: () => <>
      <div className="tbl-wrap plain"><table className="tbl min-460">
        <thead><tr><th>계약</th><th>공제 구분</th><th>공제대상 납입액</th></tr></thead>
        <tbody>
          <tr><td>(무)iM 든든한 종신보험</td><td>보장성보험료</td><td className="r num">1,540,800원</td></tr>
          <tr><td>(무)iM 실손의료비보험</td><td>보장성보험료</td><td className="r num">414,720원</td></tr>
          <tr><td>(무)iM 하이브리드 변액연금보험</td><td>공제 대상 아님(저축성)</td><td className="r num">-</td></tr>
        </tbody>
      </table></div>
      <p className="footnote flush">보장성보험료는 연 100만원 한도로 세액공제(12%)됩니다. 국세청 간소화 서비스에도 같은 금액이 제공됩니다.</p>
    </>,
    document: (v: V) => [['증명서 종류', '소득·세액공제 납입증명서'], ['귀속 연도', v.yr], ['보장성보험료 합계', '1,955,520원'], ['공제 대상(한도)', '1,000,000원']] },
  'CF-02': {
    fields: [
      { id: 'ct', label: '계약', type: 'select', options: contracts.map(c => c.name) },
      { id: 'from', label: '시작일', type: 'date', value: '2026-01-01' },
      { id: 'to', label: '종료일', type: 'date', value: '2026-09-30' },
      { id: 'use', label: '용도', type: 'select', options: ['개인 보관용', '회사 제출용', '관공서 제출용', '금융기관 제출용'] }],
    document: (v: V) => [['증명서 종류', '보험료납입증명서'], ['계약', v.ct], ['납입 기간', `${v.from} ~ ${v.to}`], ['납입 금액 합계', '1,155,600원'], ['용도', v.use]] },
  'CF-03': {
    fields: [{ id: 'ct', label: '계약', type: 'select', options: contracts.map(c => c.name) }],
    document: (v: V) => [['증명서 종류', '보험증권(재발급)'], ['계약', v.ct], ['계약자 / 피보험자', `${USER.name} / ${USER.name}`], ['재발급 사유', '고객 요청']] },
  'CF-04': {
    fields: [
      { id: 'ct', label: '계약', type: 'select', options: contracts.filter(c => c.surrender).map(c => c.name) },
      { id: 'base', label: '기준일', type: 'date', value: '2026-10-02' }],
    document: (v: V) => {
      const contract = contracts.find(c => c.name === v.ct) || contracts[0];
      return [['증명서 종류', '해지환급금증명서'], ['계약', v.ct], ['기준일', v.base], ['해지환급금', formatWon(contract.surrender)], ['보험계약대출 잔액', formatWon(contract.loan)]];
    } },
  'CF-05': {
    fields: [{ id: 'cl', label: '청구 건', type: 'select', options: ['C2608-00152 · 입원·수술 (2026.08.03)', 'C2605-00933 · 통원치료 (2026.05.19)'] }],
    document: (v: V) => [['증명서 종류', '사고보험금 지급명세'], ['청구', v.cl], ['지급일', '2026.08.07'], ['지급액', '1,284,000원'], ['지급 내역', '입원의료비 984,000원 · 수술급여금 300,000원']] },
  'CF-06': {
    fields: [
      { id: 'base', label: '기준일', type: 'date', value: '2026-10-02' },
      { id: 'from', label: '거래 조회 시작일', type: 'date', value: '2025-11-20' }],
    document: (v: V) => [['증명서 종류', '보험계약대출 증명서'], ['대상 대출', '보험계약대출 · (무)iM 든든한 종신보험'], ['기준일', v.base], ['대출 잔액', '3,000,000원'], ['적용 이율', '연 4.30%']] },
};

/** 비로그인 서류 내려받기: [서류명, 설명, 구분(필수·안내·선택)] */
export type FormDownload = readonly [name: string, description: string, kind: string];

export const FORM_DOWNLOADS: Record<string, FormDownload[]> = {
  'CS-01': [
    ['보험금 청구서', '모든 청구 공통', '필수'], ['개인(신용)정보 처리 동의서', '모든 청구 공통', '필수'],
    ['통원 청구 안내', '진료비 영수증 + 진료비 세부내역서', '안내'], ['입원·수술 청구 안내', '진단서(또는 입퇴원확인서) + 수술확인서 + 영수증', '안내'],
    ['사망보험금 청구 안내', '사망진단서 + 기본증명서 + 가족관계증명서', '안내'], ['위임장(대리 청구)', '가족·대리인이 청구할 때', '선택']],
  'CS-02': [
    ['제지급 신청서', '해지·중도인출·만기 등 공통', '필수'], ['위임장', '대리인이 신청할 때', '선택'],
    ['계좌 변경 신청서', '지급 계좌를 바꿀 때', '선택'], ['법정상속인 확인서', '상속인이 수령할 때', '선택']],
};
