import { render, screen, within } from '@testing-library/react';
import { Header } from '../../../src/components/shell/Header';

const base = { currentGroup: '', isAllMenuOpen: false, largeText: false, isLoggedIn: false, userName: '홍길동', mega: null };

describe('Header', () => {
  test('주메뉴 5개, 현재 1Depth 표시', () => {
    render(<Header {...base} currentGroup="보험" />);
    const gnb = screen.getByRole('navigation', { name: '주메뉴' });
    const buttons = within(gnb).getAllByRole('button');
    expect(buttons.map(button => button.textContent)).toEqual(['MyPage', '보험', '대출', '증명서발급', '서류·안내']);
    const current = buttons[1];
    expect(current.classList.contains('on')).toBe(true);
    expect(current.getAttribute('aria-current')).toBe('true');
    expect(buttons[0].getAttribute('aria-current')).toBeNull();
    expect(buttons.every(button => button.dataset.action === 'open-group')).toBe(true);
  });

  test('로그인 전/후 버튼과 사용자 이름', () => {
    const { rerender } = render(<Header {...base} />);
    expect(screen.getByRole('button', { name: '로그인' })).toBeTruthy();
    expect(screen.queryByText('홍길동')).toBeNull();
    rerender(<Header {...base} isLoggedIn />);
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeTruthy();
    expect(screen.getByText('홍길동')).toBeTruthy();
  });

  test('전체메뉴 버튼: 열림 상태와 이름', () => {
    const { rerender } = render(<Header {...base} />);
    expect(screen.getByRole('button', { name: '전체메뉴' }).getAttribute('aria-expanded')).toBe('false');
    rerender(<Header {...base} isAllMenuOpen />);
    expect(screen.getByRole('button', { name: '전체메뉴 닫기' }).getAttribute('aria-expanded')).toBe('true');
  });

  test('메가메뉴: 닫힘이면 hidden, 열리면 2Depth·3Depth와 추가인증 표시', () => {
    const { container, rerender } = render(<Header {...base} />);
    const mega = () => container.querySelector<HTMLElement>('#mega');
    expect(mega()?.hidden).toBe(true);

    rerender(<Header {...base} mega={{ group: '보험', index: 2 }} />);
    expect(mega()?.hidden).toBe(false);
    expect(mega()?.dataset.group).toBe('보험');
    expect(screen.getByRole('button', { name: 'MyPage' }).getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByRole('button', { name: '보험' }).getAttribute('aria-expanded')).toBe('true');

    const depth2 = screen.getByRole('group', { name: '보험 2Depth 메뉴' });
    const active = within(depth2).getAllByRole('button')[2];
    expect(active.classList.contains('on')).toBe(true);
    expect(active.getAttribute('aria-expanded')).toBe('true');
    expect(active.dataset).toMatchObject({ action: 'mega-section', group: '보험', index: '2' });

    const panel = screen.getByRole('group', { name: '보험금청구/신청' });
    const pension = within(panel).getByRole('button', { name: /연금 지급 신청/ });
    expect(pension.dataset).toMatchObject({ action: 'open', id: 'PY-09' });
    expect(pension.textContent).toContain('(추가인증 필요)');
  });
});
