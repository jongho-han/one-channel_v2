import { fireEvent, render, screen } from '@testing-library/react';
import { MarketingConsents, NoticeSettings } from '../../../src/screens/singleForm/CustomForms';

const NOTICES = [['계약사항 안내', '법정', '모바일'], ['배당금 안내', '선택', '우편(직장)']] as const;
const CONTACT = { phone: '010-1234-5678', email: 'me@example.com' };

describe('NoticeSettings', () => {
  const setup = (consent = true) => {
    const props = { notices: NOTICES, contact: CONTACT, methods: ['모바일', '우편(직장)'], consent, onChange: vi.fn(), confirmRelease: vi.fn(), announce: vi.fn(), toast: vi.fn() };
    render(<NoticeSettings {...props} />);
    return props;
  };

  test('법정 안내장에는 받지 않음 없음', () => {
    setup();
    const options = (id: string) => [...(document.getElementById(id) as HTMLSelectElement).options].map(option => option.text);
    expect(options('nt0')).not.toContain('받지 않음');
    expect(options('nt1')).toContain('받지 않음');
  });

  test('동의가 없을 때 전자적 수신을 고르면 자동 동의 + 안내', () => {
    const props = setup(false);
    fireEvent.change(document.getElementById('nt1') as HTMLSelectElement, { target: { value: '이메일' } });
    expect(props.onChange).toHaveBeenLastCalledWith(['모바일', '이메일'], true);
    expect((document.getElementById('eConsent') as HTMLInputElement).checked).toBe(true);
    expect(props.announce).toHaveBeenCalledWith('모바일·이메일 수신을 선택해 전자적방법 수신동의에 체크했습니다.');
  });

  test('동의 해제는 확인 후: 전자적 수신을 우편(자택)으로', () => {
    const props = setup(true);
    const consent = document.getElementById('eConsent') as HTMLInputElement;
    fireEvent.click(consent);
    expect(consent.checked).toBe(true);
    const onYes = props.confirmRelease.mock.calls[0][0] as () => void;
    onYes();
    expect(consent.checked).toBe(false);
    expect((document.getElementById('nt0') as HTMLSelectElement).value).toBe('우편(자택)');
    expect(props.onChange).toHaveBeenLastCalledWith(['우편(자택)', '우편(직장)'], false);
    expect(props.toast).toHaveBeenCalledWith('1개 안내장의 수신 방법을 우편(자택)으로 바꿨습니다.');
  });
});

test('MarketingConsents: 동의 상태·동의일', () => {
  render(<MarketingConsents consents={[['전화', '2024.03.11', true], ['우편', '-', false]]} />);
  expect((screen.getByLabelText('전화') as HTMLInputElement).checked).toBe(true);
  expect(screen.getByText('동의일 2024.03.11')).toBeTruthy();
  expect(screen.getByText('미동의')).toBeTruthy();
});
