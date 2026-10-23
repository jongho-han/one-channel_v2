/* 개인정보변경(MY-01): 현재 정보 가리기 · 변경 입력 검증 */
import { maskDetail, maskEmailLocal, privacyErrors, splitAddress, splitEmail, telParts } from '../../../src/form/privacyRules';

test('가리기: 이메일 아이디 앞 2자리만, 상세주소 단어마다 ****, 전화 가운데 ****', () => {
  expect(maskEmailLocal('gildong.hong')).toBe('gi**********');
  expect(maskEmailLocal('me')).toBe('m*');
  expect(maskDetail('101동 1203호')).toBe('**** ****');
  expect(maskDetail('8층')).toBe('****');
  expect(maskDetail('')).toBe('');
  expect(telParts('02-123-4567')).toEqual(['02', '****', '4567']);
  expect(telParts('053-740-0000')).toEqual(['053', '****', '0000']);
});

test('나누기: 주소(기본·상세) · 이메일(아이디·도메인)', () => {
  expect(splitAddress('서울특별시 중구 세종대로 110, 101동 1203호')).toEqual(['서울특별시 중구 세종대로 110', '101동 1203호']);
  expect(splitAddress('세종대로 110')).toEqual(['세종대로 110', '']);
  expect(splitEmail('gildong.hong@example.com')).toEqual(['gildong.hong', 'example.com']);
});

describe('privacyErrors: 입력한 항목만 검사 (비우면 현재 정보 유지)', () => {
  test('아무것도 바꾸지 않으면 변경할 내용 없음', () => {
    expect(privacyErrors({})).toEqual({ form: '변경할 내용이 없습니다.' });
  });
  test('휴대폰: 형식 → 본인 인증', () => {
    expect(privacyErrors({ mob: '0101234' }).mob).toBe('휴대폰번호 형식을 확인해 주세요. 예: 010-1234-5678');
    expect(privacyErrors({ mob: '010-9876-5432' }).mob).toBe('휴대폰 인증을 해 주세요.');
    expect(privacyErrors({ mob: '010-9876-5432', mobVerified: true })).toEqual({});
  });
  test('이메일: 형식 → 중복확인', () => {
    expect(privacyErrors({ emailLocal: 'a b', emailDomain: 'gmail.com' }).email).toBe('이메일 주소 형식을 확인해 주세요.');
    expect(privacyErrors({ emailLocal: 'new.mail', emailDomain: 'gmail.com' }).email).toBe('이메일 중복확인을 해 주세요.');
    expect(privacyErrors({ emailLocal: 'new.mail', emailDomain: 'gmail.com', emailChecked: true })).toEqual({});
    expect(privacyErrors({ emailDomain: 'gmail.com' }).email).toBe('이메일 아이디를 입력해 주세요.');   // 도메인만 바꾸면 아이디도 입력
    expect(privacyErrors({ emailLocal: 'new.mail', emailCustom: true, emailDomain: '' }).email).toBe('이메일 도메인을 입력해 주세요.');
    expect(privacyErrors({ emailLocal: 'new.mail', emailCustom: true, emailDomain: 'corp.co.kr', emailChecked: true })).toEqual({});
  });
  test('전화: 세 칸 모두 숫자', () => {
    expect(privacyErrors({ telH1: '02', telH2: '987' }).telH).toBe('자택전화 번호를 모두 입력해 주세요.');
    expect(privacyErrors({ telW1: '02', telW2: '98a7', telW3: '6543' }).telW).toBe('직장전화 번호를 모두 입력해 주세요.');
    expect(privacyErrors({ telH1: '02', telH2: '987', telH3: '6543' })).toEqual({});
  });
  test('주소: 검색으로 바꾼 주소는 상세주소 필수', () => {
    expect(privacyErrors({ addrH: '서울 중구 남대문로 125', addrH_zip: '04521' }).addrH).toBe('자택 상세주소를 입력해 주세요.');
    expect(privacyErrors({ addrH: '서울 중구 남대문로 125', addrH_zip: '04521', addrH_d: '3층' })).toEqual({});
  });
});
