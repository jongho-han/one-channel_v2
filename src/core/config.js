export const APP = {
  version: 'v3.7',
  specVersion: 'v3.7',                 // 기준 메뉴정의서 버전
  today: '2026.10.02',                 // 샘플 데이터 기준일
  storageKeys: { largeText: 'im_big' },
  shortcut: {
    name: 'iM라이프 사이버창구',
    url: 'https://www.imlifeins.co.kr/cyber/main.do',   // 운영 시 실제 메인 URL
  },
  /** 하단 이용 안내 [이름, 회사 홈페이지 URL(없으면 링크 없음), 강조 여부] */
  footerLinks: [
    ['개인정보처리방침',   'https://www.imlifeins.co.kr/BE/BE_A030_2.do', true],
    ['신용정보활용체제',   'https://www.imlifeins.co.kr/BE/BE_A032.do', true],
    ['고객권리안내',       'https://www.imlifeins.co.kr/BE/BE_A031.do', true],
    ['금융소비자보호'],
    ['보험사기신고',       'https://www.imlifeins.co.kr/BB/BB_C020.do', true],
    ['위법계약해지요구권'],
    ['전자민원',           'https://www.imlifeins.co.kr/BB/BB_B010.do', true],
  ],
  features: {
    hideGuestLoginOnMobile: true,       // v3.0: 모바일 메인에서 로그인 박스 숨김
    compactShortcutBarOnMobile: true,   // v3.0: 모바일 '바로가기 추가' 버튼 축소 · 안내 문구와 한 줄
    hideLifeGuideOnMobile: true,        // v3.5: 모바일 메인에서 '이럴 땐 이렇게' 숨김
  },
};
