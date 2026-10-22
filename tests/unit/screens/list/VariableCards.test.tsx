import { render, screen, within } from '@testing-library/react';
import { VariableCards, VariableDetailTop, type VariableCardInfo } from '../../../../src/screens/list/VariableCards';

const CONTRACT: VariableCardInfo = {
  no: '2021-1', name: '(무)iM 변액유니버설 종신보험', status: '정상', insured: '홍서연', insuredRelation: '자녀',
  variable: { reserve: 10_800_000, principal: 10_000_000, fundChangesLeft: 12, funds: [['국내주식형', 60, '+8.0%', '2등급'], ['채권형', 40, '+3.0%', '5등급'], ['MMF', 0, '+2.0%', '6등급']] },
};

test('VariableCards: 변액 계약마다 카드(이름·증권번호·피보험자·상태·적립금·누적 수익률·납입 원금·편입 펀드) + 상세 보기', () => {
  render(<VariableCards contracts={[{ ...CONTRACT, no: '2020-9', name: '(무)iM 하이브리드 변액연금보험', insuredRelation: undefined, insured: '홍길동' }, CONTRACT]} />);
  const cards = screen.getAllByRole('article');
  expect(cards).toHaveLength(2);
  const card = within(cards[1]);
  expect(card.getByRole('heading', { name: '(무)iM 변액유니버설 종신보험' })).toBeTruthy();
  expect(card.getByText('증권번호 2021-1 · 피보험자 홍서연(자녀)')).toBeTruthy();
  expect(card.getByText('정상')).toBeTruthy();
  expect(card.getByText('10,800,000원')).toBeTruthy();
  expect(card.getByText('+8.00%')).toBeTruthy();
  expect(card.getByText('10,000,000원')).toBeTruthy();
  expect(card.getByText('편입 펀드 2개 · 국내주식형 60% · 채권형 40%')).toBeTruthy();
  expect(card.getByRole('button', { name: /^상세 보기.*변액유니버설 종신보험$/ }).dataset).toMatchObject({ action: 'variable-open', no: '2021-1' });
});

test('VariableDetailTop: 계약 목록 버튼 + 계약 이름 제목(초점 대상)', () => {
  render(<VariableDetailTop contract={CONTRACT} />);
  expect(screen.getByRole('button', { name: /계약 목록/ }).dataset).toMatchObject({ action: 'variable-list' });
  const title = screen.getByRole('heading', { level: 2, name: /변액유니버설 종신보험/ });
  expect(title.id).toBe('contractTitle');
  expect(within(title).getByText('정상')).toBeTruthy();
  expect(screen.getByText('증권번호 2021-1 · 피보험자 홍서연(자녀)')).toBeTruthy();
});
