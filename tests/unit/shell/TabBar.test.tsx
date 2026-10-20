import { render, screen } from '@testing-library/react';
import { TabBar } from '../../../src/components/shell/TabBar';

const labels = () => screen.getAllByRole('button').map(button => button.textContent);

describe('TabBar', () => {
  test('5개 탭과 각 탭의 동작(data-action)', () => {
    const { container } = render(<TabBar route={{ page: 'home', screenId: null }} />);
    expect(labels()).toEqual(['홈', '내 계약', '보험금청구', '증명서', '전체메뉴']);
    expect(container.querySelector('[data-action="open"][data-id="CT-01"]')).toBeTruthy();
    expect(container.querySelector('[data-action="toggle-all-menu"]')).toBeTruthy();
    expect(container.querySelectorAll('svg.i')).toHaveLength(5);
  });

  test.each([
    [{ page: 'home', screenId: null }, '홈'],
    [{ page: 'screen', screenId: 'CT-01' }, '내 계약'],
    [{ page: 'screen', screenId: 'CF-05' }, '증명서'],
    [{ page: 'all', screenId: null }, '전체메뉴'],
  ] as const)('현재 위치 %o → 「%s」 탭 선택', (route, active) => {
    render(<TabBar route={route} />);
    const current = screen.getByRole('button', { current: 'page' });
    expect(current.textContent).toBe(active);
    expect(current.classList.contains('on')).toBe(true);
  });

  test('업무 화면(MY-01)에서는 선택된 탭 없음', () => {
    render(<TabBar route={{ page: 'screen', screenId: 'MY-01' }} />);
    expect(screen.queryByRole('button', { current: 'page' })).toBeNull();
  });
});
