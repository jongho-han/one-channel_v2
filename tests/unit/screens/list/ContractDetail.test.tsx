import { render, screen, within } from '@testing-library/react';
import { ContractCards, ContractDetail, type ContractInfo } from '../../../../src/screens/list/ContractDetail';

const CONTRACT: ContractInfo = {
  no: '2019-1', name: '(무)iM 튼튼 어린이보험', status: '정상', startDate: '2019.07.10', endDate: '2049.07.10 만기', payEnd: '2039.06',
  coverage: [['주계약', '입원', '30,000원']], insured: '홍서연', insuredRelation: '자녀', beneficiary: '홍길동(계약자)',
  premium: 45000, paidCount: 87, totalCount: 240, account: 'iM뱅크', debitDay: '25일',
};

test('ContractCards: 계약마다 카드(이름·증권번호·피보험자·상태·월 보험료·계약일·보험기간·납입) + 상세 보기', () => {
  render(<ContractCards contracts={[{ ...CONTRACT, no: '0', name: '(무)iM 든든한 종신보험', status: '납입유예', totalCount: '갱신형' }, CONTRACT]} />);
  const cards = screen.getAllByRole('article');
  expect(cards).toHaveLength(2);
  const card = within(cards[1]);
  expect(card.getByRole('heading', { name: '(무)iM 튼튼 어린이보험' })).toBeTruthy();
  expect(card.getByText('증권번호 2019-1 · 피보험자 홍서연(자녀)')).toBeTruthy();
  expect(card.getByText('정상')).toBeTruthy();
  expect(card.getByText('45,000원')).toBeTruthy();
  expect(card.getByText('2019.07.10')).toBeTruthy();
  expect(card.getByText('2049.07.10 만기')).toBeTruthy();
  expect(card.getByText('납입 87/240회')).toBeTruthy();
  expect(card.getByRole('button', { name: /^상세 보기.*튼튼 어린이보험$/ }).dataset).toMatchObject({ action: 'contract-open', index: '1' });
  expect(within(cards[0]).getByText('갱신형')).toBeTruthy();
  expect(within(cards[0]).getByText('납입유예')).toBeTruthy();
});

test('ContractDetail: 계약 목록으로 돌아가기 · 기본정보 · 보장 · 관계자 · 약관 내려받기 (계약 탭 없음)', () => {
  render(<ContractDetail contract={CONTRACT} userName="홍길동" documents={[{ id: 'terms', kind: '약관', title: '보통약관', date: '2019.07.10' }]} />);
  expect(screen.getByRole('button', { name: /계약 목록/ }).dataset).toMatchObject({ action: 'contract-list' });
  expect(screen.queryByRole('group', { name: '조회할 계약' })).toBeNull();
  expect(screen.getByRole('heading', { level: 2, name: /튼튼 어린이보험/ }).id).toBe('contractTitle');
  expect(screen.getByText('2039.06까지')).toBeTruthy();
  expect(screen.getByText('홍서연(자녀)')).toBeTruthy();
  expect(screen.getByText('87회 / 240회')).toBeTruthy();
  expect(screen.getByRole('button', { name: '보험증권 재발급' }).className).toBe('btn pri');
  const download = screen.getByRole('button', { name: /보통약관 내려받기/ });
  expect(download.dataset).toMatchObject({ action: 'download-contract-doc', no: '2019-1', doc: 'terms' });
  expect(within(screen.getByRole('table', { name: /약관·안내장 목록/ })).getByText('약관')).toBeTruthy();
});
