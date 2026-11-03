/* 국가 선택 레이어팝업: 자주 선택하는 국가(대한민국·미국·중국·일본) 우선, 그 외 검색 → 선택 완료 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { CountryDialog } from '../../../src/components/modal/CountryDialog';
import { COUNTRIES, FREQUENT_COUNTRIES } from '../../../src/data/countryRepository';

test('자주 선택하는 국가: 대한민국 · 미국 · 중국 · 일본, 전체 국가는 가나다순', () => {
  expect(FREQUENT_COUNTRIES.map(country => country.name)).toEqual(['대한민국', '미국', '중국', '일본']);
  const names = COUNTRIES.map(country => country.name);
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'ko')));
  expect(names).toContain('베트남');
});

test('자주 선택하는 국가를 먼저 보여주고, 고른 뒤 선택 완료', () => {
  const onPick = vi.fn();
  render(<CountryDialog title="거주지국 선택" value="" onPick={onPick} />);
  const frequent = within(screen.getByRole('group', { name: '자주 선택하는 국가' })).getAllByRole('button');
  expect(frequent.map(button => button.textContent)).toEqual(['KR대한민국', 'US미국', 'CN중국', 'JP일본']);
  const done = screen.getByRole('button', { name: '선택 완료' }) as HTMLButtonElement;
  expect(done.disabled).toBe(true);
  fireEvent.click(frequent[1]);
  expect(frequent[1].getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(done);
  expect(onPick).toHaveBeenCalledWith('미국');
});

test('그 외 국가 검색: 입력한 글자가 들어간 국가만, 없으면 안내', () => {
  const onPick = vi.fn();
  render(<CountryDialog title="거주지국 선택" value="" onPick={onPick} />);
  const search = screen.getByLabelText('그 외 국가 검색');
  fireEvent.change(search, { target: { value: '베트' } });
  const results = within(screen.getByRole('group', { name: '검색 결과' })).getAllByRole('button');
  expect(results.map(button => button.textContent)).toEqual(['베트남']);
  fireEvent.click(results[0]);
  fireEvent.click(screen.getByRole('button', { name: '선택 완료' }));
  expect(onPick).toHaveBeenCalledWith('베트남');
  fireEvent.change(search, { target: { value: 'zz' } });
  expect(screen.getByText('검색 결과가 없습니다.')).toBeTruthy();
});

test('이미 고른 국가는 선택된 상태로 열림', () => {
  render(<CountryDialog title="거주지국 선택" value="일본" onPick={vi.fn()} />);
  const frequent = within(screen.getByRole('group', { name: '자주 선택하는 국가' }));
  expect(frequent.getByRole('button', { name: '일본' }).getAttribute('aria-pressed')).toBe('true');
  expect((screen.getByRole('button', { name: '선택 완료' }) as HTMLButtonElement).disabled).toBe(false);
});
