/* 라디오 「기타」 직접 입력: 기타 오른쪽 입력칸 — 기타를 골라야 입력 가능, 값 읽기·검증·확인 표시 */
import { fireEvent, render, screen } from '@testing-library/react';
import { Field } from '../../../src/components/form/Field';
import type { FieldSpec } from '../../../src/components/form/fieldSpec';
import { displayValue } from '../../../src/form/display';
import { readFieldValues } from '../../../src/form/fieldValues';
import { validateValues } from '../../../src/form/validation';

const FIELD: FieldSpec = { id: 'acc', label: '사고 유형', type: 'radio', options: ['질병', '재해', '기타'], other: { option: '기타', placeholder: '사고 유형 직접 입력' } };

test('기타 오른쪽에 입력칸, 기타를 고르기 전에는 입력할 수 없음', () => {
  const { container } = render(<Field field={FIELD} values={{}} />);
  const input = screen.getByRole('textbox', { name: '기타 사고 유형 직접 입력' }) as HTMLInputElement;
  expect(input.id).toBe('accEtc');
  expect(input.placeholder).toBe('사고 유형 직접 입력');
  expect(input.disabled).toBe(true);
  expect(screen.getByLabelText('기타').closest('label')?.nextElementSibling).toBe(input);
  fireEvent.click(screen.getByLabelText('기타'));
  expect(input.disabled).toBe(false);
  fireEvent.change(input, { target: { value: '벌에 쏘임' } });
  expect(readFieldValues(container, [FIELD])).toEqual({ acc: '기타', accEtc: '벌에 쏘임' });
  fireEvent.click(screen.getByLabelText('질병'));
  expect(input.disabled).toBe(true);
});

test('저장된 값이 기타면 입력칸 사용 가능·값 유지', () => {
  render(<Field field={FIELD} values={{ acc: '기타', accEtc: '벌에 쏘임' }} />);
  const input = screen.getByRole('textbox', { name: '기타 사고 유형 직접 입력' }) as HTMLInputElement;
  expect(input.disabled).toBe(false);
  expect(input.value).toBe('벌에 쏘임');
});

test('검증: 기타를 고르고 비우면 입력 안내, 다른 선택지는 통과', () => {
  expect(validateValues([FIELD], { acc: '기타', accEtc: ' ' })).toEqual({ acc: '기타 사고 유형을 입력해 주세요.' });
  expect(validateValues([FIELD], { acc: '기타', accEtc: '벌에 쏘임' })).toEqual({});
  expect(validateValues([FIELD], { acc: '질병', accEtc: '' })).toEqual({});
});

test('확인 표시: 기타(입력값)', () => {
  expect(displayValue(FIELD, { acc: '기타', accEtc: '벌에 쏘임' })).toBe('기타(벌에 쏘임)');
  expect(displayValue(FIELD, { acc: '질병', accEtc: '벌에 쏘임' })).toBe('질병');
});
