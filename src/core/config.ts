/** 하단 이용 안내 항목: url이 있으면 회사 홈페이지 새 창 링크 */
export interface FooterLink {
  readonly label: string;
  readonly url?: string;
  readonly strong?: boolean;
}

export const APP = {
  version: 'v3.7',
  specVersion: 'v3.7',                 // 기준 메뉴정의서 버전
  today: '2026.10.02',                 // 샘플 데이터 기준일
  storageKeys: { largeText: 'im_big' },
  shortcut: {
    name: 'iM라이프 사이버창구',
    url: 'https://www.imlifeins.co.kr/cyber/main.do',   // 지금 페이지 주소를 알 수 없을 때만 사용
  },
  footerLinks: [
    { label: '개인정보처리방침', url: 'https://www.imlifeins.co.kr/BE/BE_A030_2.do', strong: true },
    { label: '신용정보활용체제', url: 'https://www.imlifeins.co.kr/BE/BE_A032.do', strong: true },
    { label: '고객권리안내',     url: 'https://www.imlifeins.co.kr/BE/BE_A031.do', strong: true },
    { label: '금융소비자보호' },
    { label: '보험사기신고',     url: 'https://www.imlifeins.co.kr/BB/BB_C020.do', strong: true },
    { label: '위법계약해지요구권' },
    { label: '전자민원',         url: 'https://www.imlifeins.co.kr/BB/BB_B010.do', strong: true },
  ] satisfies readonly FooterLink[] as readonly FooterLink[],
  features: {
    hideGuestLoginOnMobile: true,       // v3.0: 모바일 메인에서 로그인 박스 숨김
    compactShortcutBarOnMobile: true,   // v3.0: 모바일 '바로가기 추가' 버튼 축소 · 안내 문구와 한 줄
    hideLifeGuideOnMobile: true,        // v3.5: 모바일 메인에서 '이럴 땐 이렇게' 숨김
  },
} as const;
