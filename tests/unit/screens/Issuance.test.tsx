import { fireEvent, render, screen, within } from '@testing-library/react';
import { FormDownloads, IssuanceForm, IssuedCertificate } from '../../../src/screens/issuance/Issuance';
import type { CertificateConfig } from '../../../src/screens/certificates';

const CONFIG: CertificateConfig = {
  fields: [{ id: 'base', label: '기준일', type: 'date', value: '2026-10-02' }],
  document: values => [['증명서 종류', '테스트증명서'], ['기준일', String(values.base)]],
};
const USER = { name: '홍길동', birth: '1978.05.12', email: 'me@example.com' };

describe('IssuanceForm', () => {
  test('받는 방법에 따라 이메일·팩스 칸 표시', () => {
    render(<IssuanceForm config={CONFIG} values={{}} user={USER} onIssue={vi.fn()} />);
    expect(document.getElementById('emailF')?.hidden).toBe(true);
    fireEvent.click(screen.getByLabelText('이메일로 받기'));
    expect(document.getElementById('emailF')?.hidden).toBe(false);
    expect((screen.getByLabelText('받을 이메일') as HTMLInputElement).value).toBe('me@example.com');
    fireEvent.click(screen.getByLabelText('팩스로 받기'));
    expect(document.getElementById('emailF')?.hidden).toBe(true);
    expect(document.getElementById('faxF')?.hidden).toBe(false);
  });

  test('버튼은 [발급하기] 하나만 (취소 없음)', () => {
    const { container } = render(<IssuanceForm config={CONFIG} values={{}} user={USER} onIssue={vi.fn()} />);
    expect([...container.querySelectorAll('.navrow button')].map(button => button.textContent)).toEqual(['발급하기']);
  });

  test('팩스번호 오류면 발급하지 않고 안내', () => {
    const onIssue = vi.fn();
    render(<IssuanceForm config={CONFIG} values={{}} user={USER} onIssue={onIssue} />);
    fireEvent.click(screen.getByLabelText('팩스로 받기'));
    fireEvent.change(screen.getByLabelText('받을 팩스번호'), { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: '발급하기' }));
    expect(onIssue).not.toHaveBeenCalled();
    expect(document.getElementById('faxErr')?.textContent).toBe('팩스번호를 확인해 주세요.');
  });

  test('발급: 입력값(날짜는 점 구분)과 받는 방법을 넘김', () => {
    const onIssue = vi.fn();
    render(<IssuanceForm config={CONFIG} values={{}} user={USER} onIssue={onIssue} />);
    fireEvent.change(screen.getByLabelText(/기준일/), { target: { value: '2026-09-15' } });
    fireEvent.click(screen.getByRole('button', { name: '발급하기' }));
    expect(onIssue).toHaveBeenCalledWith({ base: '2026.09.15', recv: '화면에서 보기', email: 'me@example.com', fax: '' });
  });
});

describe('IssuedCertificate', () => {
  test('증명서 표·전달 안내·견본 문구', () => {
    render(<IssuedCertificate config={CONFIG} values={{ base: '2026.09.15', recv: '팩스로 받기', fax: '02-123-4567' }} user={USER}
                              issueNo="No. 20261002-550000" today="2026.10.02" documentCode="AAAA-BBBB" />);
    expect(screen.getByText(/02-123-4567\(으\)로 전송했습니다/)).toBeTruthy();
    expect(screen.getByRole('heading', { name: '테스트증명서' })).toBeTruthy();
    const table = screen.getByRole('table');
    expect(within(table).getByText('홍길동 (1978.**.**)')).toBeTruthy();
    expect(within(table).getByText('2026.09.15')).toBeTruthy();
    expect(screen.getByText(/No\. 20261002-550000 · 문서확인번호 AAAA-BBBB/)).toBeTruthy();
    expect(screen.getByRole('button', { name: '추가 발급' }).dataset.action).toBe('reset-flow');
    expect(screen.getByRole('button', { name: '완료' }).dataset.action).toBe('reset-flow');   // 메인이 아닌 발급 화면으로
  });
});

describe('FormDownloads', () => {
  test('서류 목록과 구분 색', () => {
    render(<FormDownloads title="제지급 서류" items={[['제지급 신청서', '공통', '필수'], ['위임장', '대리인', '선택']]} />);
    expect(screen.getByRole('heading', { name: '제지급 서류' })).toBeTruthy();
    expect(screen.getByText('필수').className).toBe('st r');
    expect(screen.getByText('선택').className).toBe('st n');
    expect(screen.getByRole('button', { name: '위임장 PDF 받기' }).dataset).toMatchObject({ action: 'toast', message: '위임장 PDF는 실제 서비스에서 내려받습니다.' });
  });
});
