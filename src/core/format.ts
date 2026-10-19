export const formatWon  = <T,>(value: number | T): string | T => (typeof value === 'number' ? value.toLocaleString('ko-KR') + '원' : value);
export const toNumber   = (text: unknown): number => Number(String(text).replace(/[^\d]/g, '')) || 0;
export const maskPhone  = (phone: string): string => phone.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3');
export const clockTime  = (): string => new Date().toTimeString().slice(0, 5);
export const receiptNo  = (prefix: string): string => `${prefix}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
export const PHONE_PATTERN = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;
export const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const formatClock = (seconds: number): string => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export const randomDigits = (length: number): string => Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

/** 'YYYY.MM.DD' 형식 날짜 */
export type Ymd = string;

export const parseYmd = (ymd: Ymd): Date => { const [y, m, d] = ymd.split('.').map(Number); return new Date(y, m - 1, d); };
const formatYmd = (date: Date): Ymd => `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
export const nextDay = (ymd: Ymd): Ymd => { const date = parseYmd(ymd); date.setDate(date.getDate() + 1); return formatYmd(date); };

/** 받침에 따라 '을/를' 붙이기: '나이' → '나이를', '계약' → '계약을' */
export function withObjectParticle(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xAC00;
  if (code < 0 || code > 11171) return `${word}을(를)`;
  return word + (code % 28 ? '을' : '를');
}
