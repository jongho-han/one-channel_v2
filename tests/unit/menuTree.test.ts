/* 메뉴 트리: 메뉴정의서 순서대로 1Depth → 2Depth → 화면 */
import { expect, test } from 'vitest';
import { MENU_TREE } from '../../src/data/menu';

test('보험계약대출 관리 첫 메뉴는 보험계약대출 상환/이자납입(LN-04)', () => {
  expect(MENU_TREE['대출']['보험계약대출 관리'].map(screen => screen.id)).toEqual(['LN-04', 'LN-06']);
  expect(MENU_TREE['대출']['보험계약대출'].map(screen => screen.id)).not.toContain('LN-04');
});
