import { render, screen, within } from '@testing-library/react';
import { ContractDetail, type ContractInfo } from '../../../../src/screens/list/ContractDetail';

const CONTRACT: ContractInfo = {
  no: '2019-1', name: '(무)iM 튼튼 어린이보험', status: '정상', startDate: '2019.07.10', endDate: '2049.07.10 만기', payEnd: '2039.06',
  coverage: [['주계약', '입원', '30,000원']], insured: '홍서연', insuredRelation: '자녀', beneficiary: '홍길동(계약자)',
  premium: 45000, paidCount: 87, totalCount: 240, account: 'iM뱅크', debitDay: '25일',
};

test('ContractDetail: 계약 탭·기본정보·보장·관계자·약관 내려받기', () => {
  render(<ContractDetail contracts={[{ ...CONTRACT, no: '0', name: '(무)iM 든든한 종신보험' }, CONTRACT]} selected={1} userName="홍길동"
                         documents={[{ id: 'terms', kind: '약관', title: '보통약관', date: '2019.07.10' }]} />);
  expect(screen.getByRole('button', { name: '튼튼 어린이보험' }).getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByRole('button', { name: '든든한 종신보험' }).dataset).toMatchObject({ action: 'contract-tab', index: '0' });
  expect(screen.getByText('2039.06까지')).toBeTruthy();
  expect(screen.getByText('홍서연(자녀)')).toBeTruthy();
  expect(screen.getByText('87회 / 240회')).toBeTruthy();
  expect(screen.getByRole('button', { name: '보험증권 재발급' }).className).toBe('btn pri');
  const download = screen.getByRole('button', { name: /보통약관 내려받기/ });
  expect(download.dataset).toMatchObject({ action: 'download-contract-doc', no: '2019-1', doc: 'terms' });
  expect(within(screen.getByRole('table', { name: /약관·안내장 목록/ })).getByText('약관')).toBeTruthy();
});
