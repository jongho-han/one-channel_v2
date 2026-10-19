import { formatWon, toNumber } from '../core/format';
import { USER, activeContracts } from '../data/customerRepository.js';

/* T4 단일폼 변경 (current: 현재 등록값 / custom: 전용 화면 notice · marketing · fund) */

export const CHANGE_FORMS = {
  'MY-01': {
    current: [['자택 주소', `(${USER.homeZip}) ${USER.homeAddress}`], ['직장 주소', `(${USER.workZip}) ${USER.workAddress}`], ['휴대폰', USER.phone], ['이메일', USER.email]],
    fields: [
      { id: 'addrH', label: '자택 주소', type: 'addr', zip: USER.homeZip, value: USER.homeAddress },
      { id: 'addrW', label: '직장 주소', type: 'addr', zip: USER.workZip, value: USER.workAddress, optional: true },
      { id: 'mob', label: '휴대폰', type: 'tel', value: USER.phone },
      { id: 'telH', label: '자택 전화', type: 'tel', value: USER.homeTel, optional: true },
      { id: 'telW', label: '직장 전화', type: 'tel', value: USER.workTel, optional: true },
      { id: 'mail', label: '이메일', type: 'email', value: USER.email }],
    note: '변경한 연락처는 보유하신 모든 계약에 함께 적용됩니다. 개인정보 보호를 위해 변경 사실을 변경 전 휴대폰·이메일로도 알려드립니다.',
    done: '연락처 변경이 완료되었습니다.' },
  'MY-02': { custom: 'notice', note: '법정 안내장(계약사항 안내, 변액 운용보고서 등)은 받지 않음을 선택할 수 없습니다.', done: '안내장 수신 방법이 변경되었습니다.' },
  'MY-03': { custom: 'marketing', note: '개인정보보호법·신용정보법에 따라 동의는 언제든 철회할 수 있으며, 철회해도 계약 유지에는 영향이 없습니다.', done: '마케팅 동의 설정이 변경되었습니다.' },
  'PY-08': {
    current: [['자동송금 대상', '분할보험금 · (무)iM 든든한 종신보험'], ['현재 등록 계좌', 'iM뱅크 508-12-****91'], ['상태', '신청됨']],
    fields: [{ id: 'mode', label: '처리 구분', type: 'radio', options: ['계좌 변경', '자동송금 해지'] }, { id: 'acct', label: '새 입금 계좌', type: 'account' }],
    note: '자동송금은 본인 명의 계좌로만 신청할 수 있습니다.', done: '자동송금 설정이 변경되었습니다.' },
  'PM-02': {
    current: activeContracts.map(c => [c.name, `${c.account} · 매월 ${c.debitDay}`]),
    fields: [
      { id: 'ct', label: '변경할 계약', type: 'select', options: activeContracts.map(c => c.name) },
      { id: 'bank', label: '은행', type: 'select', options: ['iM뱅크', '국민은행', '신한은행', '우리은행', '하나은행', '농협은행', '기업은행', '카카오뱅크', '토스뱅크'] },
      { id: 'no', label: '계좌번호', placeholder: '- 없이 숫자만', numeric: true },
      { id: 'day', label: '이체일', type: 'radio', options: ['5일', '10일', '15일', '20일', '25일', '말일'], value: '25일' }],
    agree: ['[필수] 출금이체 동의(전자서명)'],
    note: '계좌 명의가 계약자와 다르면 예금주 동의가 추가로 필요합니다. 변경은 다음 이체일부터 적용됩니다.',
    done: '자동이체 정보가 변경되었습니다. 다음 이체일부터 적용됩니다.' },
  'PM-03': {
    current: [['(무)iM 든든한 종신보험', '미신청 · 대출가능 2,890,000원 · 연 4.30%'], ['(무)iM 하이브리드 변액연금보험', '미신청 · 대출가능 11,200,000원 · 연 4.75%']],
    fields: [
      { id: 'ct', label: '계약', type: 'select', options: ['(무)iM 든든한 종신보험', '(무)iM 하이브리드 변액연금보험'] },
      { id: 'mode', label: '처리 구분', type: 'radio', options: ['자동대출납입 신청', '자동대출납입 취소'] }],
    note: '보험료가 납입되지 않으면 해지환급금 범위에서 자동으로 대출해 보험료를 냅니다. 대출 이자가 발생하며 대출금이 늘어날수록 해지환급금이 줄어듭니다.',
    done: '자동대출납입 설정이 변경되었습니다.' },
  'CH-01': { custom: 'fund', nextLabel: '다음', note: '펀드 변경은 연 12회까지 무료입니다. 적합성진단 결과로 변경할 수 없으면 당일에는 다시 진단할 수 없고, 다음 날 다시 진행할 수 있습니다.', done: '펀드 변경이 접수되었습니다. 접수일 다음 영업일 기준가로 적용됩니다.' },
  'CH-08': {
    current: [['금융정보보호 서비스', '미신청']],
    fields: [{ id: 'mode', label: '처리 구분', type: 'radio', options: ['신청', '해제'] }],
    note: '신청하면 대출·지급·계좌 변경 등 금전 거래를 사이버창구·모바일에서 할 수 없고, 영업점 방문 본인 확인 후에만 처리됩니다. 명의 도용 피해를 예방할 수 있습니다.',
    done: '금융정보보호 설정이 변경되었습니다.' },
  'CH-09': {
    current: [['대상 계약', '(무)iM 실손의료비보험 (계약자=피보험자=수익자)'], ['현재 대리청구인', '지정 안 됨']],
    fields: [
      { id: 'nm', label: '대리청구인 이름' },
      { id: 'bd', label: '생년월일', type: 'date' },
      { id: 'rel', label: '피보험자와의 관계', type: 'select', options: ['배우자', '자녀', '부모', '형제자매(3촌 이내 친족)'] },
      { id: 'tel', label: '대리청구인 휴대폰', type: 'tel', placeholder: '010-0000-0000' }],
    note: '피보험자가 직접 보험금을 청구할 수 없는 상황(의식불명 등)에 대비해 가족을 미리 지정합니다. 지정 가능 범위: 배우자, 3촌 이내 친족.',
    done: '대리청구인 지정이 완료되었습니다.' },
  'LN-05': {
    current: [['분할상환 가능 대출', '보험계약대출 · (무)iM 든든한 종신보험'], ['대출 잔액', '3,000,000원'], ['현재 상환 방식', '만기 일시상환']],
    fields: [
      { id: 'm', label: '월 상환 원금', type: 'radio', options: ['100,000원', '200,000원', '300,000원', '500,000원'] },
      { id: 'day', label: '이체일', type: 'radio', options: ['5일', '10일', '20일', '25일'], value: '20일' },
      { id: 'acct', label: '출금 계좌', type: 'account' }],
    calc: values => {
      const monthly = toNumber(values.m || '100,000원');
      return [['월 상환 원금', formatWon(monthly)], ['첫 달 이자(예상)', formatWon(10750)], ['상환 완료까지', Math.ceil(3000000 / monthly) + '개월', true]];
    },
    note: '정액분할상환 중에도 언제든 추가·전액 상환할 수 있습니다.', done: '정액분할상환 신청이 완료되었습니다.' },
  'LN-06': {
    current: [['원리금 자동이체', '신청됨'], ['출금 계좌', 'iM뱅크 508-12-****91'], ['이체일', '매월 20일']],
    fields: [
      { id: 'mode', label: '처리 구분', type: 'radio', options: ['계좌·이체일 변경', '자동이체 해지'] },
      { id: 'acct', label: '출금 계좌', type: 'account' },
      { id: 'day', label: '이체일', type: 'radio', options: ['5일', '10일', '20일', '25일'], value: '20일' }],
    note: '자동이체를 해지하면 매월 이자를 직접 내야 하며, 미납 이자는 원금에 더해집니다.', done: '원리금 자동이체 설정이 변경되었습니다.' },
};
