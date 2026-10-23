/* 개인정보변경(MY-01) 화면: 연락처 · 자택정보 · 직장정보, 현재 정보는 가려서 표시 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { PrivacyForm, type PrivacyFormProps } from '../../../src/screens/singleForm/PrivacyForm';

const CURRENT = {
  phone: '010-1234-5678', email: 'gildong.hong@example.com',
  homeZip: '04524', homeAddress: '서울특별시 중구 세종대로 110, 101동 1203호', homeTel: '02-123-4567',
  workZip: '42020', workAddress: '대구광역시 수성구 달구벌대로 2310, 8층', workTel: '053-740-0000',
};
const setup = (props: Partial<PrivacyFormProps> = {}) => {
  const handlers = { onChange: vi.fn(), verifyPhone: vi.fn(), searchZip: vi.fn(), isEmailTaken: vi.fn((email: string) => email.startsWith('test@')) };
  render(<PrivacyForm current={CURRENT} values={{}} errors={{}} domains={['gmail.com', 'naver.com']} callCenter="1588-4770" {...handlers} {...props} />);
  return handlers;
};
const input = (label: RegExp | string) => screen.getByLabelText(label) as HTMLInputElement;

test('구역 제목·필수 안내', () => {
  setup();
  expect(screen.getAllByRole('heading', { level: 2 }).map(heading => heading.textContent)).toEqual(['연락처', '자택정보', '직장정보']);
  expect(screen.getByText(/표시는 필수 입력 항목입니다/)).toBeTruthy();
});

test('현재 정보를 가려서 보여줌 (입력하면 변경)', () => {
  setup();
  expect(input(/^휴대폰번호/).placeholder).toBe('010-****-5678');
  expect(input(/^휴대폰번호/).value).toBe('');
  expect(input('이메일 아이디').placeholder).toBe('gi**********');
  expect(input('이메일 도메인').value).toBe('example.com');
  expect(input('이메일 도메인').readOnly).toBe(true);
  expect((screen.getByLabelText('이메일 도메인 선택') as HTMLSelectElement).value).toBe('');
  expect(input(/^자택주소\*/).value).toBe('[04524] 서울특별시 중구 세종대로 110');
  expect(input(/^자택주소\*/).readOnly).toBe(true);
  expect(input('자택 상세주소').placeholder).toBe('**** ****');
  expect(['자택전화 앞자리', '자택전화 가운데자리', '자택전화 끝자리'].map(label => input(label).placeholder)).toEqual(['02', '****', '4567']);
  expect(input('직장주소').value).toBe('[42020] 대구광역시 수성구 달구벌대로 2310');
  expect(input('직장 상세주소').placeholder).toBe('****');
  expect(screen.getAllByText('자택, 직장 중 1개 이상의 주소를 꼭 입력해 주세요.')).toHaveLength(2);
  expect(screen.getByText(/본인명의 휴대폰 인증이 필요합니다.*1588-4770/)).toBeTruthy();
});

test('휴대폰인증: 형식이 틀리면 오류, 맞으면 인증 → 인증 완료 표시', () => {
  const { verifyPhone, onChange } = setup();
  fireEvent.click(screen.getByRole('button', { name: '휴대폰인증' }));
  expect(screen.getByText('변경할 휴대폰번호를 입력해 주세요.')).toBeTruthy();
  fireEvent.input(input(/^휴대폰번호/), { target: { value: '010-9876-5432' } });
  fireEvent.click(screen.getByRole('button', { name: '휴대폰인증' }));
  expect(verifyPhone).toHaveBeenCalledWith('010-9876-5432', expect.any(Function));
  verifyPhone.mock.calls[0][1]();
  expect(screen.getByText('휴대폰 인증 완료')).toBeTruthy();
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ mob: '010-9876-5432', mobVerified: true }));
  fireEvent.input(input(/^휴대폰번호/), { target: { value: '010-9876-5431' } });
  expect(screen.queryByText('휴대폰 인증 완료')).toBeNull();
});

