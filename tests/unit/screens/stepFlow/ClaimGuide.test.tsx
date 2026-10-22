/* 보험금 청구 안내 단계: 청구사항 안내 · 청구·지급 절차 · 청구 종류 선택 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { ClaimGuide } from '../../../../src/screens/stepFlow/ClaimGuide';

const setup = (claimType = 'self') => {
  const onChange = vi.fn();
  const onNext = vi.fn();
  render(<ClaimGuide claimType={claimType} onChange={onChange} onNext={onNext} />);
  return { onChange, onNext };
};

test('청구사항 안내 표: 청구 대상 · 이용 가능 시간 · 확인할 사항 · 기타 사항', () => {
  setup();
  const table = screen.getByRole('table', { name: '보험금 청구사항 안내' });
  expect(within(table).getAllByRole('rowheader').map(cell => cell.textContent)).toEqual(['보험금 청구 대상', '이용 가능 시간', '확인할 사항', '기타 사항']);
  expect(within(table).getByText(/1,000만원 이하/)).toBeTruthy();
  expect(within(table).getByText(/08:00 ~ 23:00/)).toBeTruthy();
  expect(screen.getByRole('button', { name: /사고보험금 청구서류/ }).dataset).toMatchObject({ action: 'open', id: 'CS-01' });
});

test('청구·지급 절차 6단계 (순서 목록)', () => {
  setup();
  const list = screen.getByRole('list', { name: '보험금 청구 및 지급 절차' });
  expect(within(list).getAllByRole('listitem').map(item => item.textContent)).toEqual([
    'STEP 01계약사항 조회', 'STEP 02청구사항 입력', 'STEP 03구비서류 제출', 'STEP 04보험금 접수(SMS)', 'STEP 05서류심사 및 현장심사', 'STEP 06보험금 지급']);
});

test('청구 종류 탭: 고른 종류 표시·바꾸기·다음', () => {
  const { onChange, onNext } = setup('child');
  const tabs = within(screen.getByRole('group', { name: '청구 종류 선택' })).getAllByRole('button');
  expect(tabs.map(tab => tab.textContent)).toEqual(['본인보험금 접수', '자녀보험금 접수', '수익자 청구']);
  expect(tabs.map(tab => tab.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false']);
  expect(screen.getByRole('heading', { name: '자녀보험금 접수' })).toBeTruthy();
  fireEvent.click(tabs[2]);
  expect(onChange).toHaveBeenCalledWith('beneficiary');
  fireEvent.click(screen.getByRole('button', { name: '다음' }));
  expect(onNext).toHaveBeenCalled();
  expect(screen.getByText(/재직증명서/)).toBeTruthy();
});
