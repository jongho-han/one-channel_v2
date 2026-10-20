/* T2 목록 규칙 */
import { claimScreenFor, followUpFor, isNumericColumn, isStatusColumn, visibleRows } from '../../../../src/screens/list/listRules';

test('열 구분: 금액(오른쪽 정렬)·상태', () => {
  expect(['금액', '대출 잔액', '원천징수 세액', '수익률(1년)', '편입비율', '지방소득세'].every(isNumericColumn)).toBe(true);
  expect(isNumericColumn('계약')).toBe(false);
  expect(isStatusColumn('처리상태')).toBe(true);
  expect(isStatusColumn('진행단계')).toBe(true);
  expect(isStatusColumn('구분')).toBe(false);
});

test('보험금 찾기 신청 화면', () => {
  expect(claimScreenFor('미수령보험금 신청')).toBe('PY-07');
  expect(claimScreenFor('분할/만기보험금 신청')).toBe('PY-04');
});

test('필터에 맞는 행만 (원래 순번 유지, 전체·미선택은 통과)', () => {
  const rows = [['a', '납입'], ['b', '지급'], ['c', '납입']];
  expect(visibleRows(rows, { 거래구분: 1 }, { 거래구분: '납입' }).map(row => row.index)).toEqual([0, 2]);
  expect(visibleRows(rows, { 거래구분: 1 }, { 거래구분: '전체' })).toHaveLength(3);
  expect(visibleRows(rows, undefined, {})).toHaveLength(3);
});

test('행 상태별 이어서 할 일', () => {
  expect(followUpFor('PY-02', '보완서류 요청')).toBe('upload');
  expect(followUpFor('PY-02', '지급완료')).toBe('review');
  expect(followUpFor('PY-06', '접수')).toBe('cancel');
  expect(followUpFor('LN-03', '심사중')).toBe('cancel');
  expect(followUpFor('LN-03', '실행완료')).toBeNull();
  expect(followUpFor('PY-03', '')).toBe('claim');
  expect(followUpFor('CT-08', '')).toBeNull();
});
