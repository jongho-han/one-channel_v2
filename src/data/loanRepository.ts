/* 상환할 보험계약대출 (샘플) — l2 는 시연용 연체 대출(이자 미납 → 연체 이자) */
export interface RepayLoan {
  key: string;
  contract: string;
  loanDate: string;
  rate: string;
  balance: number;           // 대출 잔액
  interest: number;          // 경과 이자
  overdueInterest: number;   // 연체 이자 (0 이면 정상)
  overdueNote?: string;      // 연체 사유 안내
}

export const REPAY_LOANS: readonly RepayLoan[] = [
  { key: 'l1', contract: '(무)iM 든든한 종신보험', loanDate: '2025.11.20', rate: '연 4.30%', balance: 3000000, interest: 10750, overdueInterest: 0 },
  { key: 'l2', contract: '(무)iM 튼튼 어린이보험', loanDate: '2025.06.10', rate: '연 4.10%', balance: 1500000, interest: 5130, overdueInterest: 18450,
    overdueNote: '이자 2개월 미납(2026.08.10부터)' },
];

export const repayLoanByKey = (key: string | null | undefined): RepayLoan => REPAY_LOANS.find(loan => loan.key === key) ?? REPAY_LOANS[0];

export const repayLoanStatus = (loan: RepayLoan): '정상' | '연체' => (loan.overdueInterest > 0 ? '연체' : '정상');
