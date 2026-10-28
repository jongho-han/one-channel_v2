/* 보험계약대출(LN-02) 맞춤 선택 단계: 신청금액 → 이율 낮은 계약부터 배정 미리보기 */
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Field } from '../../components/form/Field';
import type { FieldSpec } from '../../components/form/fieldSpec';
import { SummaryTiles } from '../../components/widgets';
import { formatWon, toNumber } from '../../core/format';
import { focusFirstError } from '../../form/focus';
import { validationMessage } from '../../form/validation';
import {
  LOAN_MIN_AMOUNT, allocateLoan, formatRate, loanTotals, loanableContracts, monthlyInterest, totalLoanAvailable, type LoanAllocation, type LoanContract,
} from '../../features/loanRules';

export const loanAmountField = (contracts: readonly LoanContract[]): FieldSpec => ({
  id: 'loanAmount', label: '대출 신청금액', type: 'money', min: LOAN_MIN_AMOUNT, max: totalLoanAvailable(contracts), capAtMax: true,   // 대출 가능금액 합계를 넘어 입력 불가
  quick: [1000000, 5000000, 10000000, 'max'],
  help: '대출 가능금액보다 적게 신청하면 이율이 낮은 계약부터 먼저 대출됩니다.',
});

type CardMode = { mode: 'plan'; rank: number; hasRequest: boolean } | { mode: 'result' };

/** 계약 카드: plan(선택 단계 · 배정 미리보기) / result(확인·완료 단계 · 실행 내역) */
function LoanCard({ loan: { contract, available, amount }, card }: { loan: LoanAllocation; card: CardMode }) {
  const rate = contract.loanRate;
  const cardState = card.mode === 'result' || amount ? 'on' : card.hasRequest ? 'unused' : '';
  const facts: [string, string, string?][] = card.mode === 'plan'
    ? [['대출 가능금액', formatWon(available)], ['이번 대출금액', amount ? formatWon(amount) : '-', 'take'], ['예상 월 이자', amount ? formatWon(monthlyInterest(amount, rate)) : '-']]
    : [['대출금액', formatWon(amount), 'take'], ['적용 이율', formatRate(rate)], ['예상 월 이자', formatWon(monthlyInterest(amount, rate))]];
  return (
    <article className={cardState ? `loan-card ${cardState}` : 'loan-card'}>
      <div className="lc-head">
        <div>
          {card.mode === 'plan' && <span className="lc-rank">{card.rank}순위</span>}
          <b>{contract.name}</b>
          <small className="num">증권번호 {contract.no}{contract.loan ? ` · 기존 대출 ${formatWon(contract.loan)}` : ''}</small>
        </div>
        <span className="lc-rate num">{formatRate(rate)}</span>
      </div>
      <dl>{facts.map(([label, value, tone]) => <div key={label}><dt>{label}</dt><dd className={tone ? `num ${tone}` : 'num'}>{value}</dd></div>)}</dl>
    </article>
  );
}

interface LoanPickProps {
  contracts: readonly LoanContract[];
  amount: number;                        // 이전에 입력한 신청금액
  announce: (message: string) => void;
  onNext: (amount: number) => void;
}

export function LoanPick({ contracts, amount: initialAmount, announce, onNext }: LoanPickProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const [amount, setAmount] = useState(initialAmount);
  const [error, setError] = useState('');
  const field = loanAmountField(contracts);
  const plan = allocateLoan(contracts, amount);
  const assigned = plan.reduce((sum, loan) => sum + loan.amount, 0);

  const change = (value: string) => {
    const next = toNumber(value);
    flushSync(() => { setAmount(next); setError(''); });   // 금액을 고치면 이전 오류 문구는 지움
    const totals = loanTotals(contracts, next);
    announce(totals.amount ? `${totals.loans.length}개 계약에 배정, 대출금 합계 ${formatWon(totals.amount)}` : '');
  };

  const next = () => {
    const message = validationMessage(field, amount);
    flushSync(() => setError(message));
    if (message) {
      if (formRef.current) focusFirstError(formRef.current);
      return;
    }
    onNext(amount);
  };

  return (
    <>
      <SummaryTiles tiles={[['전체 대출 가능금액', formatWon(totalLoanAvailable(contracts))], ['대출 가능 계약', `${loanableContracts(contracts).length}건`]]} />
      <div className="card"><h2>대출 신청금액</h2><div className="form" ref={formRef}><Field field={field} values={{ loanAmount: initialAmount }} error={error} onChange={change} /></div></div>
      <div className="card">
        <h2 className="split center">대출 가능 계약<small className="h-note">이율 낮은 순</small></h2>
        <div id="loanPlan">
          <div className="loan-list">{plan.map((loan, index) => <LoanCard key={loan.contract.no} loan={loan} card={{ mode: 'plan', rank: index + 1, hasRequest: amount > 0 }} />)}</div>
          <div className="sumline">대출금 합계 <span className="num">{formatWon(assigned)}</span></div>
        </div>
      </div>
      <div className="navrow">
        <button className="btn lg" data-action="back">취소</button>
        <button className="btn pri lg" id="next" onClick={next}>다음</button>
      </div>
    </>
  );
}

/** 입력 단계 상단: 신청금액과 실행 계약 수 */
export function LoanRequestSummary({ contracts, amount }: { contracts: readonly LoanContract[]; amount: number }) {
  const { loans, amount: total } = loanTotals(contracts, amount);
  return <><b>대출 신청금액 {formatWon(total)}</b>{loans.length}개 계약에서 이율이 낮은 순서로 대출됩니다.</>;
}

/** 확인·완료 단계: 대출 실행 계약 카드 */
export function LoanResult({ contracts, amount, step }: { contracts: readonly LoanContract[]; amount: number; step: 'confirm' | 'done' }) {
  const { loans, amount: total } = loanTotals(contracts, amount);
  return (
    <div className="card">
      <h2 className="split center">{step === 'done' ? '대출 실행 계약' : '대출 실행 예정 계약'}<small className="h-note num">{loans.length}건 · 합계 {formatWon(total)}</small></h2>
      <div className="loan-list">{loans.map(loan => <LoanCard key={loan.contract.no} loan={loan} card={{ mode: 'result' }} />)}</div>
    </div>
  );
}
