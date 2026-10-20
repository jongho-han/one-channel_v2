/* 샘플 고객 · 계약 · 계좌 */
import type { Fund } from './fundRepository';

/** [구분, 보장, 가입금액] */
export type Coverage = readonly [type: string, description: string, amount: string];

export interface InsuranceContract {
  no: string;
  name: string;
  kind: string;
  status: string;
  premium: number;
  paidCount: number;
  totalCount: number | string;   // 갱신형은 문자열
  startDate: string;
  endDate: string;
  payEnd: string;
  surrender: number;
  paidSum: number;
  loan: number;
  loanLimit: number;
  loanRate: number;
  insured: string;
  insuredRelation?: string;      // 피보험자가 계약자가 아닐 때 관계
  beneficiary: string;
  account: string;
  debitDay: string;
  coverage: readonly Coverage[];
  isVariable?: boolean;
  isAnnuity?: boolean;
  isUniversal?: boolean;
  annuityAge?: number;
  annuityDate?: string;
  variable?: { reserve: number; principal: number; fundChangesLeft: number; funds: readonly Fund[] };
}

export const USER = {
  name: '홍길동', birth: '1978.05.12', phone: '010-1234-5678', email: 'gildong.hong@example.com',
  homeZip: '04524', homeAddress: '서울특별시 중구 세종대로 110, 101동 1203호', homeTel: '02-123-4567',
  workZip: '42020', workAddress: '대구광역시 수성구 달구벌대로 2310, 8층',   workTel: '053-740-0000',
};

