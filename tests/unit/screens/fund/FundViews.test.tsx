import { fireEvent, render, screen } from '@testing-library/react';
import { FundCompare, FundEdit, SuitabilityQuestions, SuitabilityResult } from '../../../../src/screens/fund/FundViews';
import type { Fund } from '../../../../src/screens/fund/fundRules';

const FUNDS: Fund[] = [['주식형', 60, '+10%', '3등급(다소높은위험)'], ['채권형', 40, '+3%', '5등급(낮은위험)'], ['MMF', 0, '+2%', '6등급(매우낮은위험)']];
const CONTRACT = { no: '1', name: '(무)iM 변액연금', variable: { reserve: 1000000, principal: 900000, fundChangesLeft: 5, funds: FUNDS } };
const SUITABILITY = { profile: '적극투자형', diagnosedAt: '2025.01.01' };

describe('FundEdit', () => {
  test('비율을 바꾸면 합계·위험 안내가 바로 바뀌고 변경을 알림', () => {
    const onRatiosChange = vi.fn();
    render(<FundEdit contracts={[CONTRACT]} contract={CONTRACT} ratios={[60, 40, 0]} rebalance={false} suitability={SUITABILITY}
                     onRatiosChange={onRatiosChange} onRebalanceChange={vi.fn()} />);
    expect(document.getElementById('fsum')?.textContent).toBe('100%');
    expect(document.getElementById('riskLine')?.className).toBe('risk-line ok');
    fireEvent.input(screen.getByLabelText('주식형 변경 후 비율'), { target: { value: '50' } });
    expect(document.getElementById('fsum')?.textContent).toBe('90% (100%로 맞춰 주세요)');
    expect(document.getElementById('fsum')?.className).toBe('num is-invalid');
    expect(document.getElementById('riskLine')?.textContent).toBe('');
    expect(onRatiosChange).toHaveBeenLastCalledWith([50, 40, 0]);
  });

  test('자동재배분 토글·계약 탭', () => {
    const onRebalanceChange = vi.fn();
    render(<FundEdit contracts={[CONTRACT]} contract={CONTRACT} ratios={[60, 40, 0]} rebalance suitability={SUITABILITY}
                     onRatiosChange={vi.fn()} onRebalanceChange={onRebalanceChange} />);
    fireEvent.click(screen.getByLabelText('자동재배분'));
    expect(onRebalanceChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('button', { name: '변액연금' }).getAttribute('aria-pressed')).toBe('true');
  });
});

describe('SuitabilityQuestions', () => {
  test('답하지 않은 문항 오류, 답하면 알리고 오류 지움', () => {
    const onAnswer = vi.fn();
    render(<SuitabilityQuestions questions={[['기간?', [['짧게', 1], ['길게', 5]]], ['경험?', [['없음', 1]]]]} answers={{ 1: 0 }} missing={[0]} onAnswer={onAnswer} />);
    expect(document.getElementById('sqErr0')?.textContent).toBe('답을 선택해 주세요.');
    expect((screen.getByLabelText('없음') as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByLabelText('길게'));
    expect(onAnswer).toHaveBeenCalledWith(0, 1);
    expect(document.getElementById('sqErr0')?.textContent).toBe('');
  });
});

describe('SuitabilityResult', () => {
  test('가능: 비교로 / 불가: 익일 재진행 안내', () => {
    const { rerender } = render(<SuitabilityResult result={{ ok: true, profile: '공격투자형', score: 24, grade: 3 }} today="2026.10.02" />);
    expect(screen.getByText('변경 후 편입비율로 변경할 수 있습니다')).toBeTruthy();
    expect(screen.getByRole('button', { name: '변경 내용 확인' }).dataset.action).toBe('fund-compare');
    rerender(<SuitabilityResult result={{ ok: false, profile: '안정형', score: 5, grade: 3 }} today="2026.10.02" />);
    expect(screen.getByText('2026.10.03(익일) 이후 다시 진행')).toBeTruthy();
    expect(screen.getByRole('button', { name: '편입비율 다시 조정' }).dataset.action).toBe('suit-edit');
  });
});

describe('FundCompare', () => {
  test('바뀐 펀드 강조·증감·함께 바뀌는 내용', () => {
    const { container } = render(<FundCompare contract={CONTRACT} after={[50, 40, 10]} rebalance suitability={SUITABILITY} />);
    const rows = [...container.querySelectorAll('.cmp-tbl tbody tr')];
    expect(rows).toHaveLength(3);
    expect(rows[0].className).toBe('changed');
    expect(rows[1].className).toBe('');
    expect(rows[0].querySelector('.dcol')?.textContent).toBe('▼ 10%p 감소');
    expect(screen.getByText(/미신청 →/).textContent).toBe('미신청 → 신청');
    expect(screen.getByText(/5회 →/).textContent).toBe('5회 → 4회');
  });
});
