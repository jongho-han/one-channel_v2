/* 모달 내용 컴포넌트 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ConfirmDialog } from '../../../src/components/modal/ConfirmDialog';
import { NoticeBoard } from '../../../src/components/modal/NoticeBoard';
import { OtpDialog } from '../../../src/components/modal/OtpDialog';
import { ShortcutGuide } from '../../../src/components/modal/ShortcutGuide';
import { SignMethodDialog } from '../../../src/components/modal/SignMethodDialog';

test('ConfirmDialog: 예·아니오·닫기', () => {
  const onYes = vi.fn();
  const onNo = vi.fn();
  render(<ConfirmDialog title="해제" message="해제할까요?" onYes={onYes} onNo={onNo} />);
  fireEvent.click(screen.getByRole('button', { name: '아니오' }));
  fireEvent.click(screen.getByRole('button', { name: '닫기' }));
  fireEvent.click(screen.getByRole('button', { name: '예' }));
  expect(onNo).toHaveBeenCalledTimes(2);
  expect(onYes).toHaveBeenCalledTimes(1);
});

test('SignMethodDialog: 금전 거래 안내·수단 선택', () => {
  const onChoose = vi.fn();
  render(<SignMethodDialog needsExtraAuth methods={[{ name: '간편인증', desc: '카카오' }]} onChoose={onChoose} />);
  expect(screen.getByRole('heading').textContent).toBe('전자서명 + 휴대폰 추가인증');
  fireEvent.click(screen.getByRole('button', { name: /간편인증/ }));
  expect(onChoose).toHaveBeenCalledWith('간편인증');
});

describe('OtpDialog', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  const setup = () => {
    const props = { phone: '010-****-5678', onConfirm: vi.fn(), announce: vi.fn(), toast: vi.fn() };
    render(<OtpDialog {...props} />);
    return props;
  };

  test('남은 시간·잘못된 번호·확인', () => {
    const props = setup();
    expect(document.getElementById('otpTime')?.textContent).toBe('03:00');
    act(() => { vi.advanceTimersByTime(2000); });
    expect(document.getElementById('otpTime')?.textContent).toBe('02:58');
    fireEvent.change(screen.getByLabelText('인증번호 6자리'), { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    expect(screen.getByRole('alert').textContent).toBe('인증번호 6자리를 정확히 입력해 주세요.');
    expect(screen.getByLabelText('인증번호 6자리').getAttribute('aria-invalid')).toBe('true');
    fireEvent.change(screen.getByLabelText('인증번호 6자리'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    expect(props.onConfirm).toHaveBeenCalled();
  });

  test('1분 남으면 안내, 시간이 지나면 오류, 연장·재전송', () => {
    const props = setup();
    act(() => { vi.advanceTimersByTime(120000); });
    expect(props.announce).toHaveBeenCalledWith('추가인증 남은 시간이 1분입니다. 시간 연장 버튼으로 늘릴 수 있습니다.');
    act(() => { vi.advanceTimersByTime(60000); });
    expect(screen.getByRole('alert').textContent).toBe('입력 시간이 지났습니다. 재전송 후 다시 입력해 주세요.');
    fireEvent.click(screen.getByRole('button', { name: '재전송' }));
    expect(screen.getByRole('alert').textContent).toBe('');
    expect(document.getElementById('otpTime')?.textContent).toBe('03:00');
    expect(props.toast).toHaveBeenCalledWith('인증번호를 다시 보냈습니다.');
    fireEvent.click(screen.getByRole('button', { name: '시간 연장' }));
    expect(props.announce).toHaveBeenLastCalledWith('남은 시간을 3분으로 연장했습니다.');
  });
});

test('NoticeBoard: 고른 글 펼침, 다른 글을 누르면 하나만', () => {
  const notices = [
    { id: 'a', type: '공지' as const, title: '점검', date: '2026.09.28', body: ['첫 줄\n둘째 줄'] },
    { id: 'b', type: '안내' as const, title: '이율', date: '2026.09.25', body: ['내용'] },
  ];
  render(<NoticeBoard notices={notices} openId="a" />);
  expect(screen.getByRole('button', { name: /점검/ }).getAttribute('aria-expanded')).toBe('true');
  expect(document.querySelector('#na-a p')?.innerHTML).toBe('첫 줄<br>둘째 줄');
  fireEvent.click(screen.getByRole('button', { name: /이율/ }));
  expect(screen.getByRole('button', { name: /점검/ }).getAttribute('aria-expanded')).toBe('false');
  expect((document.getElementById('na-b') as HTMLElement).hidden).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: /이율/ }));
  expect((document.getElementById('na-b') as HTMLElement).hidden).toBe(true);
});

test('ShortcutGuide: 기기별 안내·탭 선택 상태', () => {
  render(<ShortcutGuide tab="ios" name="사이버창구" url="https://example.test" iconPng="" canInstall={false} />);
  expect(screen.getByRole('heading').textContent).toBe('홈 화면에 바로가기 추가');
  expect(screen.getByRole('button', { name: '아이폰' }).getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByText(/공유 버튼/)).toBeTruthy();
});

test('ZipSearchDialog: 결과 바로 표시·선택', async () => {
  const { ZipSearchDialog } = await import('../../../src/components/modal/ZipSearchDialog');
  const onPick = vi.fn();
  render(<ZipSearchDialog samples={[['04524', '서울 중구 세종대로 110']]} onPick={onPick} />);
  expect((screen.getByLabelText('도로명, 건물명 또는 지번') as HTMLInputElement).value).toBe('세종대로 110');
  fireEvent.click(screen.getByRole('button', { name: /04524/ }));
  expect(onPick).toHaveBeenCalledWith('04524', '서울 중구 세종대로 110');
});

test('CancelRequestDialog: 취소하기', async () => {
  const { CancelRequestDialog } = await import('../../../src/components/modal/CancelRequestDialog');
  const onConfirm = vi.fn();
  render(<CancelRequestDialog item="보험금 청구" onConfirm={onConfirm} />);
  expect(screen.getByText('보험금 청구 신청이 취소됩니다. 취소 후에는 다시 신청해야 합니다.')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '취소하기' }));
  expect(onConfirm).toHaveBeenCalled();
});

test('SuitabilityRequiredDialog·FundBlockedDialog: 사유 목록·익일 안내', async () => {
  const { FundBlockedDialog, SuitabilityRequiredDialog } = await import('../../../src/components/modal/FundDialogs');
  render(<SuitabilityRequiredDialog reasons={['진단 이력 없음', '위험등급 초과']} />);
  expect(screen.getAllByRole('listitem').map(item => item.textContent)).toEqual(['진단 이력 없음', '위험등급 초과']);
  expect(screen.getByRole('button', { name: '적합성진단 시작' }).dataset.action).toBe('suit-start');
  render(<FundBlockedDialog profile="안정형" grade="고위험" nextDay="2026-10-21" />);
  expect(screen.getByText(/2026-10-21\(익일\) 이후/)).toBeTruthy();
});
