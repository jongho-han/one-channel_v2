/* 메뉴 트리: 메뉴정의서 순서대로 1Depth → 2Depth → 화면 */
import { expect, test } from 'vitest';
import { MENU_TREE } from '../../src/data/menu';

test('보험계약대출 관리 순서: 상환/이자납입(LN-04) → 정액분할상환(LN-05) → 원리금 자동이체(LN-06)', () => {
  expect(MENU_TREE['대출']['보험계약대출 관리'].map(screen => screen.id)).toEqual(['LN-04', 'LN-05', 'LN-06']);
  expect(MENU_TREE['대출']['보험계약대출'].map(screen => screen.id)).toEqual(['LN-02', 'LN-03']);
});
