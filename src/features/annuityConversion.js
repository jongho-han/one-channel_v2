import { APP } from '../core/config';
import { formatWon } from '../core/format';
import { USER, contractByNo } from '../data/customerRepository';

/* 연금전환 사전신청 (CH-11): 종신보험 적립금을 정한 나이에 연금으로 바꾸도록 미리 신청 */
const CONVERSION_AGES = [55, 60, 65, 70];
const ASSUMED_RATE = 0.025;   // 예시 적립 이율(공시이율 가정)
/** 연금 유형별 [연간 지급 비율 계산] — 예시값 */
const PAYOUT = {
  '종신연금(10년 보증)': reserve => reserve / 25,
  '확정연금 10년':       reserve => reserve * 1.12 / 10,
  '확정연금 20년':       reserve => reserve * 1.25 / 20,
};

const yearOf = date => Number(date.slice(0, 4));
const currentAge = () => yearOf(APP.today) - yearOf(USER.birth);

export const isConvertible = contract => ['종신', '변액종신'].includes(contract.kind);

export const ANNUITY_CONVERSION_FIELDS = [
  { id: 'age', label: '연금 전환 나이', type: 'select', placeholder: '선택하세요',
    options: CONVERSION_AGES.filter(age => age > currentAge()).map(age => `${age}세 (${yearOf(USER.birth) + age}년)`),
    help: '전환 예정일은 선택한 나이가 되는 해의 계약 해당일입니다.' },
  { id: 'type', label: '연금 유형', type: 'radio', options: Object.keys(PAYOUT) },
  { id: 'cycle', label: '지급 주기', type: 'radio', options: ['매월', '매년'] },
  { id: 'acct', label: '연금 받을 계좌', type: 'account' },
];

/** 전환 시점 예상 적립금·연금액(예시) */
export function annuityConversionCalc(values, picked) {
  const contract = contractByNo(picked);
  const age = parseInt(values.age, 10);
  const type = values.type || Object.keys(PAYOUT)[0];
  const rows = [['현재 해지환급금(적립금)', formatWon(contract.surrender)]];
  if (!age) return [...rows, ['전환 나이', '선택 전']];

  const reserve = Math.round(contract.surrender * (1 + ASSUMED_RATE) ** (age - currentAge()) / 1000) * 1000;
  const yearly = PAYOUT[type](reserve);
  const perPayment = values.cycle === '매년' ? yearly : yearly / 12;
  return [...rows,
    ['전환 예정', values.age],
    ['전환 시점 예상 적립금(예시)', formatWon(reserve)],
    [`${values.cycle || '매월'} 예상 연금액(예시)`, formatWon(Math.round(perPayment / 100) * 100), true]];
}
