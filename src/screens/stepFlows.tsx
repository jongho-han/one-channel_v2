import type { ReactNode } from 'react';
import type { FieldSpec, FieldValues } from '../components/form/fieldSpec';
import { APP } from '../core/config';
import { formatWon } from '../core/format';
import { CONTRACTS, contractByNo, insuredLabel, isInsuredOther, type InsuranceContract } from '../data/customerRepository';
import { ANNUITY_AGE_RANGE, ANNUITY_OPTION_FIELDS, annuityAgeOptions, annuityLockRules, annuityOptionCalc, pickedAnnuityContract } from '../features/annuity';
import { ANNUITY_CONVERSION_FIELDS, annuityConversionCalc, isConvertible } from '../features/annuityConversion';
import { loanCalcRows } from '../features/loanRules';
import { PAY_BY_ACCOUNT, PAY_BY_VIRTUAL, VIRTUAL_ACCOUNT_BANKS, isVirtualPayment, issueVirtualAccount, type VirtualAccount } from '../features/virtualAccount';
import { LoanRequestSummary, LoanResult } from './stepFlow/LoanPick';
import type { InputStepConfig } from './stepFlow/StepFlow';
import type { PickItem } from './stepFlow/stepRules';
import { VirtualAccountInfo } from './stepFlow/VirtualAccountInfo';

/* T3 단계형 신청
   pick: 선택 단계 (items() → { key, title, sub, value }, custom: 맞춤 선택 단계 annuity · loan) · intro: 입력 단계 상단 안내
   calc(values, pickedKey) → [[항목, 값, 합계여부]] · agree: 필수 동의 · receiptPrefix: 접수번호 앞자리
   pick.describe(flow): 입력 단계 상단 안내 · pick.summary(flow, 'confirm' | 'done'): 확인·완료 단계 카드 · doneNext: 완료 화면 주 버튼 [이름, 화면ID] */
export interface StepFlowState {
  step: number;
  pick: string | null;
  values: FieldValues;
  agreed: number[];
  receiptNo?: string;
  virtualAccount?: VirtualAccount;
}

export interface StepFlowConfig extends InputStepConfig {
  pick?: {
    label?: string;
    items?: () => PickItem[];
    onPick?: (flow: StepFlowState, key: string) => void;   // 카드를 고를 때 (data-action="pick")
    custom?: 'annuity' | 'loan';                            // 맞춤 선택 단계
    describe?: (flow: StepFlowState) => ReactNode;
    summary?: (flow: StepFlowState, step: 'confirm' | 'done') => ReactNode;
  };
  retain?: boolean;                                         // 해지 전 대안 안내
  skipConfirm?: boolean;
  fields: FieldSpec[];
  done: string | ((values: FieldValues) => string);
  doneTitle?: (values: FieldValues) => string;
  doneGuide?: (values: FieldValues) => string;
  doneExtra?: (flow: StepFlowState) => ReactNode;
  doneNext?: readonly [label: string, screenId: string];
  receiptPrefix?: string;
}

const contractChoices = (filter: (contract: InsuranceContract) => boolean | undefined, valueOf: (contract: InsuranceContract) => string = () => ''): PickItem[] =>
  CONTRACTS.filter(contract => Boolean(filter(contract))).map(contract => ({
    key: contract.no, title: contract.name, sub: `증권번호 ${contract.no} · 피보험자 ${insuredLabel(contract)}`, value: valueOf(contract),
  }));

const loanAmountOf = (flow: StepFlowState) => Number(flow.values.loanAmount) || 0;

