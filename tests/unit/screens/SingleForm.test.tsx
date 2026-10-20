import { fireEvent, render, screen } from '@testing-library/react';
import type { FieldValues } from '../../../src/components/form/fieldSpec';
import { SingleForm, type SingleFormConfig } from '../../../src/screens/singleForm/SingleForm';

const CONFIG: SingleFormConfig = {
  current: [['현재 계좌', 'iM뱅크']],
  fields: [
    { id: 'nm', label: '이름' },
    { id: 'm', label: '월 상환', type: 'radio', options: ['100원', '200원'] },
  ],
  calc: values => [['월 상환', String(values.m ?? '100원')], ['기간', values.m === '200원' ? '5개월' : '10개월', true]],
  agree: ['[필수] 확인했습니다'],
  note: '유의사항입니다.',
  done: '완료',
};

const setup = (overrides: Partial<SingleFormConfig> = {}, authLevel: 'A1' | 'A2' = 'A1') => {
  const onSubmit = vi.fn();
  const flow = { step: 0, values: {} as FieldValues, agreed: [] as number[] };
  render(<SingleForm config={{ ...CONFIG, ...overrides }} values={flow.values} agreed={flow.agreed} authLevel={authLevel}
                     onValuesChange={values => { flow.values = values; }} onAgreedChange={agreed => { flow.agreed = agreed; }} onSubmit={onSubmit} />);
  return { onSubmit, flow };
};

describe('SingleForm', () => {
  test('현재 정보·변경 입력·안내·동의·버튼', () => {
    setup();
    expect(screen.getByRole('heading', { name: '현재 등록된 정보' })).toBeTruthy();
    expect(screen.getByText('iM뱅크')).toBeTruthy();
    expect(screen.getByText('유의사항입니다.')).toBeTruthy();
    expect(screen.getByRole('button', { name: '변경하기' }).id).toBe('next');
    expect(screen.getByRole('button', { name: '취소' }).dataset.action).toBe('back');
  });

  test('버튼 이름: 추가인증 화면·지정 이름', () => {
    setup({}, 'A2');
    expect(screen.getByRole('button', { name: '추가인증 후 변경' })).toBeTruthy();
  });

  test('선택을 바꾸면 계산을 다시 함', () => {
    setup();
    expect(document.getElementById('calc')?.textContent).toContain('10개월');
    fireEvent.click(screen.getByLabelText('200원'));
    expect(document.getElementById('calc')?.textContent).toContain('5개월');
  });

  test('필수 입력이 비면 오류, 동의가 없으면 안내 — 제출하지 않음', () => {
    const { onSubmit } = setup();
    fireEvent.click(screen.getByRole('button', { name: '변경하기' }));
    expect(document.getElementById('e-nm')?.textContent).toBe('이름을(를) 입력해 주세요.');
    expect(document.activeElement?.id).toBe('nm');

    fireEvent.change(screen.getByLabelText(/이름/), { target: { value: '홍길동' } });
    fireEvent.click(screen.getByRole('button', { name: '변경하기' }));
    expect(document.getElementById('e-nm')?.textContent).toBe('');
    expect(document.getElementById('agrErr')?.textContent).toBe('필수 확인 항목에 체크해 주세요.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('모두 맞으면 입력값·동의를 진행 상태에 담아 제출', () => {
    const { onSubmit, flow } = setup();
    fireEvent.change(screen.getByLabelText(/이름/), { target: { value: '홍길동' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: '변경하기' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(flow.values).toEqual({ nm: '홍길동', m: '100원' });
    expect(flow.agreed).toEqual([0]);
  });
});
