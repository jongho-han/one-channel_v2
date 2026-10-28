import { fireEvent, render, screen } from '@testing-library/react';
import { AnnuityPick } from '../../../../src/screens/stepFlow/AnnuityPick';
import { LoanPick, LoanResult } from '../../../../src/screens/stepFlow/LoanPick';
import { VirtualAccountInfo } from '../../../../src/screens/stepFlow/VirtualAccountInfo';
import type { LoanContract } from '../../../../src/features/loanRules';

const LOANS: LoanContract[] = [
  { no: 'A', name: '(무)iM 종신', loanLimit: 5000000, loan: 1000000, loanRate: 0.043 },
  { no: 'C', name: '(무)iM 유니버설', loanLimit: 3000000, loan: 0, loanRate: 0.0395 },
];

test('LoanPick: 금액을 넣으면 배정·합계·안내, 없으면 오류', () => {
  const onNext = vi.fn();
  const announce = vi.fn();
  render(<LoanPick contracts={LOANS} amount={0} announce={announce} onNext={onNext} />);
  fireEvent.click(screen.getByRole('button', { name: '다음' }));
  expect(document.getElementById('e-loanAmount')?.textContent).toBe('대출 신청금액을(를) 입력해 주세요.');
  expect(onNext).not.toHaveBeenCalled();
  fireEvent.input(screen.getByLabelText(/대출 신청금액/), { target: { value: '4000000' } });
  expect(document.getElementById('e-loanAmount')?.textContent).toBe('');
  expect(document.querySelectorAll('.loan-card.on')).toHaveLength(2);
  expect(document.querySelector('#loanPlan .sumline')?.textContent).toBe('대출금 합계 4,000,000원');
  expect(announce).toHaveBeenLastCalledWith('2개 계약에 배정, 대출금 합계 4,000,000원');
  fireEvent.click(screen.getByRole('button', { name: '다음' }));
  expect(onNext).toHaveBeenCalledWith(4000000);
});

test('LoanResult: 실행 계약 카드', () => {
  render(<LoanResult contracts={LOANS} amount={4000000} step="done" />);
  expect(screen.getByRole('heading', { name: /대출 실행 계약/ }).textContent).toContain('2건 · 합계 4,000,000원');
});

test('AnnuityPick: 고르기 전 다음 → 오류, 고르면 알림', () => {
  const contracts = [{ no: '1', name: '연금A', insured: '홍길동', annuityAge: 65, annuityDate: '2045.03.02', paidCount: 1, totalCount: 120, payEnd: '2030.02', surrender: 100 }];
  const onPick = vi.fn();
  const onNext = vi.fn();
  render(<AnnuityPick label="계약을 선택하세요" contracts={contracts} picked={null} onPick={onPick} onNext={onNext} />);
  fireEvent.click(screen.getByRole('button', { name: '다음' }));
  expect(screen.getByRole('alert').textContent).toBe('연금개시 나이를 바꿀 계약을 선택해 주세요.');
  expect(onNext).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('radio'));
  expect(onPick).toHaveBeenCalledWith('1');
  expect(screen.getByRole('alert').textContent).toBe('');
  expect(document.querySelector('.annuity-card')?.className).toBe('loan-card annuity-card on');
});

test('VirtualAccountInfo: 은행·번호 복사·이용안내', () => {
  render(<VirtualAccountInfo account={{ bank: '농협', number: '790-1234-5678-90', holder: 'iM라이프' }} today="2026.10.02" />);
  expect(screen.getByRole('button', { name: '가상계좌번호 790-1234-5678-90 복사' }).dataset).toMatchObject({ action: 'copy-text', text: '790-1234-5678-90' });
  expect(screen.getByText(/2026\.10\.02\) 오후 6시까지/)).toBeTruthy();
});
