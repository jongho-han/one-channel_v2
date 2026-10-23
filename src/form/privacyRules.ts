/* 개인정보변경(MY-01): 현재 정보 가리기 · 변경 입력 검증 (비운 항목은 현재 정보 유지) */
import { EMAIL_PATTERN } from '../core/format';

export interface PrivacyValues {
  mob?: string; mobVerified?: boolean;
  emailLocal?: string; emailDomain?: string; emailCustom?: boolean; emailChecked?: boolean;   // emailCustom: 도메인 직접 입력
  addrH?: string; addrH_zip?: string; addrH_d?: string; telH1?: string; telH2?: string; telH3?: string;
  addrW?: string; addrW_zip?: string; addrW_d?: string; telW1?: string; telW2?: string; telW3?: string;
}
export type PrivacyErrors = Partial<Record<'mob' | 'email' | 'addrH' | 'addrW' | 'telH' | 'telW' | 'form', string>>;

/** 이메일 아이디: 앞 2자리(짧으면 1자리)만 보이게 */
export const maskEmailLocal = (local: string): string => {
  const shown = local.length > 2 ? 2 : 1;
  return local.slice(0, shown) + '*'.repeat(Math.max(local.length - shown, 0));
};

/** 상세주소: 단어마다 **** */
export const maskDetail = (detail: string): string => detail.split(/\s+/).filter(Boolean).map(() => '****').join(' ');

/** 전화번호 세 칸, 가운데는 가림 */
export const telParts = (tel: string): [string, string, string] => {
  const [first = '', , last = ''] = tel.split('-');
  return [first, '****', last];
};

/** 주소 → [기본주소, 상세주소] (첫 쉼표 기준) */
export const splitAddress = (address: string): [string, string] => {
  const at = address.indexOf(', ');
  return at < 0 ? [address, ''] : [address.slice(0, at), address.slice(at + 2)];
};

export const splitEmail = (email: string): [string, string] => {
  const at = email.lastIndexOf('@');
  return [email.slice(0, at), email.slice(at + 1)];
};

export const EMAIL_DOMAIN_MISSING = '이메일 도메인을 입력해 주세요.';

const MOBILE_PATTERN = /^01\d-?\d{3,4}-?\d{4}$/;
const TEL_PATTERNS = [/^\d{2,4}$/, /^\d{3,4}$/, /^\d{4}$/];
const TELS = [['telH', '자택전화'], ['telW', '직장전화']] as const;
const ADDRESSES = [['addrH', '자택'], ['addrW', '직장']] as const;

export function privacyErrors(values: PrivacyValues): PrivacyErrors {
  const errors: PrivacyErrors = {};
  const text = (key: keyof PrivacyValues) => String(values[key] ?? '').trim();

  if (text('mob')) {
    if (!MOBILE_PATTERN.test(text('mob'))) errors.mob = '휴대폰번호 형식을 확인해 주세요. 예: 010-1234-5678';
    else if (!values.mobVerified) errors.mob = '휴대폰 인증을 해 주세요.';
  }
  if (text('emailLocal') || text('emailDomain') || values.emailCustom) {
    if (!text('emailLocal')) errors.email = '이메일 아이디를 입력해 주세요.';
    else if (values.emailCustom && !text('emailDomain')) errors.email = EMAIL_DOMAIN_MISSING;
    else if (!EMAIL_PATTERN.test(`${text('emailLocal')}@${text('emailDomain')}`) || /\s/.test(values.emailLocal ?? '')) errors.email = '이메일 주소 형식을 확인해 주세요.';
    else if (!values.emailChecked) errors.email = '이메일 중복확인을 해 주세요.';
  }
  for (const [key, label] of TELS) {
    const parts = [1, 2, 3].map(n => text(`${key}${n}` as keyof PrivacyValues));
    if (parts.some(Boolean) && !parts.every((part, index) => TEL_PATTERNS[index].test(part))) errors[key] = `${label} 번호를 모두 입력해 주세요.`;
  }
  for (const [key, label] of ADDRESSES) {
    if (text(key) && !text(`${key}_d` as keyof PrivacyValues)) errors[key] = `${label} 상세주소를 입력해 주세요.`;
  }

  const changed = Boolean(values.emailCustom) || (['mob', 'emailLocal', 'emailDomain', 'addrH', 'addrW', 'telH1', 'telH2', 'telH3', 'telW1', 'telW2', 'telW3'] as const).some(key => text(key));
  if (!changed) errors.form = '변경할 내용이 없습니다.';
  return errors;
}
