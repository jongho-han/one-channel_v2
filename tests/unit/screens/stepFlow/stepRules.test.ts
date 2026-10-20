/* T3 단계형 규칙 */
import { applyLocks, NOT_APPLICABLE, type LockRules, type Locks } from '../../../../src/form/locks';
import { displayValue, isFieldVisible } from '../../../../src/form/display';
import { confirmRows, doneTitle, stepsOf } from '../../../../src/screens/stepFlow/stepRules';

test('단계: 선택(있으면) · 입력 · 확인(생략 가능) · 인증 · 완료', () => {
  expect(stepsOf({ pick: {} })).toEqual(['선택', '입력', '확인', '인증', '완료']);
  expect(stepsOf({})).toEqual(['입력', '확인', '인증', '완료']);
  expect(stepsOf({ pick: {}, skipConfirm: true })).toEqual(['선택', '입력', '인증', '완료']);
});

test('확인 단계 표시값: 금액·주소·여러 선택·빈 값', () => {
  expect(displayValue({ id: 'a', label: '금액', type: 'money' }, { a: 1000000 })).toBe('1,000,000원');
  expect(displayValue({ id: 'a', label: '금액', type: 'money' }, {})).toBe('-');
  expect(displayValue({ id: 'h', label: '주소', type: 'addr' }, { h: '세종대로', h_zip: '04524', h_d: '101호' })).toBe('(04524) 세종대로 101호');
  expect(displayValue({ id: 'k', label: '내용', type: 'checks' }, { k: ['입원', '수술'] })).toBe('입원, 수술');
  expect(displayValue({ id: 'k', label: '내용', type: 'checks' }, { k: [] })).toBe('-');
  expect(displayValue({ id: 't', label: '이름' }, { t: '홍길동' })).toBe('홍길동');
});

test('조건부 항목: 기준 항목 값이 맞을 때만 (라디오는 첫 선택지가 기본)', () => {
  const fields = [{ id: 'how', label: '방법', type: 'radio' as const, options: ['출금', '가상계좌'] }, { id: 'vbank', label: '은행', showWhen: { field: 'how', value: '가상계좌' } }];
  expect(isFieldVisible(fields[1], fields, {})).toBe(false);
  expect(isFieldVisible(fields[1], fields, { how: '가상계좌' })).toBe(true);
  expect(isFieldVisible(fields[0], fields, {})).toBe(true);
});

test('확인 행: 고른 항목(선택 문구 제외) + 보이는 항목', () => {
  const config = {
    pick: { label: '청구할 계약을 선택하세요', items: () => [{ key: 'k', title: '종신보험', sub: '', value: '' }] },
    fields: [{ id: 'nm', label: '이름' }, { id: 'memo', label: '메모', showWhen: { field: 'nm', value: 'x' } }],
  };
  expect(confirmRows(config, { pick: 'k', values: { nm: '홍길동' } })).toEqual([['청구할 계약', '종신보험'], ['이름', '홍길동']]);
  expect(confirmRows({ fields: [{ id: 'nm', label: '이름' }] }, { pick: null, values: { nm: '' } })).toEqual([['이름', '-']]);
});

test('완료 제목: 화면 지정 > 지급 업무 > 기본', () => {
  expect(doneTitle({ doneTitle: () => '발급되었습니다' }, '변경', {})).toBe('발급되었습니다');
  expect(doneTitle({ doneTitle: () => '' }, '지급', {})).toBe('신청이 완료되었습니다');
  expect(doneTitle({}, '변경', {})).toBe('처리가 완료되었습니다');
});

test('고정 규칙: 고정 항목은 고정값, 풀린 항목이 해당없음이면 첫 선택지', () => {
  const fields = [
    { id: 'type', label: '유형', type: 'radio' as const, options: ['종신', '확정'] },
    { id: 'fixed', label: '확정기간', type: 'radio' as const, options: ['10년', NOT_APPLICABLE] },
  ];
  const rules: LockRules = (values): Locks => (values.type === '종신' ? { fixed: [NOT_APPLICABLE, '종신 선택 시'] } : {});
  expect(applyLocks(fields, { type: '종신', fixed: '10년' }, rules)).toEqual({ values: { type: '종신', fixed: NOT_APPLICABLE }, locks: { fixed: [NOT_APPLICABLE, '종신 선택 시'] } });
  expect(applyLocks(fields, { type: '확정', fixed: NOT_APPLICABLE }, rules)).toEqual({ values: { type: '확정', fixed: '10년' }, locks: {} });
});
