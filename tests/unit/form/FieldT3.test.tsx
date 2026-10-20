/* Field: 금액·체크·파일·조건부 숨김·고정 규칙 */
import { fireEvent, render, screen } from '@testing-library/react';
import { Field } from '../../../src/components/form/Field';

describe('Field (T3 유형)', () => {
  test('금액: 숫자만·천 단위, 빠른 금액·최대, 원 단위 표시', () => {
    const onChange = vi.fn();
    render(<Field field={{ id: 'amt', label: '인출 금액', type: 'money', max: 500000, quick: [100000, 'max'] }} values={{ amt: 1000 }} onChange={onChange} />);
    const input = screen.getByLabelText(/인출 금액/) as HTMLInputElement;
    expect(input.value).toBe('1,000');
    expect(input.dataset.max).toBe('500000');
    fireEvent.input(input, { target: { value: '12a34' } });
    expect(input.value).toBe('1,234');
    fireEvent.click(screen.getByRole('button', { name: '+10만 (10만원 더하기)' }));
    expect(input.value).toBe('101,234');
    fireEvent.click(screen.getByRole('button', { name: '최대 금액 입력' }));
    expect(input.value).toBe('500,000');
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  test('체크: 여러 개 선택, 가로 배치', () => {
    const { container } = render(<Field field={{ id: 'kind', label: '청구 내용', type: 'checks', inline: true, options: ['통원', '입원'] }} values={{ kind: ['입원'] }} />);
    expect(container.querySelector('.checks')?.className).toBe('checks inline');
    expect((screen.getByLabelText('입원') as HTMLInputElement).checked).toBe(true);
    expect(screen.getByRole('group', { name: /청구 내용/ })).toBeTruthy();
  });

  test('파일: 고른 파일 이름 칩, 설명 연결', () => {
    render(<Field field={{ id: 'docs', label: '증빙서류', type: 'file', placeholder: '영수증을 올려 주세요' }} values={{}} />);
    const input = screen.getByLabelText(/증빙서류/) as HTMLInputElement;
    expect(input.getAttribute('aria-describedby')).toBe('e-docs fl-docs');
    fireEvent.change(input, { target: { files: [new File(['x'], 'a.pdf'), new File(['y'], 'b.jpg')] } });
    expect(document.getElementById('fl-docs')?.textContent).toBe('a.pdfb.jpg');
  });

  test('조건부 숨김', () => {
    const { container } = render(<Field field={{ id: 'v', label: '은행' }} values={{}} hidden />);
    expect((container.querySelector('.fld') as HTMLElement).hidden).toBe(true);
  });

  test('고정: 고정값만 보이고 선택 불가, 이유 안내 · 해당없음은 풀려 있으면 숨김', () => {
    const field = { id: 'fixed', label: '확정기간', type: 'radio' as const, options: ['10년', '해당없음'] };
    const { container, rerender } = render(<Field field={field} values={{ fixed: '해당없음' }} lock={{ value: '해당없음', reason: '종신연금 선택 시', everLocked: true }} />);
    expect(container.querySelector('.fld')?.className).toBe('fld locked');
    expect((screen.getByLabelText('해당없음') as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByLabelText('10년').closest('label') as HTMLElement).hidden).toBe(true);
    expect(document.getElementById('lk-fixed')?.textContent).toBe('종신연금 선택 시 고정');
    expect(screen.getByRole('radiogroup').getAttribute('aria-describedby')).toBe('e-fixed lk-fixed');

    rerender(<Field field={field} values={{ fixed: '10년' }} lock={{ everLocked: true }} />);
    expect(container.querySelector('.fld')?.className).toBe('fld');
    expect((screen.getByLabelText('해당없음').closest('label') as HTMLElement).hidden).toBe(true);
    expect((screen.getByLabelText('10년') as HTMLInputElement).checked).toBe(true);
    expect(document.getElementById('lk-fixed')?.hidden).toBe(true);
  });
});