test('이메일 중복확인: 사용 중 / 사용 가능', () => {
  const { onChange } = setup();
  fireEvent.input(input('이메일 아이디'), { target: { value: 'test' } });
  fireEvent.change(screen.getByLabelText('이메일 도메인 선택'), { target: { value: 'gmail.com' } });
  fireEvent.click(screen.getByRole('button', { name: '중복확인' }));
  expect(screen.getByText('이미 사용 중인 이메일입니다.')).toBeTruthy();
  fireEvent.input(input('이메일 아이디'), { target: { value: 'hong.new' } });
  fireEvent.click(screen.getByRole('button', { name: '중복확인' }));
  expect(screen.getByText('사용할 수 있는 이메일입니다.')).toBeTruthy();
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ emailLocal: 'hong.new', emailDomain: 'gmail.com', emailChecked: true }));
});

test('이메일: 아이디 @ 도메인 칸 + 도메인 선택 — 고르면 도메인 칸에 채움, 「직접 입력」이면 도메인 칸 입력 가능', () => {
  const { onChange, isEmailTaken } = setup();
  const domain = input('이메일 도메인');
  const select = screen.getByLabelText('이메일 도메인 선택') as HTMLSelectElement;
  const row = domain.closest('.email-row') as HTMLElement;
  expect([...row.querySelectorAll('input, select')].map(element => element.getAttribute('aria-label'))).toEqual(['이메일 아이디', '이메일 도메인', '이메일 도메인 선택']);
  expect([...select.options].map(option => option.textContent)).toEqual(['선택', 'example.com', 'gmail.com', 'naver.com', '직접 입력']);

  fireEvent.change(select, { target: { value: 'gmail.com' } });
  expect(domain.value).toBe('gmail.com');
  expect(domain.readOnly).toBe(true);
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ emailDomain: 'gmail.com', emailCustom: false, emailChecked: false }));

  fireEvent.change(select, { target: { value: '직접 입력' } });
  expect(domain.readOnly).toBe(false);
  expect(domain.value).toBe('');
  expect(document.activeElement).toBe(domain);
  fireEvent.input(input('이메일 아이디'), { target: { value: 'hong.new' } });
  fireEvent.input(domain, { target: { value: 'corp.co.kr' } });
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ emailLocal: 'hong.new', emailDomain: 'corp.co.kr', emailCustom: true, emailChecked: false }));
  fireEvent.click(screen.getByRole('button', { name: '중복확인' }));
  expect(isEmailTaken).toHaveBeenLastCalledWith('hong.new@corp.co.kr');

  fireEvent.change(select, { target: { value: 'naver.com' } });
  expect(domain.value).toBe('naver.com');
  expect(domain.readOnly).toBe(true);
});

test('주소 검색: 고른 주소로 바꾸고 상세주소는 비워 입력받음', () => {
  const { searchZip, onChange } = setup();
  fireEvent.click(screen.getByRole('button', { name: '직장주소 검색' }));
  searchZip.mock.calls[0][0]('04521', '서울 중구 남대문로 125');
  expect(input('직장주소').value).toBe('[04521] 서울 중구 남대문로 125');
  expect(input('직장 상세주소').placeholder).toBe('상세주소');
  expect(document.activeElement).toBe(input('직장 상세주소'));
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ addrW_zip: '04521', addrW: '서울 중구 남대문로 125', addrW_d: '' }));
});

test('오류 표시: 항목 아래·전체', () => {
  setup({ errors: { email: '이메일 중복확인을 해 주세요.', form: '변경할 내용이 없습니다.' } });
  expect(input('이메일 아이디').getAttribute('aria-invalid')).toBe('true');
  expect(within(screen.getByRole('group', { name: '이메일' })).getByText('이메일 중복확인을 해 주세요.')).toBeTruthy();
  expect(screen.getByText('변경할 내용이 없습니다.')).toBeTruthy();
});
