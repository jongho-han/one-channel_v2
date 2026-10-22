/* Field: 주소·계좌·전화·이메일, 오류 표시 */
import { render, screen } from '@testing-library/react';
import { Field } from '../../../src/components/form/Field';

describe('Field (추가 유형)', () => {
  test('여러 줄 입력(textarea): 레이블·안내·예시·필수·입력값 유지', () => {
    render(<Field field={{ id: 'story', label: '사고 발생경위', type: 'textarea', placeholder: '예) 오늘 계단을 급하게 내려가다 발목을 접지름', help: '육하원칙으로 작성해 주세요.' }} values={{ story: '계단에서 넘어짐' }} />);
    const area = screen.getByLabelText(/사고 발생경위/) as HTMLTextAreaElement;
    expect(area.tagName.toLowerCase()).toBe('textarea');
    expect(area.value).toBe('계단에서 넘어짐');
    expect(area.placeholder).toBe('예) 오늘 계단을 급하게 내려가다 발목을 접지름');
    expect(area.getAttribute('aria-required')).toBe('true');
    expect(area.getAttribute('aria-describedby')).toContain('h-story');
  });

  test('주소: 우편번호(읽기 전용)·검색 버튼·기본주소·상세주소', () => {
    const { container } = render(<Field field={{ id: 'addrH', label: '자택 주소', type: 'addr', zip: '04524', value: '세종대로 110' }} values={{ addrH_d: '101호' }} />);
    expect(container.querySelector('#lb-addrH')?.textContent).toContain('자택 주소');
    const zip = screen.getByLabelText('자택 주소 우편번호') as HTMLInputElement;
    expect(zip.value).toBe('04524');
    expect(zip.readOnly).toBe(true);
    expect(zip.getAttribute('autocomplete')).toBe('postal-code');
    expect(screen.getByRole('button', { name: '자택 주소 우편번호 검색' }).dataset.zip).toBe('addrH');
    const base = screen.getByLabelText('자택 주소 기본주소') as HTMLInputElement;
    expect(base.value).toBe('세종대로 110');
    expect(base.getAttribute('aria-required')).toBe('true');
    expect(base.getAttribute('aria-describedby')).toBe('e-addrH');
    expect((screen.getByLabelText('자택 주소 상세주소') as HTMLInputElement).value).toBe('101호');
  });

  test('계좌: 본인 계좌 목록 + 다른 본인 계좌 등록', () => {
    render(<Field field={{ id: 'acct', label: '출금 계좌', type: 'account' }} values={{}} />);
    const options = [...(screen.getByLabelText(/출금 계좌/) as HTMLSelectElement).options].map(option => option.text);
    expect(options.at(-1)).toBe('다른 본인 계좌 등록');
    expect(options.length).toBeGreaterThan(1);
  });

  test('전화·이메일: 입력 방식·자동완성', () => {
    render(<>
      <Field field={{ id: 'mob', label: '휴대폰', type: 'tel', value: '010-1234-5678' }} values={{}} />
      <Field field={{ id: 'mail', label: '이메일', type: 'email' }} values={{}} />
    </>);
    const mobile = screen.getByLabelText(/휴대폰/);
    expect(mobile.getAttribute('inputmode')).toBe('tel');
    expect(mobile.getAttribute('autocomplete')).toBe('tel');
    expect(screen.getByLabelText(/이메일/).getAttribute('type')).toBe('email');
  });

  test('오류: 문구·bad 클래스·aria-invalid', () => {
    render(<Field field={{ id: 'nm', label: '이름' }} values={{}} error="이름을(를) 입력해 주세요." />);
    const input = screen.getByLabelText(/이름/);
    expect(input.classList.contains('bad')).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById('e-nm')?.textContent).toBe('이름을(를) 입력해 주세요.');
  });
});
