/* 보험금 청구(PY-01) 안내 단계: 청구사항 안내 · 청구·지급 절차 · 청구 종류 선택 (계약은 고르지 않음) */
import { flushSync } from 'react-dom';
import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { InfoBox } from '../../components/widgets';
import { CLAIM_GUIDE, CLAIM_NOTES, CLAIM_PROCEDURE, CLAIM_TYPES, claimTypeOf } from '../../data/claimGuide';

interface ClaimGuideProps {
  claimType: string;
  onChange: (key: string) => void;
  onNext: () => void;
}

const step = (index: number) => `STEP ${String(index + 1).padStart(2, '0')}`;

export function ClaimGuide({ claimType, onChange, onNext }: ClaimGuideProps) {
  const [selected, setSelected] = useState(claimTypeOf(claimType).key);
  const current = claimTypeOf(selected);
  const choose = (key: typeof selected) => { flushSync(() => setSelected(key)); onChange(key); };

  return (
    <>
      <div className="card">
        <h2>보험금 청구사항 안내</h2>
        <div className="tbl-wrap"><table className="tbl claim-guide">
          <caption className="sr-only">보험금 청구사항 안내</caption>
          <colgroup><col className="label" /><col /></colgroup>
          <tbody>
            {CLAIM_GUIDE.map(([label, lines]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{lines.length > 1 && label !== '보험금 청구 대상'
                  ? <ul className="dots">{lines.map(line => <li key={line}>{line}</li>)}</ul>
                  : lines.map((line, index) => <p key={line} className={index ? 'sub' : undefined}>{line}</p>)}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
        <InfoBox tone="info mt-14" icon="info">
          보험금 청구 구비서류는 「사고보험금 청구서류」를 참고해 주세요.
          <div className="mt-8"><button className="btn sm" data-action="open" data-id="CS-01">사고보험금 청구서류 보기<Icon name="chev" /></button></div>
        </InfoBox>
      </div>

      <div className="card">
        <h2 id="claimProcTitle">보험금 청구 및 지급 절차</h2>
        <ol className="claim-proc" aria-labelledby="claimProcTitle">
          {CLAIM_PROCEDURE.map((name, index) => <li key={name}><small>{step(index)}</small>{name}</li>)}
        </ol>
      </div>

      <div className="card">
        <h2>청구 종류 선택</h2>
        <div className="seg block tabs mb-14" role="group" aria-label="청구 종류 선택">
          {CLAIM_TYPES.map(type => (
            <button key={type.key} className={type.key === selected ? 'on' : undefined} aria-pressed={type.key === selected}
                    data-claim-type={type.key} onClick={() => choose(type.key)}>{type.label}</button>
          ))}
        </div>
        <h3 id="claimTypeTitle" aria-live="polite">{current.label}</h3>
        <p className="sub">{current.desc}</p>
        <ul className="dots note-sm mt-12">{CLAIM_NOTES.map(note => <li key={note}>{note}</li>)}</ul>
      </div>

      <div className="navrow">
        <button className="btn lg" data-action="back">취소</button>
        <button className="btn pri lg" id="next" onClick={onNext}>다음</button>
      </div>
    </>
  );
}
