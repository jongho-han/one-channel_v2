/* 펀드변경(CH-01) 화면 부품: 편입비율 편집 · 적합성진단 문항 · 진단 결과 · 변경 전후 비교 */
import { useState } from 'react';
import { flushSync } from 'react-dom';
import { InfoBox, SummaryTiles } from '../../components/widgets';
import { formatWon, nextDay } from '../../core/format';
import type { SuitabilityQuestion } from '../../data/fundRepository';
import type { VariableContract } from '../../features/variableContract';
import {
  REBALANCE_BEFORE, gradeLabel, investableRange, portfolioGrade, ratioTotal, riskSummary, totalLabel, type Fund, type Suitability,
} from './fundRules';

export type { VariableContract };
export type { SuitabilityQuestion };

/** 변액 계약 선택 탭 (CT-03 변액보험 조회와 같은 선택을 공유) */
export function VariableContractTabs({ contracts, selected }: { contracts: readonly VariableContract[]; selected: VariableContract }) {
  return (
    <div className="seg block mb-14" role="group" aria-label="변액 계약 선택">
      {contracts.map(contract => (
        <button key={contract.no} className={contract.no === selected.no ? 'on' : undefined} aria-pressed={contract.no === selected.no}
                data-action="variable-tab" data-no={contract.no}>{contract.name.replace('(무)iM ', '')}</button>
      ))}
    </div>
  );
}

interface FundEditProps {
  contracts: readonly VariableContract[];
  contract: VariableContract;
  ratios: readonly number[];
  rebalance: boolean;
  suitability: Suitability;
  onRatiosChange: (ratios: number[]) => void;
  onRebalanceChange: (rebalance: boolean) => void;
}

function RiskLine({ funds, ratios, profile }: { funds: readonly Fund[]; ratios: readonly number[]; profile: string }) {
  const risk = riskSummary(funds, ratios, profile);
  if (!risk) return <div className="risk-line" id="riskLine" aria-live="polite" />;
  return (
    <div className={`risk-line ${risk.fits ? 'ok' : 'over'}`} id="riskLine" aria-live="polite">
      변경 후 포트폴리오 위험 <b>{gradeLabel(risk.grade)}</b> <span className="num">(가중평균 {risk.average})</span> · {risk.fits
        ? `현재 투자성향(${profile}) 범위 안입니다.`
        : `현재 투자성향(${profile})보다 위험합니다. 변경하려면 적합성진단이 필요합니다.`}
    </div>
  );
}

/** 편입비율 편집: 합계·위험등급을 입력 즉시 다시 계산 */
export function FundEdit({ contracts, contract, ratios: initialRatios, rebalance, suitability, onRatiosChange, onRebalanceChange }: FundEditProps) {
  const [ratios, setRatios] = useState<readonly number[]>(initialRatios);
  const funds = contract.variable.funds;
  const total = totalLabel(ratioTotal(ratios));

  const changeRatio = (index: number, value: string) => {
    const next = ratios.map((ratio, i) => (i === index ? Number(value) || 0 : ratio));
    flushSync(() => setRatios(next));
    onRatiosChange(next);
  };

  return (
    <>
      <VariableContractTabs contracts={contracts} selected={contract} />
      <SummaryTiles tiles={[['적립금', formatWon(contract.variable.reserve)], ['올해 남은 변경', `${contract.variable.fundChangesLeft}회`], ['투자성향', suitability.profile]]} />
      <p className="suit-meta">최근 적합성진단 <b className="num">{suitability.diagnosedAt}</b> · 투자 가능 범위 <b>{investableRange(suitability.profile)}</b></p>
      <div className="card"><h2>펀드 편입비율 변경</h2>
        <div className="tbl-wrap plain fundtbl"><table className="tbl min-520">
          <thead><tr><th>펀드</th><th>위험등급</th><th className="r">1년 수익률</th><th className="r">현재</th><th className="r">변경 후</th></tr></thead>
          <tbody>
            {funds.map(([name, ratio, yieldRate, risk], index) => (
              <tr key={name}><td>{name}</td><td className="sub">{risk}</td><td className="r num">{yieldRate}</td><td className="r num">{ratio}%</td>
                <td className="r"><input className="inp num" id={`fd${index}`} data-fund="" inputMode="numeric" defaultValue={initialRatios[index]}
                                         aria-label={`${name} 변경 후 비율`} onInput={event => changeRatio(index, event.currentTarget.value)} /> %</td></tr>
            ))}
          </tbody>
        </table></div>
        <div className="sumline" aria-live="polite">합계 <span className={`num ${total.valid ? 'is-valid' : 'is-invalid'}`} id="fsum">{total.text}</span></div>
        <RiskLine funds={funds} ratios={ratios} profile={suitability.profile} />
        <div className="toggle-row divided">
          <div><b>자동재배분</b><small>3개월마다 지정한 비율로 자동 조정합니다.</small></div>
          <label className="tg"><input type="checkbox" id="rebal" aria-label="자동재배분" defaultChecked={rebalance} onChange={event => onRebalanceChange(event.currentTarget.checked)} /><span /></label>
        </div>
      </div>
      <InfoBox tone="warn mt-14" icon="alert">변액보험은 투자 실적에 따라 원금 손실이 발생할 수 있습니다. 마지막 적합성진단 후 3년이 지났거나, 변경 후 편입비율이 투자성향보다 위험하면 적합성진단을 먼저 진행합니다.</InfoBox>
      <div id="frm" />
    </>
  );
}


