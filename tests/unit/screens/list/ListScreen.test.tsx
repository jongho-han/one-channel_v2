import { fireEvent, render, screen, within } from '@testing-library/react';
import { ListScreen, type ListConfig } from '../../../../src/screens/list/ListScreen';

const CONFIG: ListConfig = {
  filters: ['period', { label: '거래구분', options: ['전체', '납입', '지급'] }],
  filterColumns: { 거래구분: 1 },
  columns: ['거래일', '거래구분', '금액', '처리상태'],
  rows: [['2026.09.25', '납입', '128,400원', '접수'], ['2026.08.03', '지급', '1,284,000원', '지급완료']],
  info: '안내입니다.',
  links: [['펀드 변경하기', 'CH-01']],
};

const setup = (list = {}, screenId = 'PY-06', config = CONFIG) => {
  const onFilterChange = vi.fn();
  const utils = render(<ListScreen screenId={screenId} title="지급신청현황" config={config} list={{ period: '3개월', filters: {}, selectedRow: null, ...list }} onFilterChange={onFilterChange} />);
  return { ...utils, onFilterChange };
};

describe('ListScreen', () => {
  test('안내·조회기간·필터·표(오른쪽 정렬·상태칩)·모바일 목록·바로가기', () => {
    const { container } = setup();
    expect(screen.getByText('안내입니다.')).toBeTruthy();
    expect(screen.getByRole('button', { name: '3개월' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: '1년' }).dataset).toMatchObject({ action: 'set-period', period: '1년' });
    const table = screen.getByRole('table');
    expect(within(table).getByText('128,400원').closest('td')?.className).toBe('r num');
    expect(within(table).getByText('지급완료').className).toBe('st g');
    expect(within(table).getByRole('button', { name: /2026\.09\.25\s*상세 보기/ }).dataset).toMatchObject({ action: 'select-row', index: '0' });
    expect(container.querySelectorAll('.mlist .mrow')).toHaveLength(2);
    expect(screen.getByRole('button', { name: '펀드 변경하기' }).className).toBe('btn pri');
  });

  test('headAlign: center 면 표 머리글 가운데 정렬(c), 기본은 그대로', () => {
    setup({}, 'CT-07', { ...CONFIG, headAlign: 'center' });
    expect(screen.getAllByRole('columnheader').map(th => th.className)).toEqual(['c', 'c', 'c', 'c']);
  });

  test('headAlign 이 없으면 숫자 열만 오른쪽(r)', () => {
    setup();
    expect(screen.getAllByRole('columnheader').map(th => th.className)).toEqual(['', '', 'r', '']);
  });

  test('필터를 바꾸면 알림, 선택값에 맞는 행만', () => {
    const { onFilterChange } = setup({ filters: { 거래구분: '지급' } });
    expect(screen.getAllByRole('row')).toHaveLength(2);   // 머리글 + 1행
    fireEvent.change(screen.getByLabelText('거래구분'), { target: { value: '납입' } });
    expect(onFilterChange).toHaveBeenCalledWith('거래구분', '납입');
  });

  test('맞는 행이 없으면 안내', () => {
    setup({ filters: { 거래구분: '지급' } }, 'X', { ...CONFIG, rows: [['2026.09.25', '납입', '1원', '접수']] });
    expect(screen.getByText('조회 조건에 맞는 내역이 없습니다.')).toBeTruthy();
  });

  test('선택한 행: 강조·상세·취소 버튼', () => {
    const { container } = setup({ selectedRow: 0 });
    expect(container.querySelector('tr.sel')).toBeTruthy();
    const detail = screen.getByRole('region', { name: '상세 내용' });
    expect(within(detail).getByRole('button', { name: '상세 내용 닫기' }).dataset.action).toBe('close-row');
    expect(within(detail).getByRole('button', { name: '신청 취소' }).dataset).toMatchObject({ action: 'cancel-request', index: '0' });
  });

  test('보완서류: 고른 파일 이름·오류 문구', () => {
    const config: ListConfig = { filters: [], columns: ['접수일', '접수번호', '진행단계'], rows: [['2026.09.24', 'C1', '보완서류 요청']] };
    setup({ selectedRow: 0, uploadError: '보완서류를 1장 이상 올려 주세요.' }, 'PY-02', config);
    expect(screen.getByRole('alert').textContent).toBe('보완서류를 1장 이상 올려 주세요.');
    const input = document.getElementById('upl') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(['x'], '영수증.pdf')] } });
    expect(document.getElementById('fl-upl')?.textContent).toBe('영수증.pdf');
  });
});
