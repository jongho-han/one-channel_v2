/* 보험기간/연금개시연도 변경(CH-05) 맞춤 선택 단계: 연금 계약 카드를 라디오로 선택 */
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { focusElement } from '../../core/dom.js';
import { formatWon } from '../../core/format';
import { insuredLabel } from '../dashboard/contractSummary';

export interface AnnuityContract {
  no: string;
  name: string;
  insured: string;
  insuredRelation?: string;
  annuityAge?: number;
  annuityDate?: string;
  paidCount: number;
  totalCount: number | string;
  payEnd: string;
  surrender: number;
}

interface AnnuityPickProps {
  label: string;
  contracts: readonly AnnuityContract[];
  picked: string | null;
  onPick: (contractNo: string) => void;
  onNext: () => void;
}

export function AnnuityPick({ label, contracts, picked: initialPicked, onPick, onNext }: AnnuityPickProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState(initialPicked);
  const [error, setError] = useState('');

  const pick = (no: string) => {
    flushSync(() => { setPicked(no); setError(''); });
    onPick(no);
  };
  const next = () => {
    if (picked) return onNext();
    flushSync(() => setError('연금개시 나이를 바꿀 계약을 선택해 주세요.'));
    focusElement(listRef.current?.querySelector('input[name="annuityPick"]') ?? null);
  };

  return (
    <>
      <div className="card">
        <h2 id="pickTitle">{label}</h2>
        <p className="sub-desc">연금이 아직 개시되지 않은 계약만 보여 드립니다.</p>
        <div className="loan-list" role="radiogroup" aria-labelledby="pickTitle" aria-describedby="pickErr" ref={listRef}>
          {contracts.map(contract => {
            const id = `ap-${contract.no}`;
            const isOn = picked === contract.no;
            return (
              <label key={contract.no} className={isOn ? 'loan-card annuity-card on' : 'loan-card annuity-card'} htmlFor={id}>
                <div className="lc-head">
                  <input type="radio" className="lc-radio" name="annuityPick" id={id} value={contract.no} defaultChecked={isOn} onChange={() => pick(contract.no)} />
                  <span className="lc-name"><b>{contract.name}</b><small className="num">증권번호 {contract.no} · 피보험자 {insuredLabel(contract)}</small></span>
                </div>
                <dl>
                  <div><dt>현재 연금개시</dt><dd className="num">{contract.annuityAge}세 ({contract.annuityDate})</dd></div>
                  <div><dt>납입 현황</dt><dd className="num">{contract.paidCount}/{contract.totalCount}회 ({contract.payEnd} 완료)</dd></div>
                  <div><dt>적립금(해지환급금)</dt><dd className="num">{formatWon(contract.surrender)}</dd></div>
                </dl>
              </label>
            );
          })}
        </div>
        <p className="err" id="pickErr" role="alert">{error}</p>
      </div>
      <div className="navrow">
        <button className="btn lg" data-action="back">취소</button>
        <button className="btn pri lg" id="next" onClick={next}>다음</button>
      </div>
    </>
  );
}
