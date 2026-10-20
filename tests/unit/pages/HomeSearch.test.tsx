import { fireEvent, render, screen } from '@testing-library/react';
import { HomeSearch } from '../../../src/pages/HomeSearch';

const RESULTS = [
  { id: 'PY-01', depth1: '보험', depth2: '보험금청구/신청', depth3: '보험금 청구', screenType: 'T3', authLevel: 'A1' as const },
  { id: 'PY-02', depth1: '보험', depth2: '보험금청구/신청', depth3: '보험금 청구 조회/서류추가', screenType: 'T2', authLevel: 'A1' as const },
];
const setup = () => {
  const onOpen = vi.fn();
  const announce = vi.fn();
  const search = vi.fn((query: string) => (query.includes('청구') ? RESULTS : []));
  render(<HomeSearch search={search} onOpen={onOpen} announce={announce} />);
  return { onOpen, announce, input: screen.getByRole('combobox') as HTMLInputElement };
};

describe('HomeSearch', () => {
  test('입력하면 추천 목록·안내, 화살표로 고르고 Enter로 이동', () => {
    const { onOpen, announce, input } = setup();
    fireEvent.input(input, { target: { value: '청구' } });
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(announce).toHaveBeenLastCalledWith('추천 업무 2건');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.getAttribute('aria-activedescendant')).toBe('sug-1');
    expect(screen.getAllByRole('option')[1].getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onOpen).toHaveBeenCalledWith('PY-02');
  });

  test('결과 없음 안내, Esc·바깥 누르면 닫힘', () => {
    const { input } = setup();
    fireEvent.input(input, { target: { value: 'zzz' } });
    expect(screen.getByText('“zzz”와 맞는 업무가 없습니다. 전체메뉴에서 찾아보세요.')).toBeTruthy();
    expect(input.getAttribute('aria-expanded')).toBe('false');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(document.getElementById('sug')?.hidden).toBe(true);
    fireEvent.input(input, { target: { value: '청구' } });
    fireEvent.click(document.body);
    expect(document.getElementById('sug')?.hidden).toBe(true);
  });

  test('찾기 버튼: 첫 추천으로 이동', () => {
    const { onOpen, input } = setup();
    fireEvent.input(input, { target: { value: '청구' } });
    fireEvent.click(screen.getByRole('button', { name: '찾기' }));
    expect(onOpen).toHaveBeenCalledWith('PY-01');
  });
});