interface SuitabilityQuestionsProps {
  questions: readonly SuitabilityQuestion[];
  answers: Readonly<Record<number, number>>;   // 문항 → 고른 보기 순번
  missing: readonly number[];                  // 답하지 않은 문항 (제출 시)
  onAnswer: (question: number, option: number) => void;
}

export function SuitabilityQuestions({ questions, answers, missing, onAnswer }: SuitabilityQuestionsProps) {
  const [unanswered, setUnanswered] = useState<readonly number[]>(missing);
  const answer = (question: number, option: number) => {
    flushSync(() => setUnanswered(list => list.filter(index => index !== question)));
    onAnswer(question, option);
  };
  return (
    <>
      <div className="card">
        <h2 id="phaseTitle" tabIndex={-1}>투자자 적합성진단</h2>
        <p className="sub-desc">모든 문항에 답하면 투자성향이 정해집니다. 진단 결과는 오늘부터 3년간 적용됩니다.</p>
        <ol className="suit-qs">
          {questions.map(([question, options], qIndex) => (
            <li className="suit-q" id={`sq${qIndex}`} key={question}>
              <fieldset aria-describedby={`sqErr${qIndex}`}>
                <legend><span className="num">{qIndex + 1}.</span> {question}</legend>
                <div className="radios col">
                  {options.map(([text, score], oIndex) => (
                    <label key={text}><input type="radio" name={`sq${qIndex}`} value={score} data-q={qIndex} defaultChecked={answers[qIndex] === oIndex} data-o={oIndex}
                                             onChange={() => answer(qIndex, oIndex)} />{text}</label>
                  ))}
                </div>
                <p className="err" id={`sqErr${qIndex}`}>{unanswered.includes(qIndex) ? '답을 선택해 주세요.' : ''}</p>
              </fieldset>
            </li>
          ))}
        </ol>
      </div>
      <div className="navrow">
        <button className="btn lg" data-action="suit-edit">이전</button>
        <button className="btn pri lg" data-action="suit-submit">진단 결과 보기</button>
      </div>
    </>
  );
}

export interface SuitabilityResultData {
  ok: boolean;
  profile: string;
  score: number;
  grade: number;
}

export function SuitabilityResult({ result, today }: { result: SuitabilityResultData; today: string }) {
  return (
    <>
      <div className="card">
        <h2 id="phaseTitle" tabIndex={-1}>적합성진단 결과</h2>
        <dl className="kv">
          <dt>진단일</dt><dd className="num">{today}</dd>
          <dt>투자성향</dt><dd><b>{result.profile}</b> ({result.score}점)</dd>
          <dt>투자 가능 범위</dt><dd>{investableRange(result.profile)}</dd>
          <dt>변경 후 포트폴리오</dt><dd>{gradeLabel(result.grade)}</dd>
        </dl>
      </div>
      <div className="mt-14">
        {result.ok
          ? <InfoBox tone="ok" icon="check"><b>변경 후 편입비율로 변경할 수 있습니다</b>진단 결과 투자성향({result.profile})으로 {gradeLabel(result.grade)} 포트폴리오에 투자할 수 있습니다. 변경 전후 내용을 확인한 뒤 인증하면 변경됩니다.</InfoBox>
          : <InfoBox tone="warn" icon="alert"><b>변경 후 편입비율로 변경할 수 없습니다</b>진단 결과 투자성향({result.profile})으로는 {gradeLabel(result.grade)} 포트폴리오에 투자할 수 없습니다. 오늘은 적합성진단을 다시 할 수 없으며, <b className="inl">{nextDay(today)}(익일) 이후 다시 진행</b>해 주세요.</InfoBox>}
      </div>
      <div className="navrow">
        {result.ok
          ? <><button className="btn lg" data-action="suit-edit">비율 다시 보기</button><button className="btn pri lg" data-action="fund-compare">변경 내용 확인</button></>
          : <><button className="btn lg" data-action="nav" data-page="home">홈으로</button><button className="btn pri lg" data-action="suit-edit">편입비율 다시 조정</button></>}
      </div>
    </>
  );
}

