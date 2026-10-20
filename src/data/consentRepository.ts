/* 안내장 수신설정 · 마케팅 동의 (샘플 고객의 현재 상태) */
/** [안내장, 구분(법정·선택), 현재 수신 방법] */
export type NoticeSetting = readonly [name: string, type: string, method: string];
export const NOTICE_SETTINGS: readonly NoticeSetting[] = [['계약사항 안내', '법정', '모바일'], ['변액 운용보고서', '법정', '이메일'], ['보험료 납입 안내', '선택', '모바일'], ['만기·연금 개시 안내', '법정', '우편(자택)'], ['보험계약대출 이자 안내', '선택', '모바일'], ['배당금 안내', '선택', '우편(직장)']];
export const NOTICE_E_CONSENT_DEFAULT = true;   // 샘플 고객: 동의 상태
/** [동의 항목, 동의일, 동의 여부] */
export type MarketingConsent = readonly [name: string, date: string, agreed: boolean];
export const MARKETING_CONSENTS: readonly MarketingConsent[] = [['상품·서비스 안내(전화)', '2024.03.11', true], ['상품·서비스 안내(문자·알림톡)', '2024.03.11', true], ['상품·서비스 안내(이메일)', '-', false], ['상품·서비스 안내(우편)', '-', false], ['제휴사 혜택 정보 제공', '-', false]];
