import { fireEvent, render, screen, within } from '@testing-library/react';
import { AllMenuPage } from '../../../src/pages/AllMenuPage';
import { HomePage } from '../../../src/pages/HomePage';
import { LoginPage } from '../../../src/pages/LoginPage';
import { ScreenFrame } from '../../../src/pages/ScreenPage';

const noop = () => {};

describe('HomePage', () => {
  test('비로그인: 로그인 카드, 할 일 없음', () => {
    render(<HomePage isLoggedIn={false} search={() => []} onOpen={noop} announce={noop} />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('보험 업무, 찾지 말고 물어보세요');
    expect(screen.getByRole('heading', { name: '로그인하고 바로 처리하세요' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: '지금 확인이 필요해요' })).toBeNull();
  });

  test('로그인: 인사·내 보험 요약·할 일·공지', () => {
    render(<HomePage isLoggedIn search={() => []} onOpen={noop} announce={noop} />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('홍길동님, 무엇을 도와드릴까요?');
    expect(screen.getByText('보유계약').nextElementSibling?.textContent).toBe('8건');
    expect(screen.getByRole('heading', { name: '지금 확인이 필요해요' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /공지|안내/ }).some(button => button.dataset.notice === 'n10')).toBe(true);
  });
});

describe('AllMenuPage', () => {
  test('2Depth 펼침 상태·누르면 알림·검색 필터', () => {
    const { container } = render(<AllMenuPage openSections={new Set(['대출|보험계약대출'])} announce={noop} />);
    const open = container.querySelector('.acc.open');
    expect(open?.getAttribute('data-key')).toBe('대출|보험계약대출');
    const header = open?.querySelector('.acc-h') as HTMLButtonElement;
    expect(header.getAttribute('aria-expanded')).toBe('true');
    expect(header.dataset.action).toBe('toggle-menu-section');

    fireEvent.input(screen.getByLabelText('메뉴 이름으로 찾기'), { target: { value: 'zzzz' } });
    expect((document.getElementById('amNone') as HTMLElement).hidden).toBe(false);
    fireEvent.input(screen.getByLabelText('메뉴 이름으로 찾기'), { target: { value: '증명서' } });
    const visible = [...container.querySelectorAll<HTMLElement>('#amList li')].filter(item => !item.hidden);
    expect(visible.length).toBeGreaterThan(0);
    expect(visible.every(item => item.dataset.n?.includes('증명서'))).toBe(true);
  });
});

test('LoginPage: 이어서 열 화면 안내와 인증수단', () => {
  render(<LoginPage pendingTitle="계약종합현황" />);
  expect(screen.getByText('계약종합현황').closest('p')?.textContent).toBe('계약종합현황 화면은 본인 확인 후 이용할 수 있습니다.');
  expect(screen.getByRole('button', { name: /간편인증/ }).dataset).toMatchObject({ action: 'login', method: '간편인증' });
});

test('ScreenFrame: 좌측 메뉴 현재 화면·경로·인증 배지·본문', () => {
  render(<ScreenFrame screen={{ id: 'PY-05', depth1: '보험', depth2: '보험금청구/신청', depth3: '중도인출 신청', screenType: 'T3', authLevel: 'A2', bizType: '지급', target: '계약자' }}>
    <p>본문</p>
  </ScreenFrame>);
  const nav = screen.getByRole('navigation', { name: '보험' });
  expect(within(nav).getByRole('button', { current: 'page' }).textContent).toBe('중도인출 신청');
  expect(screen.getByRole('navigation', { name: '현재 위치' }).textContent).toContain('보험금청구/신청');
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('중도인출 신청');
  expect(screen.getByText('추가인증 필요')).toBeTruthy();
  expect(screen.getByText('신청하신 금액은 본인 명의 계좌로 입금됩니다.')).toBeTruthy();
  expect(document.getElementById('sbody')?.textContent).toBe('본문');
});