const FUND_BAR_COLORS = ['#00754A', '#2558C4', '#8F5800', '#6B7A8C', '#7A3FB0', '#B0413E'];

/** 편입비율 막대 (시각 보조용 · 같은 내용은 표로 제공) */
function AllocationBar({ ratios }: { ratios: readonly number[] }) {
  return (
    <div className="alloc-bar" aria-hidden="true">
      {ratios.map((ratio, index) => (ratio ? <span key={index} style={{ width: `${ratio}%`, background: FUND_BAR_COLORS[index] }} /> : null))}
    </div>
  );
}

function ChangeBadge({ delta }: { delta: number }) {
  if (!delta) return <><span className="delta same" aria-hidden="true">–</span><span className="sr-only">변동 없음</span></>;
  return delta > 0
    ? <span className="delta up">▲ {delta}%p<span className="sr-only"> 증가</span></span>
    : <span className="delta down">▼ {-delta}%p<span className="sr-only"> 감소</span></span>;
}

const onOff = (value: boolean) => (value ? '신청' : '미신청');

/** 변경 전후 비교 → 최종 인증 */
export function FundCompare({ contract, after, rebalance, suitability }: { contract: VariableContract; after: readonly number[]; rebalance: boolean; suitability: Suitability }) {
  const funds = contract.variable.funds;
  const before = funds.map(([, ratio]) => ratio);
  const rows = funds.map(([name, , , risk], index) => ({ name, risk, before: before[index], after: after[index], delta: after[index] - before[index] }))
    .filter(row => row.before || row.after);
  const left = contract.variable.fundChangesLeft;

  return (
    <>
      <div className="card">
        <h2 id="phaseTitle" tabIndex={-1}>변경 전후 비교</h2>
        <p className="sub-desc">아래 내용으로 펀드 편입비율을 변경합니다. 확인 후 인증해 주세요.</p>
        <div className="alloc-compare">
          <div className="alloc-row"><span className="alloc-lb">변경 전</span><AllocationBar ratios={before} /></div>
          <div className="alloc-row"><span className="alloc-lb">변경 후</span><AllocationBar ratios={after} /></div>
          <ul className="alloc-legend" aria-hidden="true">
            {funds.map(([name], index) => (before[index] || after[index] ? <li key={name}><i style={{ background: FUND_BAR_COLORS[index] }} />{name}</li> : null))}
          </ul>
        </div>
        <div className="tbl-wrap plain"><table className="tbl cmp-tbl">
          <caption className="sr-only">펀드별 변경 전후 편입비율</caption>
          <thead><tr><th scope="col">펀드 (위험등급)</th><th scope="col" className="r">변경 전</th><th scope="col" className="r">변경 후</th><th scope="col" className="r dcol">증감</th></tr></thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.name} className={row.delta ? 'changed' : ''}><th scope="row">{row.name}<small>{row.risk}</small></th>
                <td className="r num">{row.before}%</td><td className="r num"><b>{row.after}%</b><span className="delta-inline"><ChangeBadge delta={row.delta} /></span></td>
                <td className="r dcol"><ChangeBadge delta={row.delta} /></td></tr>
            ))}
          </tbody>
          <tfoot><tr><th scope="row">합계</th><td className="r num">100%</td><td className="r num"><b>100%</b></td><td className="dcol" /></tr></tfoot>
        </table></div>
      </div>
      <div className="card">
        <h2>함께 바뀌는 내용</h2>
        <dl className="kv cmp-kv">
          <dt>포트폴리오 위험등급</dt><dd>{gradeLabel(portfolioGrade(funds, before).grade)} → <b>{gradeLabel(portfolioGrade(funds, after).grade)}</b></dd>
          <dt>투자성향</dt><dd>{suitability.profile} <span className="sub">(진단일 {suitability.diagnosedAt} · {investableRange(suitability.profile)})</span></dd>
          <dt>자동재배분</dt><dd>{onOff(REBALANCE_BEFORE)} → <b>{onOff(rebalance)}</b></dd>
          <dt>대상 계약</dt><dd>{contract.name}</dd>
          <dt>올해 남은 변경 횟수</dt><dd className="num">{left}회 → <b>{left - 1}회</b></dd>
          <dt>적용 기준가</dt><dd>접수일 다음 영업일 기준가</dd>
        </dl>
      </div>
      <InfoBox tone="warn mt-14" icon="alert">변액보험은 투자 실적에 따라 원금 손실이 발생할 수 있으며, 변경 후 수익률은 보장되지 않습니다.</InfoBox>
      <div className="navrow">
        <button className="btn lg" data-action="suit-edit">이전</button>
        <button className="btn pri lg" data-action="fund-sign">인증 후 변경</button>
      </div>
    </>
  );
}
