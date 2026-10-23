/* T2 목록 규칙 — 화면과 분리한 순수 로직 */

export const isNumericColumn = (column: string): boolean => /금액|잔액|액|이자|세$|수익률|비율/.test(column);
/** 금액 열: 그 열 값 중 하나라도 '…원' 금액이면 (표에서 오른쪽 정렬) */
export const isMoneyColumn = (rows: readonly (readonly string[])[], index: number): boolean => rows.some(row => /^[-+]?[\d,]+원$/.test(row[index] ?? ''));
export const isStatusColumn = (column: string): boolean => /상태|단계/.test(column);

/** 보험금 찾기(PY-03)의 '신청' 열 → 이어서 열 신청 화면 */
export const claimScreenFor = (label: string): string => (label.startsWith('미수령') ? 'PY-07' : 'PY-04');

export type Row = readonly string[];

/** 선택 필터(예: 거래구분)에 맞는 행만 — 원래 순번(index)을 유지 (선택·취소가 원본 행을 가리킴) */
export function visibleRows(rows: readonly Row[], filterColumns: Readonly<Record<string, number>> | undefined, filters: Readonly<Record<string, string>>) {
  return rows
    .map((cells, index) => ({ cells, index }))
    .filter(({ cells }) => Object.entries(filterColumns ?? {}).every(([label, column]) => {
      const value = filters[label];
      return !value || value === '전체' || cells[column] === value;
    }));
}

export type FollowUp = 'upload' | 'review' | 'cancel' | 'claim';

/** 선택한 행 상태에 따라 이어서 할 수 있는 일 (서류 보완 · 재심사 · 취소 · 신청) */
export function followUpFor(screenId: string, status: string): FollowUp | null {
  if (screenId === 'PY-02' && status === '보완서류 요청') return 'upload';
  if (screenId === 'PY-02' && status === '지급완료') return 'review';
  if ((screenId === 'PY-06' && status === '접수') || (screenId === 'LN-03' && status === '심사중')) return 'cancel';
  if (screenId === 'PY-03') return 'claim';
  return null;
}
