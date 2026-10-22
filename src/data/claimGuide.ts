/* 보험금 청구(PY-01) 안내 단계 문구 · 청구 종류(본인·자녀·수익자)와 종류별 피보험자 */
import type { FieldSpec } from '../components/form/fieldSpec';

/** 청구사항 안내 표: [항목, 내용 줄(여러 줄이면 목록)] */
export const CLAIM_GUIDE: readonly (readonly [label: string, lines: readonly string[]])[] = [
  ['보험금 청구 대상', ['피보험자(보험대상자)별 청구금액 1,000만원 이하인 건', '금액을 넘으면 창구 방문 또는 우편으로 접수할 수 있습니다.']],
  ['이용 가능 시간', ['보험금 청구사항 입력 및 첨부파일 저장: 08:00 ~ 23:00']],
  ['확인할 사항', [
    '인터넷 청구는 반드시 서류를 파일로 첨부해야 합니다.',
    '심사·사고조사를 위해 제출하신 서류 외에 추가 서류가 필요할 수 있습니다.',
    '영업시간 외(17:00 이후) 접수 건은 다음 영업일에 접수되며, 다음 영업일이 접수일이 됩니다.',
    '구비서류가 모두 갖추어져야 담당자가 보험금 접수를 완료합니다.',
    '보험금 접수가 완료되면 문자(SMS)로 알려드립니다.']],
  ['기타 사항', [
    '피보험자(보험대상자)별 청구금액 300만원 이하인 건은 팩스(0505-083-5420)로도 청구할 수 있습니다.',
    '기타 문의는 iM라이프 콜센터(1588-4770)로 연락해 주세요.']],
];

/** 보험금 청구 및 지급 절차 */
export const CLAIM_PROCEDURE: readonly string[] = ['계약사항 조회', '청구사항 입력', '구비서류 제출', '보험금 접수(SMS)', '서류심사 및 현장심사', '보험금 지급'];

export const CLAIM_NOTES: readonly string[] = ['필요 시 추가 서류 제출을 요청드릴 수 있습니다.', '단체보험 보험금 청구 시에는 재직증명서 제출을 요청드릴 수 있습니다.'];

export interface ClaimType {
  key: 'self' | 'child' | 'beneficiary';
  label: string;
  desc: string;                 // 탭 아래 설명
  who: readonly string[];       // 입력 단계 피보험자 선택지
  help: string;                 // 피보험자 칸 안내
}

export const CLAIM_TYPES: readonly ClaimType[] = [
  { key: 'self', label: '본인보험금 접수', desc: '본인이 피보험자(보험대상자)인 보험금을 청구합니다.',
    who: ['홍길동(본인)'], help: '본인이 피보험자인 계약의 보험금을 청구합니다.' },
  { key: 'child', label: '자녀보험금 접수', desc: '※ 자녀보험금 접수는 피보험자 자녀가 미성년자일 때에만 가능합니다.',
    who: ['홍서연(자녀)'], help: '미성년 자녀는 법정대리인 확인서(가족관계증명서)를 함께 올려 주세요.' },
  { key: 'beneficiary', label: '수익자 청구', desc: '피보험자가 아닌 보험금 수익자가 청구합니다. (피보험자 사망 등)',
    who: ['김영희(배우자)', '홍서연(자녀)'], help: '수익자 청구는 피보험자 동의서 또는 사망진단서·가족관계증명서를 함께 올려 주세요.' },
];

export const claimTypeOf = (key: unknown): ClaimType => CLAIM_TYPES.find(type => type.key === key) ?? CLAIM_TYPES[0];

/** 입력 항목 중 피보험자(who) 선택지·안내만 청구 종류에 맞게 바꿈 */
export function withClaimType<T extends Pick<FieldSpec, 'id' | 'options' | 'help'>>(fields: readonly T[], key: unknown): (T & { help?: string })[] {
  const type = claimTypeOf(key);
  return fields.map(field => (field.id === 'who' ? { ...field, options: [...type.who], help: type.help } : field));
}
