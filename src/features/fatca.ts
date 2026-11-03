/* FATCA·CRS 본인확인서 (국제조세조정에 관한 법률): 미국인·해외 거주자 여부, 해당하면 영문성명·납세자 정보·증빙서류 */
import type { FieldSpec } from '../components/form/fieldSpec';
import { maskPhone } from '../core/format';
import { USER } from '../data/customerRepository';

export const FATCA_STEP = 'FATCA·CRS';

/** 미국인 또는 해외 거주자 '예'가 하나라도 있을 때 */
const anyYes = [{ field: 'fcUs', value: '예' }, { field: 'fcRes', value: '예' }] as const;

export const FATCA_FIELDS: readonly FieldSpec[] = [
  { id: 'fcUs', label: '미국 세법상 미국인에 해당하나요?', type: 'radio', options: ['예', '아니오'], value: '아니오' },
  { id: 'fcUsType', label: '해당되는 사항', type: 'checks', options: ['미국시민권자(이중국적자 포함)', '미국영주권자', '미국거주자'], showWhen: { field: 'fcUs', value: '예' } },
  { id: 'fcRes', label: '대한민국 외 국가의 조세목적상 거주자인가요?', type: 'radio', options: ['예', '아니오'], value: '아니오',
    help: "국적이 한국이고 두 질문이 모두 '아니오'이면 납세자 정보는 작성하지 않아도 됩니다." },
  { id: 'fcLast', label: '영문 성(Last Name)', placeholder: 'HONG', showWhen: anyYes },
  { id: 'fcFirst', label: '영문 이름(First Name)', placeholder: 'GILDONG', showWhen: anyYes },
  { id: 'fcCountry', label: '거주지국', type: 'select', placeholder: '선택해 주세요', options: ['미국', '일본', '중국', '캐나다', '호주', '영국', '독일', '싱가포르', '기타'], showWhen: anyYes },
  { id: 'fcAddr', label: '영문주소(우편번호 포함)', type: 'textarea', placeholder: 'Street, City, State, ZIP Code', showWhen: anyYes },
  { id: 'fcTinHave', label: '납세자번호(TIN)', type: 'radio', options: ['있음', '없음'], showWhen: anyYes, help: '미국인은 납세자번호(SSN 또는 ITIN)가 필수입니다.' },
  { id: 'fcTin', label: '납세자번호(TIN: SSN 또는 ITIN)', placeholder: '숫자 9자리', numeric: true, showWhen: { field: 'fcTinHave', value: '있음' } },
  { id: 'fcNoTin', label: '납세자번호가 없는 사유', type: 'radio', options: ['미발급 국가', '미요구 국가', '미취득', '기타'],
    other: { option: '기타', placeholder: '사유를 입력해 주세요' }, showWhen: { field: 'fcTinHave', value: '없음' }, help: '미국 외 국가만 해당합니다.' },
  { id: 'fcDoc1', label: '주민등록등본', type: 'file', showWhen: anyYes, help: '성명과 주소가 보이도록 전체를 촬영해 올려 주세요.' },
  { id: 'fcDoc2', label: '납세자번호 증명서', type: 'file', showWhen: { field: 'fcTinHave', value: '있음' }, help: 'SSN 등 납세자번호가 확인되는 카드 또는 서류' },
];

/** 고객 인적사항 (계약 정보로 자동 표시) */
export const FATCA_PROFILE: readonly (readonly [string, string])[] = [
  ['성명', USER.name], ['생년월일', USER.birth], ['국적', '대한민국'], ['주소', USER.homeAddress], ['전화번호', maskPhone(USER.phone)],
];
