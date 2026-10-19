/* 하단 이용 안내 React 컴포넌트 */
import { render, screen, within } from '@testing-library/react';
import { Footer } from '../../src/components/Footer';

const LINKS = [
  { label: '개인정보처리방침', url: 'https://example.test/privacy', strong: true },
  { label: '금융소비자보호' },
] as const;

describe('Footer', () => {
  test('URL이 있으면 새 창 링크(화면낭독기 「새 창」 안내), 없으면 글자만', () => {
    render(<Footer links={LINKS} specVersion="v3.7" />);
    const nav = screen.getByRole('navigation', { name: '이용 안내' });

    const link = within(nav).getByRole('link', { name: /^개인정보처리방침\s*\(새 창\)$/ });
    expect(link).toHaveProperty('href', 'https://example.test/privacy');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toMatch(/noopener/);
    expect(link.classList.contains('strong')).toBe(true);

    expect(within(nav).queryByRole('link', { name: /금융소비자보호/ })).toBeNull();
    expect(within(nav).getByText('금융소비자보호')).toBeTruthy();
  });

  test('회사 정보와 기준 메뉴정의서 버전 표시', () => {
    render(<Footer links={[]} specVersion="v9.9" />);
    expect(screen.getByText(/고객센터 1588-4770/)).toBeTruthy();
    expect(screen.getByText(/사이버창구 Web 메뉴정의서 v9\.9/)).toBeTruthy();
  });
});