export const CONTRACTS: InsuranceContract[] = [
  { no: '2018-0012345', name: '(무)iM 든든한 종신보험', kind: '종신', status: '정상',
    premium: 128400, paidCount: 99, totalCount: 240, startDate: '2018.07.15', endDate: '종신', payEnd: '2038.06',
    surrender: 9842000, paidSum: 12711600, loan: 3000000, loanLimit: 5890000, loanRate: 0.043,
    insured: '홍길동', beneficiary: '김영희(배우자)', account: 'iM뱅크 508-12-****91', debitDay: '25일',
    coverage: [['주계약', '사망보험금', '100,000,000원'], ['재해사망특약', '재해 사망 시', '50,000,000원'], ['암진단특약', '암 진단 확정 시', '30,000,000원'], ['입원일당특약', '입원 1일당(4일 이상)', '30,000원']] },
  { no: '2020-0456789', name: '(무)iM 하이브리드 변액연금보험', kind: '변액연금', status: '정상',
    premium: 300000, paidCount: 79, totalCount: 120, startDate: '2020.03.02', endDate: '2045.03.02 연금개시', payEnd: '2030.02',
    surrender: 23710400, paidSum: 23700000, loan: 0, loanLimit: 11200000, loanRate: 0.0475,
    insured: '홍길동', beneficiary: '홍길동(본인)', account: '국민은행 123-45-****01', debitDay: '10일',
    isVariable: true, isAnnuity: true, annuityAge: 65, annuityDate: '2045.03.02',
    variable: { reserve: 23710400, principal: 22016000, fundChangesLeft: 11, funds: [   // [펀드, 편입비율, 1년 수익률, 위험등급]
      ['글로벌주식형', 40, '+14.2%', '4등급(보통위험)'], ['국내채권형', 30, '+3.1%', '5등급(낮은위험)'], ['국내주식인덱스형', 20, '+8.4%', '3등급(다소높은위험)'],
      ['단기채권형(MMF)', 10, '+2.9%', '6등급(매우낮은위험)'], ['미국S&P500인덱스형', 0, '+19.6%', '3등급(다소높은위험)'], ['ESG혼합형', 0, '+6.7%', '4등급(보통위험)']] },
    coverage: [['주계약', '연금 개시 후 연금', '적립금 기준'], ['최저연금적립금보증', '연금개시 시점', '납입보험료 100% 보증']] },
  { no: '2021-0778812', name: '(무)iM 실손의료비보험', kind: '실손', status: '정상',
    premium: 34560, paidCount: 63, totalCount: '갱신형', startDate: '2021.07.01', endDate: '2026.12.31 (갱신)', payEnd: '갱신형',
    surrender: 0, paidSum: 2177280, loan: 0, loanLimit: 0, loanRate: 0,
    insured: '홍길동', beneficiary: '홍길동(본인)', account: 'iM뱅크 508-12-****91', debitDay: '25일',
    coverage: [['주계약', '질병 입원·통원', '본인부담 80% 보상'], ['상해특약', '상해 입원·통원', '본인부담 80% 보상']] },
  { no: '2016-0033190', name: '(무)iM 유니버설저축보험', kind: '유니버설', status: '납입유예',
    premium: 200000, paidCount: 120, totalCount: 120, startDate: '2016.04.20', endDate: '2031.04.20 만기', payEnd: '2026.03',
    surrender: 26450300, paidSum: 24000000, loan: 0, loanLimit: 13200000, loanRate: 0.0395,
    insured: '홍길동', beneficiary: '홍길동(본인)', account: 'iM뱅크 508-12-****91', debitDay: '25일',
    isUniversal: true,
    coverage: [['주계약', '만기보험금', '적립금 전액'], ['재해장해특약', '재해 장해 시', '10,000,000원']] },
  { no: '2017-0091234', name: '(무)iM 행복드림 연금보험', kind: '연금', status: '정상',
    premium: 150000, paidCount: 107, totalCount: 120, startDate: '2017.11.20', endDate: '2038.11.20 연금개시', payEnd: '2027.10',
    surrender: 17820000, paidSum: 16050000, loan: 0, loanLimit: 0, loanRate: 0,
    insured: '홍길동', beneficiary: '홍길동(본인)', account: 'iM뱅크 508-12-****91', debitDay: '25일',
    isAnnuity: true, annuityAge: 60, annuityDate: '2038.11.20',
    coverage: [['주계약', '연금 개시 후 연금', '적립금 기준(공시이율 연동)'], ['연금보증특약', '보증기간 20년', '보증기간 내 사망 시 잔여분 지급']] },

  { no: '2021-0345678', name: '(무)iM 변액유니버설 종신보험', kind: '변액종신', status: '정상',
    premium: 200000, paidCount: 66, totalCount: 240, startDate: '2021.04.15', endDate: '종신', payEnd: '2041.03',
    surrender: 12480000, paidSum: 13200000, loan: 0, loanLimit: 0, loanRate: 0,
    insured: '홍길동', beneficiary: '김영희(배우자)', account: '신한은행 110-***-***882', debitDay: '15일',
    isVariable: true,
    variable: { reserve: 12480000, principal: 11880000, fundChangesLeft: 12, funds: [
      ['아시아주식형', 30, '+11.8%', '3등급(다소높은위험)'], ['글로벌채권형', 40, '+4.2%', '5등급(낮은위험)'], ['배당주식형', 20, '+9.1%', '4등급(보통위험)'],
      ['단기채권형(MMF)', 10, '+2.9%', '6등급(매우낮은위험)'], ['미국S&P500인덱스형', 0, '+19.6%', '3등급(다소높은위험)']] },
    coverage: [['주계약', '사망 시', '기본보험금 + 적립금'], ['최저사망보험금보증', '사망 시', '기본보험금 50,000,000원 보증'], ['재해사망특약', '재해 사망 시', '30,000,000원']] },

  /* 피보험자가 계약자(홍길동)가 아닌 계약 — insuredRelation: 계약자와의 관계 */
  { no: '2019-0234567', name: '(무)iM 튼튼 어린이보험', kind: '어린이', status: '정상',
    premium: 45000, paidCount: 87, totalCount: 240, startDate: '2019.07.10', endDate: '2049.07.10 만기', payEnd: '2039.06',
    surrender: 2310000, paidSum: 3915000, loan: 0, loanLimit: 1850000, loanRate: 0.041,
    insured: '홍서연', insuredRelation: '자녀', beneficiary: '홍길동(계약자)', account: 'iM뱅크 508-12-****91', debitDay: '25일',
    coverage: [['주계약', '질병·상해 입원 1일당', '30,000원'], ['골절진단특약', '골절 진단 시', '300,000원'], ['어린이실손특약', '입원·통원 의료비', '본인부담 80% 보상']] },
  { no: '2022-0567123', name: '(무)iM 든든 암보험', kind: '암', status: '정상',
    premium: 52300, paidCount: 50, totalCount: 240, startDate: '2022.08.05', endDate: '2062.08.05 만기', payEnd: '2042.07',
    surrender: 640000, paidSum: 2615000, loan: 0, loanLimit: 0, loanRate: 0,
    insured: '김영희', insuredRelation: '배우자', beneficiary: '김영희(피보험자)', account: '국민은행 123-45-****01', debitDay: '10일',
    coverage: [['주계약', '암 진단 확정 시', '30,000,000원'], ['암수술특약', '암 수술 시', '2,000,000원'], ['암입원특약', '암 입원 1일당', '50,000원']] },
];

/** 피보험자 표시: 본인은 이름만, 타인은 '홍서연(자녀)'처럼 관계를 붙임 */
export const insuredLabel = (contract: Pick<InsuranceContract, 'insured' | 'insuredRelation'>): string => (contract.insuredRelation ? `${contract.insured}(${contract.insuredRelation})` : contract.insured);
export const isInsuredOther = (contract: Pick<InsuranceContract, 'insuredRelation'>): boolean => Boolean(contract.insuredRelation);

export const ACCOUNTS: readonly string[] = ['iM뱅크 508-12-****91 (본인)', '국민은행 123-45-****01 (본인)', '신한은행 110-***-***882 (본인)'];

export const contractByNo = (no: string): InsuranceContract => CONTRACTS.find(contract => contract.no === no) || CONTRACTS[0];

export const activeContracts = CONTRACTS.filter(contract => contract.status === '정상');
