/* 새 계좌 등록 창: 계좌 확인(은행 조회) 후에만 등록 */
import { fireEvent, render, screen } from '@testing-library/react';
import { AccountRegisterDialog } from '../../../src/components/modal/AccountRegisterDialog';

const BANKS = ['농협은행', '국민은행'];
const setup = (verify = vi.fn().mockResolvedValue({ ok: true, holder: '홍길동' })) => {
  const onRegister = vi.fn();
  render(<AccountRegisterDialog banks={BANKS} holderName="홍길동" registered={['국민은행 123-****-901 (본인)']} verify={verify} onRegister={onRegister} />);
  const bank = screen.getByLabelText(/은행/) as HTMLSelectElement;
  const number = screen.getByLabelText(/계좌번호/) as HTMLInputElement;
  const fill = (bankName: string, value: string) => {
    fireEvent.change(bank, { target: { value: bankName } });
    fireEvent.input(number, { target: { value } });
  };
  return { verify, onRegister, bank, number, fill };
};
const checkButton = () => screen.getByRole('button', { name: '계좌 확인' });
const registerButton = () => screen.getByRole('button', { name: '등록' });

test('제목·예금주(본인 이름 고정)·은행 선택·계좌번호', () => {
  setup();
  expect(screen.getByRole('heading').textContent).toBe('다른 본인 계좌 등록');
  expect((screen.getByLabelText('예금주') as HTMLInputElement).value).toBe('홍길동');
  expect((screen.getByLabelText('예금주') as HTMLInputElement).readOnly).toBe(true);
  expect(screen.getByRole('option', { name: '은행을 선택하세요' })).toBeTruthy();
});

test('계좌 확인 전에는 등록되지 않고 계좌 확인을 먼저 안내', () => {
  const { onRegister } = setup();
  fireEvent.click(registerButton());
  expect(screen.getByRole('alert').textContent).toBe('계좌 확인을 먼저 해 주세요.');
  expect(onRegister).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(checkButton());
});

test('입력이 틀리면 은행에 확인하지 않고 칸마다 오류', () => {
  const { verify, number } = setup();
  fireEvent.click(checkButton());
  expect(screen.getByText('은행을 선택해 주세요.')).toBeTruthy();
  expect(screen.getByText('계좌번호를 입력해 주세요.')).toBeTruthy();
  expect(verify).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(screen.getByLabelText(/은행/));
  expect(number.getAttribute('aria-invalid')).toBe('true');
});

test('이미 등록된 계좌는 확인하지 않음', () => {
  const { verify, fill } = setup();
  fill('국민은행', '1234567890901');
  fireEvent.click(checkButton());
  expect(screen.getByText('이미 등록된 계좌입니다.')).toBeTruthy();
  expect(verify).not.toHaveBeenCalled();
});

test('계좌 확인 성공 → 등록하면 표시 이름으로 넘김, 계좌번호를 바꾸면 다시 확인해야 함', async () => {
  const { verify, onRegister, fill, number } = setup();
  fill('농협은행', '352-0123-4567-89');
  fireEvent.click(checkButton());
  expect(verify).toHaveBeenCalledWith('농협은행', '3520123456789', '홍길동');
  expect(await screen.findByText('예금주 홍길동 · 본인 계좌 확인 완료')).toBeTruthy();

  fireEvent.input(number, { target: { value: '3520123456780' } });
  expect(screen.queryByText('예금주 홍길동 · 본인 계좌 확인 완료')).toBeNull();
  fireEvent.click(registerButton());
  expect(onRegister).not.toHaveBeenCalled();

  fireEvent.input(number, { target: { value: '352-0123-4567-89' } });
  fireEvent.click(checkButton());
  await screen.findByText('예금주 홍길동 · 본인 계좌 확인 완료');
  fireEvent.click(registerButton());
  expect(onRegister).toHaveBeenCalledWith('농협은행 352-****-789 (본인)');
});

test('확인하는 동안 버튼은 「확인 중」, 실패하면 은행 응답을 오류로', async () => {
  let resolve: (value: unknown) => void = () => {};
  const verify = vi.fn(() => new Promise(done => { resolve = done; }));
  const { fill, onRegister } = setup(verify as never);
  fill('농협은행', '3520123456000');
  fireEvent.click(checkButton());
  expect(screen.getByRole('button', { name: '확인 중…' }).getAttribute('aria-disabled')).toBe('true');
  resolve({ ok: false, reason: '은행에서 계좌를 찾을 수 없습니다.' });
  expect((await screen.findByRole('alert')).textContent).toBe('은행에서 계좌를 찾을 수 없습니다.');
  fireEvent.click(registerButton());
  expect(onRegister).not.toHaveBeenCalled();
});
