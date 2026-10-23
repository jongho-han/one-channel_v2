/* 보험료 납입 상태: 마지막 납입이 덮는 기간(월납 1개월 · 선납 N개월 · 연납 12개월)을 기준일이 넘기면 연체 */

/** 마지막 납입: 납입일(YYYY.MM.DD)과 그 납입이 덮는 개월 수. 연납은 cycle '연납' + 12개월 */
export interface LastPayment {
  date: string;
  months: number;
  cycle?: '연납';
}

export type PayStatus = '정상' | '연체';

const pad = (n: number) => String(n).padStart(2, '0');

/** 납입이 덮는 마지막 날: 납입일 + 개월 수 (그 달에 같은 날이 없으면 말일) */
export function paidUntil({ date, months }: LastPayment): string {
  const [year, month, day] = date.split('.').map(Number);
  const target = new Date(year, month - 1 + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return `${target.getFullYear()}.${pad(target.getMonth() + 1)}.${pad(Math.min(day, lastDay))}`;
}

/** 기준일(YYYY.MM.DD)이 납입이 덮는 기간을 넘기면 연체 (같은 날까지는 정상) */
export const payStatus = (last: LastPayment, today: string): PayStatus => (today > paidUntil(last) ? '연체' : '정상');

/** 카드 보조 안내: '월납 · 최종 납입 2026.09.25' / '3개월 선납 · …' / '연납 · …' */
export function payStatusNote(last: LastPayment): string {
  const cycle = last.cycle ?? (last.months === 1 ? '월납' : `${last.months}개월 선납`);
  return `${cycle} · 최종 납입 ${last.date}`;
}
