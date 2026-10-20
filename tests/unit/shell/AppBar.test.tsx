import { render, screen } from '@testing-library/react';
import { AppBar } from '../../../src/components/shell/AppBar';

describe('AppBar', () => {
  test('홈: 로고·큰글씨·로그인 버튼', () => {
    const { container } = render(<AppBar page="home" title="" largeText={false} isLoggedIn={false} />);
    expect(container.querySelector('.logo[data-action="nav"][data-page="home"]')).toBeTruthy();
    expect(screen.getByRole('button', { name: /큰글씨/ }).getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('button', { name: '로그인' }).className).toContain('pri');
  });

  test('홈 + 로그인 상태: 로그아웃 버튼은 ghost 스타일', () => {
    render(<AppBar page="home" title="" largeText isLoggedIn />);
    expect(screen.getByRole('button', { name: '로그아웃' }).className).toContain('ghost');
    expect(screen.getByRole('button', { name: /큰글씨 켜짐/ }).getAttribute('aria-pressed')).toBe('true');
  });

  test('하위 화면: 뒤로·제목(낭독 제외)·홈 버튼', () => {
    const { container } = render(<AppBar page="screen" title="계약종합현황" largeText={false} isLoggedIn />);
    expect(screen.getByRole('button', { name: '뒤로' }).dataset.action).toBe('back');
    expect(screen.getByRole('button', { name: '홈' }).dataset.page).toBe('home');
    const title = container.querySelector('.title');
    expect(title?.textContent).toBe('계약종합현황');
    expect(title?.getAttribute('aria-hidden')).toBe('true');
  });
});
