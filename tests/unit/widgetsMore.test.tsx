import { fireEvent, render, screen } from '@testing-library/react';
import { Agreements, CalcBox, DoneCard } from '../../src/components/widgets';

test('DoneCard: 제목·안내·처리 내역(숫자 정렬 여부)', () => {
  const { container } = render(<DoneCard title="완료" message="처리되었습니다." rows={[['처리번호', 'M-1'], ['안내', '알림 발송', true]]} />);
  expect(screen.getByRole('heading', { name: '완료' })).toBeTruthy();
  const values = container.querySelectorAll('.receipt dd');
  expect(values[0].className).toBe('num');
  expect(values[1].className).toBe('');
});

test('CalcBox: 합계 줄 강조', () => {
  const { container } = render(<CalcBox rows={[['원금', '100원'], ['합계', '110원', true]]} />);
  const rows = container.querySelectorAll('.calc > div');
  expect(rows[0].className).toBe('');
  expect(rows[1].className).toBe('tot');
  expect(rows[1].textContent).toBe('합계110원');
});

test('Agreements: 체크 상태 전달·오류 문구', () => {
  const onChange = vi.fn();
  render(<Agreements items={['[필수] 동의 1', '[필수] 동의 2']} agreed={[1]} error="체크해 주세요." onChange={onChange} />);
  const [first, second] = screen.getAllByRole('checkbox') as HTMLInputElement[];
  expect([first.checked, second.checked]).toEqual([false, true]);
  fireEvent.click(first);
  expect(onChange).toHaveBeenCalledWith([0, 1]);
  expect(screen.getByRole('alert').textContent).toBe('체크해 주세요.');
});
