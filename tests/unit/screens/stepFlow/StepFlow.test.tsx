import { fireEvent, render, screen, within } from '@testing-library/react';
import { ConfirmStep, DoneStep, InputStep, PickStep, SignStep, Stepper } from '../../../../src/screens/stepFlow/StepFlow';

test('Stepper: 완료·현재 단계 표시', () => {
  render(<Stepper steps={['선택', '입력', '확인']} current={1} />);
  const list = screen.getByRole('list', { name: '진행 단계 (전체 3단계)' });
  const items = within(list).getAllByRole('listitem');
  expect(items[0].className).toBe('done');
  expect(items[1].getAttribute('aria-current')).toBe('step');
  expect(items[1].id).toBe('currentStep');
  expect(items[1].textContent).toBe('2입력 (현재 단계)');
});

test('PickStep: 고르기 전에는 다음 비활성·안내, 해지 전 대안', () => {
  const onNext = vi.fn();
  const items = [{ key: 'a', title: '종신', sub: '증권 1', value: '1원' }];
  const { rerender } = render(<PickStep label="계약을 선택하세요" items={items} picked={null} retain onNext={onNext} />);
  expect((screen.getByRole('button', { name: '다음' }) as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getByText('해지하기 전에 이런 방법도 있어요')).toBeTruthy();
  rerender(<PickStep label="계약을 선택하세요" items={items} picked="a" onNext={onNext} />);
  expect(screen.getByRole('button', { name: /종신/ }).getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: '다음' }));
  expect(onNext).toHaveBeenCalled();
});

test('PickStep 여러 개 고르기: 체크 표시·전체선택/전체해제·하나 이상 골라야 다음', () => {
  const onNext = vi.fn();
  const items = [{ key: 'a', title: '종신', sub: '', value: '1원' }, { key: 'b', title: '연금', sub: '', value: '2원' }];
  const { rerender } = render(<PickStep label="납입할 계약을 선택하세요" items={items} picked={null} multiple pickedKeys={[]} onNext={onNext} />);
  const all = screen.getByRole('button', { name: '전체선택' });
  expect(all.dataset.action).toBe('pick-all');
  expect(all.getAttribute('aria-pressed')).toBe('false');
  expect(screen.getByRole('group', { name: '납입할 계약을 선택하세요' }).querySelectorAll('.pick.multi')).toHaveLength(2);
  expect((screen.getByRole('button', { name: '다음' }) as HTMLButtonElement).disabled).toBe(true);
  rerender(<PickStep label="납입할 계약을 선택하세요" items={items} picked={null} multiple pickedKeys={['a', 'b']} onNext={onNext} />);
  expect(screen.getByRole('button', { name: '전체해제' }).getAttribute('aria-pressed')).toBe('true');
  expect(screen.getAllByRole('button', { pressed: true }).map(button => button.dataset.key ?? 'all')).toEqual(['all', 'a', 'b']);
  expect((screen.getByRole('button', { name: '다음' }) as HTMLButtonElement).disabled).toBe(false);
  expect(screen.getByText('2건 선택')).toBeTruthy();
});

describe('InputStep', () => {
  const config = {
    fields: [{ id: 'nm', label: '이름' }, { id: 'amt', label: '금액', type: 'money' as const, max: 1000 }],
    calc: (values: Record<string, unknown>) => [['금액', `${values.amt ?? 0}원`, true] as const],
    agree: ['[필수] 확인'],
    warn: '유의하세요',
    intro: { tone: 'info', title: '안내', desc: '설명' },
  };
  const setup = () => {
    const onSubmit = vi.fn();
    render(<InputStep config={config} values={{}} agreed={[]} picked={{ key: 'k', title: '종신', sub: '증권', value: '1원' }} announce={vi.fn()}
                      onValuesChange={vi.fn()} onAgreedChange={vi.fn()} onSubmit={onSubmit} />);
    return onSubmit;
  };

  test('고른 항목·안내·입력·계산·주의·동의', () => {
    setup();
    expect(screen.getByText('종신')).toBeTruthy();
    expect(screen.getByText('안내')).toBeTruthy();
    expect(screen.getByRole('heading', { name: '입력하기' })).toBeTruthy();
    fireEvent.input(screen.getByLabelText(/금액/), { target: { value: '500' } });
    expect(document.getElementById('calc')?.textContent).toBe('금액500원');
    expect(screen.getByText('유의하세요')).toBeTruthy();
  });

  test('검증 → 동의 확인 → 제출', () => {
    const onSubmit = setup();
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    expect(document.getElementById('e-nm')?.textContent).toBe('이름을(를) 입력해 주세요.');
    fireEvent.change(screen.getByLabelText(/이름/), { target: { value: '홍길동' } });
    fireEvent.input(screen.getByLabelText(/금액/), { target: { value: '500' } });
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    expect(document.getElementById('agrErr')?.textContent).toBe('필수 확인 항목에 모두 체크해 주세요.');
    expect(document.activeElement).toBe(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    expect(onSubmit).toHaveBeenCalledWith({ nm: '홍길동', amt: 500 }, [0]);
  });
});

test('ConfirmStep: 신청 내용·계산·버튼', () => {
  const onConfirm = vi.fn();
  render(<ConfirmStep rows={[['이름', '홍길동']]} calcRows={[['합계', '1원', true]]} onConfirm={onConfirm} />);
  expect(screen.getByText('홍길동')).toBeTruthy();
  expect(screen.getByRole('button', { name: '수정' }).dataset.action).toBe('step-prev');
  fireEvent.click(screen.getByRole('button', { name: '신청 내용이 맞습니다' }));
  expect(onConfirm).toHaveBeenCalled();
});

test('SignStep: 추가인증 안내·인증수단 선택', () => {
  const onSign = vi.fn();
  render(<SignStep authLevel="A2" onSign={onSign} />);
  expect(screen.getByRole('heading', { name: '전자서명 + 휴대폰 추가인증' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /공동인증서/ }));
  expect(onSign).toHaveBeenCalledWith('공동인증서');
});

test('DoneStep: 완료 카드·다음 화면 버튼', () => {
  render(<DoneStep title="신청이 완료되었습니다" message="접수되었습니다." rows={[['접수번호', 'C-1'], ['안내', '알림톡', true]]} next={['청구 진행 조회', 'PY-02']} />);
  expect(screen.getByRole('heading', { name: '신청이 완료되었습니다' })).toBeTruthy();
  expect(screen.getByRole('button', { name: '청구 진행 조회' }).dataset.id).toBe('PY-02');
});