export const STEP_FLOWS: Record<string, StepFlowConfig> = {
  'MY-05': {
    intro: { tone: 'warn', title: '고객확인 재이행이 필요합니다', desc: '특정금융정보법에 따라 보험금 지급·대출 등 금융거래 전 고객 정보를 주기적으로 확인합니다. 재확인 기한: 2026.11.30' },
    fields: [
      { id: 'job', label: '직업', type: 'select', options: ['회사원', '공무원', '자영업', '전문직', '주부', '학생', '무직', '기타'] },
      { id: 'work', label: '직장명', placeholder: '예: ○○주식회사' },
      { id: 'purpose', label: '거래 목적', type: 'radio', options: ['보장·노후 준비', '저축·투자', '보험금 수령', '대출'] },
      { id: 'fund', label: '자금 원천', type: 'select', options: ['근로소득', '사업소득', '연금소득', '금융소득', '상속·증여', '기타'] },
      { id: 'owner', label: '실제 소유자', type: 'radio', options: ['본인', '본인 외 다른 사람'], help: '거래로 이익을 얻는 사람이 본인이 아니면 별도 확인이 필요합니다.' }],
    agree: ['입력한 정보가 사실과 다르지 않음을 확인합니다.'],
    done: '고객확인이 완료되었습니다. 다음 재확인 기한은 2029.10.02입니다.' },

  'PY-01': {
    pick: {
      label: '청구할 계약을 선택하세요',
      onPick: (flow, contractNo) => {   // 고른 계약의 피보험자를 입력 단계에서 미리 선택
        const contract = contractByNo(contractNo);
        flow.values.who = isInsuredOther(contract) ? insuredLabel(contract) : `${contract.insured}(본인)`;
      },
      items: () => contractChoices(c => ['실손', '종신', '어린이', '암'].includes(c.kind), c => ({ '실손': '실손 보장', '어린이': '입원·실손 보장', '암': '암 진단·수술 보장' } as Record<string, string>)[c.kind] || '진단·입원 보장') },
    intro: { tone: 'info', title: '청구 전에 준비하세요', desc: '통원: 진료비 영수증 + 진료비 세부내역서 · 입원/수술: 진단서 또는 입·퇴원확인서 + 영수증 · 100만원 이하는 진단서 대신 처방전도 가능' },
    fields: [
      { id: 'who', label: '피보험자', type: 'radio', options: ['홍길동(본인)', '홍서연(자녀)', '김영희(배우자)'],
        help: '피보험자가 본인이 아니면 피보험자 동의서(미성년 자녀는 법정대리인 확인서)를 함께 올려 주세요.' },
      { id: 'acc', label: '사고 유형', type: 'radio', options: ['질병', '상해(사고)', '교통사고'] },
      { id: 'kind', label: '청구 내용', type: 'checks', inline: true, options: ['통원치료', '입원', '수술', '진단(암·뇌·심장 등)', '장해'] },
      { id: 'date1', label: '사고일(발병일)', type: 'date', value: '2026-09-20' },
      { id: 'date2', label: '초진일', type: 'date', value: '2026-09-20' },
      { id: 'hosp', label: '병원명', placeholder: '예: ○○내과의원', optional: true },
      { id: 'acct', label: '보험금 받을 계좌', type: 'account' },
      { id: 'docs', label: '증빙서류', type: 'file', placeholder: '영수증·세부내역서 등을 촬영해 올려 주세요' }],
    agree: ['[필수] 개인(신용)정보 수집·이용·제공 동의', '[필수] 민감정보(질병·상해 정보) 처리 동의', '[필수] 고유식별정보 처리 동의'],
    warn: '보험사기는 보험사기방지특별법에 따라 10년 이하 징역 또는 5천만원 이하 벌금에 처해질 수 있습니다. 사실과 다른 청구를 하지 마세요.',
    done: '보험금 청구가 접수되었습니다. 심사 결과는 카카오 알림톡으로 알려드립니다.', receiptPrefix: 'C2610',
    doneNext: ['청구 진행 조회', 'PY-02'] },

  'PY-04': {
    pick: { label: '받으실 보험금을 선택하세요', items: () => [
      { key: 'm', title: '만기보험금 (일부) · (무)iM 유니버설저축보험', sub: '발생일 2026.04.20', value: '1,500,000원' },
      { key: 'd', title: '분할보험금 · (무)iM 든든한 종신보험', sub: '발생일 2026.07.15', value: '350,000원' }] },
    fields: [{ id: 'acct', label: '입금 계좌', type: 'account' }],
    calc: (_values, picked) => {
      const gross = picked === 'm' ? 1500000 : 350000;
      const tax = picked === 'm' ? Math.round(gross * 0.154 * 0.2) : 0;
      return [['발생 지급금', formatWon(gross)], ['원천징수(이자소득세 등)', formatWon(tax)], ['실지급액', formatWon(gross - tax), true]];
    },
    warn: '이자소득이 있는 경우 소득세법에 따라 세금이 원천징수됩니다.',
    done: '지급 신청이 완료되었습니다. 영업일 기준 1일 이내 입금됩니다.', receiptPrefix: 'P2610' },

  'PY-05': {
    pick: { label: '인출할 계약을 선택하세요', items: () => contractChoices(c => c.isUniversal || c.isVariable, c => (c.isUniversal ? '인출가능 5,210,000원' : '인출가능 4,700,000원')) },
    intro: { tone: 'info', title: '올해 남은 인출 횟수 11회 (연 12회)', desc: '1회 인출 수수료 2,000원 · 최소 10만원부터 1만원 단위' },
    fields: [
      { id: 'amt', label: '인출 금액', type: 'money', max: 5210000, min: 100000, quick: [100000, 500000, 1000000, 'max'] },
      { id: 'acct', label: '입금 계좌', type: 'account' }],
    calc: values => {
      const amount = Number(values.amt) || 0;
      return [['인출 금액', formatWon(amount)], ['수수료', formatWon(amount ? 2000 : 0)], ['인출 후 적립금', formatWon(26450300 - amount)], ['실지급액', formatWon(Math.max(amount - 2000, 0)), true]];
    },
    warn: '중도인출하면 적립금이 줄어들어 만기보험금·해지환급금이 감소하며, 보장 금액이 줄어들 수 있습니다.',
    done: '중도인출 신청이 완료되었습니다. 영업일 기준 1일 이내 입금됩니다.', receiptPrefix: 'W2610' },

  'PY-07': {
    pick: { label: '받으실 보험금을 선택하세요', items: () => [
      { key: 'a', title: '휴면보험금 · (무)iM 유니버설저축보험', sub: '발생일 2023.04.15 · 중도보험금', value: '412,350원' },
      { key: 'b', title: '휴면 배당금 · (유)iM 교육보험(소멸)', sub: '발생일 2021.11.02', value: '38,120원' }] },
    fields: [{ id: 'acct', label: '입금 계좌', type: 'account' }],
    calc: (_values, picked) => {
      const amount = picked === 'a' ? 412350 : 38120;
      return [['지급 대상 금액', formatWon(amount)], ['실지급액', formatWon(amount), true]];
    },
    done: '미수령보험금 지급 신청이 완료되었습니다.', receiptPrefix: 'P2610' },

  'PY-09': {
    pick: { label: '연금 계약을 선택하세요', items: () => contractChoices(c => c.isAnnuity, () => '월 1,032,000원 예정') },
    fields: [
      { id: 'cycle', label: '지급 주기', type: 'radio', options: ['매월', '3개월', '6개월', '매년'] },
      { id: 'acct', label: '연금 받을 계좌', type: 'account' }],
    calc: values => {
      const months = ({ '매월': 1, '3개월': 3, '6개월': 6, '매년': 12 } as Record<string, number>)[String(values.cycle || '매월')];
      const gross = 1032000 * months;
      const tax = Math.round(gross * 0.055);
      return [['회당 지급 예정액', formatWon(gross)], ['연금소득세(5.5%)', formatWon(tax)], ['회당 실수령 예상', formatWon(gross - tax), true]];
    },
    warn: '연금소득은 연령에 따라 3.3%~5.5% 세율로 원천징수되며, 사적연금 연 1,500만원 초과 시 종합과세 또는 분리과세를 선택할 수 있습니다.',
    done: '연금 지급 신청이 완료되었습니다. 첫 연금은 연금개시일에 입금됩니다.', receiptPrefix: 'A2610' },

  'PM-01': {
    pick: { label: '납입할 계약을 선택하세요', items: () => contractChoices(c => c.status === '정상' || c.status === '납입유예', c => formatWon(c.premium)) },
    fields: [
      { id: 'cnt', label: '납입 회차', type: 'radio', options: ['이번 회차(10월분)', '2개월 선납', '3개월 선납'] },
      { id: 'how', label: '납입 방법', type: 'radio', options: [PAY_BY_ACCOUNT, PAY_BY_VIRTUAL] },
      { id: 'acct', label: '출금 계좌', type: 'account', showWhen: { field: 'how', value: PAY_BY_ACCOUNT } },
      { id: 'vbank', label: '가상계좌 발급 은행', type: 'radio', options: Object.keys(VIRTUAL_ACCOUNT_BANKS), showWhen: { field: 'how', value: PAY_BY_VIRTUAL },
        help: '선택한 은행의 가상계좌가 인증을 마친 뒤 발급됩니다.' }],
    calc: (values, picked) => {
      const contract = contractByNo(picked ?? '');
      const count = String(values.cnt ?? '');
      const months = count.startsWith('2') ? 2 : count.startsWith('3') ? 3 : 1;
      const discount = months > 1 ? Math.round(contract.premium * (months - 1) * 0.004) : 0;
      return [['납입 보험료', formatWon(contract.premium * months)], ['선납 할인', formatWon(discount)], ['납입할 금액', formatWon(contract.premium * months - discount), true]];
    },
    doneTitle: values => (isVirtualPayment(values) ? '가상계좌가 발급되었습니다' : ''),
    done: values => (isVirtualPayment(values) ? '아래 가상계좌로 입금하시면 보험료 납입이 완료됩니다.' : '보험료 납입이 완료되었습니다.'),
    doneExtra: flow => (isVirtualPayment(flow.values) ? <VirtualAccountInfo account={flow.virtualAccount ??= issueVirtualAccount(flow.values)} today={APP.today} /> : null),
    doneGuide: values => (isVirtualPayment(values) ? '입금이 확인되면 납입 완료를 알려드립니다.' : ''),
    receiptPrefix: 'R2610' },

  'PM-04': {
    pick: { label: '유니버설 계약을 선택하세요', items: () => contractChoices(c => c.isUniversal, () => '추가납입 잔여 한도 4,800,000원') },
    fields: [
      { id: 'kind', label: '처리 구분', type: 'radio', options: ['추가납입', '납입 일시중지 해제', '납입 일시중지 연장'] },
      { id: 'amt', label: '추가납입 금액', type: 'money', max: 4800000, quick: [100000, 500000, 1000000, 'max'], help: '처리 구분이 추가납입일 때만 입력합니다.', optional: true },
      { id: 'acct', label: '출금 계좌', type: 'account' }],
    warn: '납입을 일시중지하면 매월 위험보험료 등 월대체보험료가 적립금에서 차감되며, 적립금이 부족하면 계약이 해지될 수 있습니다.',
    done: '자유납입 신청이 처리되었습니다.', receiptPrefix: 'R2610' },

  'CH-02': {
    pick: { label: '감액완납할 계약을 선택하세요', items: () => contractChoices(c => c.kind === '종신', () => '현재 사망보험금 1억원') },
    intro: { tone: 'info', title: '감액완납이란', desc: '지금까지 쌓인 해지환급금으로 보험료를 모두 낸 것으로 처리하고, 보장 금액을 줄여 계약을 유지하는 방법입니다. 이후 보험료를 내지 않습니다.' },
    fields: [],
    calc: () => [['현재 사망보험금', '100,000,000원'], ['현재 월 보험료', '128,400원'], ['감액완납 후 사망보험금', '43,500,000원', true], ['이후 보험료', '0원 (납입 면제)']],
    warn: '감액완납하면 모든 특약(재해사망·암진단·입원일당)이 소멸되며, 다시 원래 계약으로 되돌릴 수 없습니다.',
    agree: ['특약 소멸 및 보장 축소 내용을 확인했습니다.'],
    done: '감액완납 변경이 완료되었습니다. 변경된 보험증권을 이메일로 보내드립니다.', receiptPrefix: 'H2610' },

  'CH-03': {
    pick: { label: '계약을 선택하세요', items: () => contractChoices(c => c.kind === '종신', () => '특약 3개') },
    fields: [{ id: 'riders', label: '해지할 특약', type: 'checks', options: ['재해사망특약 (월 8,200원)', '암진단특약 (월 21,300원)', '입원일당특약 (월 6,900원)'] }],
    calc: values => {
      const riderPremium = { '재해': 8200, '암진': 21300, '입원': 6900 };
      const riders = Array.isArray(values.riders) ? values.riders : [];
      const removed = riders.reduce((sum, rider) =>
        sum + Object.entries(riderPremium).reduce((total, [prefix, premium]) => total + (rider.startsWith(prefix) ? premium : 0), 0), 0);
      return [['변경 전 월 보험료', '128,400원'], ['특약 해지환급금', formatWon(Math.round(removed * 12 * 0.6))], ['변경 후 월 보험료', formatWon(128400 - removed), true]];
    },
    warn: '특약을 해지하면 해당 보장이 즉시 사라지며, 나이·건강 상태에 따라 다시 가입하지 못할 수 있습니다.',
    agree: ['변경 전후 보장 내용을 비교해 확인했습니다.'],
    done: '특약 해지가 완료되었습니다.', receiptPrefix: 'H2610' },

  'CH-04': {
    pick: { label: '해지할 계약을 선택하세요', items: () => contractChoices(c => c.surrender > 0, c => '예상 ' + formatWon(c.surrender)) },
    retain: true,
    fields: [
      { id: 'why', label: '해지 사유', type: 'select', options: ['보험료 납입이 부담돼서', '목돈이 필요해서', '다른 보험으로 바꾸려고', '보장이 필요 없어져서', '기타'] },
      { id: 'acct', label: '환급금 받을 계좌', type: 'account' }],
    calc: (_values, picked) => {
      const contract = contractByNo(picked ?? '');
      return [
        ['납입한 보험료 합계', formatWon(contract.paidSum)], ['예상 해지환급금', formatWon(contract.surrender)],
        ['보험계약대출 상계', formatWon(-contract.loan)], ['실수령 예상액', formatWon(contract.surrender - contract.loan), true],
        ['환급률', (contract.surrender / contract.paidSum * 100).toFixed(1) + '%']];
    },
    warn: '해지하면 모든 보장이 즉시 사라집니다. 같은 보장을 새로 가입할 때 보험료가 오르거나 건강 상태에 따라 가입이 거절될 수 있습니다. 해지환급금은 납입한 보험료보다 적을 수 있습니다.',
    agree: ['[필수] 해지 시 불이익(보장 소멸, 재가입 제한, 원금 손실 가능성)을 설명 듣고 이해했습니다.', '[필수] 해지 후에는 계약을 되살릴 수 없음을 확인했습니다.'],
    done: '해지 신청이 완료되었습니다. 환급금은 영업일 기준 1일 이내 입금됩니다.', receiptPrefix: 'X2610' },

  'CH-06': {
    pick: { label: '철회할 계약을 선택하세요', items: () => [{ key: 'new', title: '(무)iM 튼튼치아보험', sub: '청약일 2026.09.20 · 철회 기한 2026.10.20', value: '반환 31,200원' }] },
    intro: { tone: 'ok', title: '청약철회권(금융소비자보호법)', desc: '보험증권을 받은 날부터 15일, 청약한 날부터 30일 이내에 불이익 없이 철회할 수 있습니다. 낸 보험료는 전액 돌려드립니다.' },
    fields: [
      { id: 'why', label: '철회 사유', type: 'select', options: ['단순 변심', '보장 내용이 생각과 달라서', '보험료가 부담돼서', '기타'] },
      { id: 'acct', label: '환불 계좌', type: 'account' }],
    calc: () => [['납입 보험료', '31,200원'], ['반환 보험료', '31,200원', true], ['환불 예정일', '2026.10.06']],
    done: '청약 철회가 접수되었습니다. 2026.10.06까지 환불됩니다.', receiptPrefix: 'Q2610' },

  'CH-05': {
    pick: {
      label: '연금개시 나이를 바꿀 계약을 선택하세요',
      items: () => contractChoices(c => c.isAnnuity, c => `현재 ${c.annuityAge}세 개시 (${c.annuityDate})`),
      custom: 'annuity',
    },
    skipConfirm: true,
    get fields(): FieldSpec[] {
      const contract = pickedAnnuityContract();
      return [{ id: 'age', label: '변경 후 연금개시 나이', type: 'select', placeholder: '선택하세요',
        options: contract ? annuityAgeOptions(contract) : [],
        help: `변경 가능 범위 ${ANNUITY_AGE_RANGE[0]}세 ~ ${ANNUITY_AGE_RANGE[1]}세 · 현재 개시 나이는 목록에서 뺐습니다.` }];
    },
    calc: values => {
      const contract = pickedAnnuityContract();
      if (!contract) return [];
      return [['현재 연금개시', `${contract.annuityAge}세 (${contract.annuityDate})`],
              ['변경 후 연금개시', String(values.age || '선택 전'), true]];
    },
    warn: '연금개시를 늦추면 적립 기간이 길어져 연금액이 늘어나고, 앞당기면 줄어듭니다. 연금이 개시된 뒤에는 바꿀 수 없습니다.',
    done: '연금개시연도 변경이 완료되었습니다.', receiptPrefix: 'H2610' },

  'CH-07': {
    pick: { label: '연금 계약을 선택하세요', items: () => contractChoices(c => c.isAnnuity, c => '연금개시 ' + c.annuityDate) },
    fields: ANNUITY_OPTION_FIELDS,
    compact: true,                       // 선택 항목이 많아 2열 · 버튼형으로 촘촘하게
    lockRules: annuityLockRules,
    calc: annuityOptionCalc,
    warn: '연금 개시 이후에는 연금 유형을 바꿀 수 없습니다. 예상 연금액은 현재 공시이율 기준 예시이며 확정된 금액이 아닙니다.',
    done: '연금개시유형 변경이 완료되었습니다.', receiptPrefix: 'H2610' },

  'CH-11': {
    pick: { label: '연금으로 전환할 종신보험을 선택하세요', items: () => contractChoices(isConvertible, c => '적립금 ' + formatWon(c.surrender)) },
    intro: { tone: 'info', title: '연금전환 사전신청이란', desc: '종신보험의 적립금을 원하는 나이에 연금으로 받도록 미리 신청하는 서비스입니다. 전환 예정일 30일 전에 다시 안내드리며, 그 전까지 변경·취소할 수 있습니다.' },
    fields: ANNUITY_CONVERSION_FIELDS,
    calc: annuityConversionCalc,
    warn: '연금으로 전환되면 사망보장이 없어지거나 줄어들며, 전환 후에는 되돌릴 수 없습니다. 예상 금액은 공시이율 2.5% 가정 예시이며 확정된 금액이 아닙니다.',
    agree: ['[필수] 연금 전환 시 사망보장이 소멸·감소됨을 확인했습니다.'],
    done: '연금전환 사전신청이 접수되었습니다. 전환 예정일 30일 전에 알림톡으로 다시 안내드립니다.', receiptPrefix: 'H2610' },

  'CH-10': {
    pick: { label: '계약을 선택하세요', items: () => contractChoices(() => true, c => '현재 수익자 ' + c.beneficiary) },
    fields: [
      { id: 'target', label: '변경할 수익자', type: 'radio', options: ['사망수익자', '만기수익자', '기타(장해·입원) 수익자'] },
      { id: 'nm', label: '새 수익자 이름' },
      { id: 'bd', label: '생년월일', type: 'date' },
      { id: 'rel', label: '계약자와의 관계', type: 'select', options: ['배우자', '자녀', '부모', '형제자매', '기타'] },
      { id: 'tel', label: '새 수익자 휴대폰', type: 'tel', placeholder: '010-0000-0000' }],
    warn: '사망수익자를 변경하려면 상법 제734조에 따라 피보험자의 서면(전자) 동의가 필요합니다. 피보험자 휴대폰으로 동의 요청을 보냅니다.',
    agree: ['피보험자에게 동의 요청 알림톡을 보내는 데 동의합니다.'],
    done: '수익자 변경이 접수되었습니다. 피보험자 동의가 완료되면 변경이 확정됩니다.', receiptPrefix: 'H2610' },

  'LN-02': {
    pick: {
      custom: 'loan',
      describe: flow => <LoanRequestSummary contracts={CONTRACTS} amount={loanAmountOf(flow)} />,
      summary: (flow, step) => <LoanResult contracts={CONTRACTS} amount={loanAmountOf(flow)} step={step} />,
    },
    intro: { tone: 'ok', title: '보험계약대출은 신용점수에 영향이 없습니다', desc: '해지하지 않고 해지환급금 범위에서 바로 받을 수 있습니다. 중도상환수수료 없음.' },
    fields: [{ id: 'acct', label: '입금 계좌', type: 'account' }],
    calc: values => loanCalcRows(CONTRACTS, Number(values.loanAmount) || 0),
    warn: '대출 이자를 내지 않으면 원금에 더해져 해지환급금이 줄고, 대출 원리금이 해지환급금을 넘으면 계약이 해지될 수 있습니다.',
    agree: ['[필수] 보험계약대출 상품설명서를 확인했습니다.', '[필수] 보험계약대출 약정에 전자서명합니다.'],
    done: '대출이 실행되었습니다. 신청 금액이 바로 입금됩니다.', receiptPrefix: 'L2610' },

  'LN-04': {
    pick: { label: '상환할 대출을 선택하세요', items: () => [{ key: 'l1', title: '보험계약대출 · (무)iM 든든한 종신보험', sub: '대출일 2025.11.20 · 연 4.30%', value: '잔액 3,000,000원' }] },
    fields: [
      { id: 'kind', label: '상환 구분', type: 'radio', options: ['일부 상환', '전액 상환', '이자만 납입'] },
      { id: 'amt', label: '상환 금액', type: 'money', max: 3000000, quick: [100000, 500000, 1000000, 'max'], optional: true, help: '전액 상환·이자만 납입은 금액이 자동 계산됩니다.' },
      { id: 'acct', label: '출금 계좌', type: 'account' }],
    calc: values => {
      const kind = values.kind || '일부 상환';
      const interest = 10750;
      const principal = kind === '전액 상환' ? 3000000 : kind === '이자만 납입' ? 0 : (Number(values.amt) || 0);
      return [['대출 잔액', '3,000,000원'], ['경과 이자', formatWon(interest)], ['상환 원금', formatWon(principal)], ['출금 금액', formatWon(principal + interest), true], ['상환 후 잔액', formatWon(3000000 - principal)]];
    },
    done: '상환이 완료되었습니다.', receiptPrefix: 'L2610' },
};
