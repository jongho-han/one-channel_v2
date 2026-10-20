/* 폼 필드 React 컴포넌트: formEngine.js renderField 와 같은 마크업·접근성 연결 */
import { render, screen } from '@testing-library/react';
import { Field } from '../../../src/components/form/Field';

describe('Field', () => {
  test('선택 상자: 레이블 연결·필수 표시·값 선택', () => {
    const { container } = render(<Field field={{ id: 'use', label: '용도', type: 'select', options: ['개인', '회사'] }} values={{ use: '회사' }} />);
    const select = screen.getByLabelText(/용도/) as HTMLSelectElement;
    expect(select.tagName).toBe('SELECT');
    expect(select.value).toBe('회사');
    expect(select.getAttribute('aria-required')).toBe('true');
    expect(select.getAttribute('aria-describedby')).toBe('e-use');
    expect(container.querySelector('.fld')?.getAttribute('data-f')).toBe('use');
    expect(container.querySelector('.req')?.textContent).toBe('*');
    expect(screen.getByText('(필수)').className).toBe('sr-only');
    expect(container.querySelector('#e-use')?.getAttribute('role')).toBe('alert');
  });

  test('라디오: 그룹 이름 연결, 값이 없으면 첫 선택지', () => {
    render(<Field field={{ id: 'yr', label: '귀속 연도', type: 'radio', options: ['2025년', '2024년'] }} values={{}} />);
    const group = screen.getByRole('radiogroup', { name: /귀속 연도/ });
    expect(group.getAttribute('aria-describedby')).toBe('e-yr');
    expect((screen.getByLabelText('2025년') as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText('2024년') as HTMLInputElement).name).toBe('yr');
  });

  test('날짜: 기본값, 값이 있으면 값 우선', () => {
    const { rerender } = render(<Field field={{ id: 'base', label: '기준일', type: 'date', value: '2026-10-02' }} values={{}} />);
    const input = screen.getByLabelText(/기준일/) as HTMLInputElement;
    expect(input.type).toBe('date');
    expect(input.value).toBe('2026-10-02');
    expect(input.getAttribute('placeholder')).toBe('');
    rerender(<Field key="2" field={{ id: 'base', label: '기준일', type: 'date', value: '2026-10-02' }} values={{ base: '2026-01-05' }} />);
    expect((screen.getByLabelText(/기준일/) as HTMLInputElement).value).toBe('2026-01-05');
  });

  test('선택 항목: 필수 표시 없음, 도움말 연결', () => {
    render(<Field field={{ id: 'memo', label: '메모', optional: true, help: '200자 이내' }} values={{}} />);
    const input = screen.getByLabelText('메모');
    expect(input.getAttribute('aria-required')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBe('h-memo e-memo');
    expect(screen.getByText('200자 이내').id).toBe('h-memo');
  });
});
