/* FATCA·CRS 본인확인서: 대출 신청(LN-02) 입력 → FATCA·CRS → 확인. 모두 '아니오'면 두 질문만, '예'가 하나라도 있으면 영문성명·납세자 정보·증빙서류 */
import type { FieldValues } from '../../../../src/components/form/fieldSpec';
import { FATCA_FIELDS } from '../../../../src/features/fatca';
import { isFieldVisible } from '../../../../src/form/display';
import { validateValues } from '../../../../src/form/validation';
import { STEP_FLOWS } from '../../../../src/screens/stepFlows';
import { confirmRows, stepsOf } from '../../../../src/screens/stepFlow/stepRules';

const visibleIds = (values: FieldValues) => FATCA_FIELDS.filter(field => isFieldVisible(field, FATCA_FIELDS, values)).map(field => field.id);

test('보험계약대출 신청 단계: 선택 → 입력 → FATCA·CRS → 확인 → 인증 → 완료', () => {
  expect(stepsOf(STEP_FLOWS['LN-02'])).toEqual(['선택', '입력', 'FATCA·CRS', '확인', '인증', '완료']);
  expect(stepsOf(STEP_FLOWS['LN-04'])).not.toContain('FATCA·CRS');
});

test('처음(모두 아니오)에는 두 질문만 보이고 그대로 다음 가능', () => {
  expect(visibleIds({})).toEqual(['fcUs', 'fcRes']);
  expect(validateValues(FATCA_FIELDS.filter(field => isFieldVisible(field, FATCA_FIELDS, {})), {})).toEqual({});
});

test('미국인 예: 해당 사항·영문성명·납세자 정보·증빙서류', () => {
  expect(visibleIds({ fcUs: '예', fcTinHave: '있음' })).toEqual(['fcUs', 'fcUsType', 'fcRes', 'fcLast', 'fcFirst', 'fcCountry', 'fcAddr', 'fcTinHave', 'fcTin', 'fcDoc1', 'fcDoc2']);
});

test('해외 거주자 예(미국인 아님): 해당 사항 없음, 납세자번호 없으면 사유 선택·납세자번호 증명서 없음', () => {
  const ids = visibleIds({ fcRes: '예', fcTinHave: '없음' });
  expect(ids).toEqual(['fcUs', 'fcRes', 'fcLast', 'fcFirst', 'fcCountry', 'fcAddr', 'fcTinHave', 'fcNoTin', 'fcDoc1']);
});

test('조건부 항목의 조건 항목이 숨겨지면 함께 숨김 (모두 아니오면 납세자번호 칸 없음)', () => {
  expect(visibleIds({ fcTinHave: '있음' })).not.toContain('fcTin');
});

test('예를 고르면 필수 입력 검증', () => {
  const values = { fcUs: '예' };
  const errors = validateValues(FATCA_FIELDS.filter(field => isFieldVisible(field, FATCA_FIELDS, values)), values);
  expect(Object.keys(errors)).toEqual(['fcUsType', 'fcLast', 'fcFirst', 'fcCountry', 'fcAddr', 'fcTin', 'fcDoc1', 'fcDoc2']);
  expect(errors.fcCountry).toBe('거주지국을 선택해 주세요.');
});

test('확인 단계에 FATCA·CRS 답변 표시', () => {
  const rows = confirmRows(STEP_FLOWS['LN-02'], { pick: null, values: { acct: '하나 123-456789-01', fcUs: '아니오', fcRes: '아니오' } });
  expect(rows.map(row => row[0])).toEqual(['입금 계좌', '미국 세법상 미국인에 해당하나요?', '대한민국 외 국가의 조세목적상 거주자인가요?']);
});

test('거주지국은 국가 선택 레이어팝업으로 고름', () => {
  expect(FATCA_FIELDS.find(field => field.id === 'fcCountry')?.type).toBe('country');
});
