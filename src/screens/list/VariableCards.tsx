/* 변액보험 조회(CT-03): 변액 계약 카드 목록 → 고른 계약의 적립금·펀드 목록 (상세 위 계약 이름·목록 버튼) */
import { Icon } from '../../components/Icon';
import { StatusChip } from '../../components/widgets';
import { formatWon } from '../../core/format';
import { cumulativeReturn, type VariableContract } from '../../features/variableContract';
import { insuredLabel } from '../dashboard/contractSummary';

export type VariableCardInfo = VariableContract & { status: string; insured: string; insuredRelation?: string };

const contractMeta = (contract: VariableCardInfo) => `증권번호 ${contract.no} · 피보험자 ${insuredLabel(contract)}`;

function VariableCard({ contract }: { contract: VariableCardInfo }) {
  const { reserve, principal, funds } = contract.variable;
  const held = funds.filter(([, ratio]) => ratio);
  return (
    <article className="ct">
      <div className="ct-head">
        <div><h2>{contract.name}</h2><small className="num">{contractMeta(contract)}</small></div>
        <div className="badges"><StatusChip status={contract.status} /></div>
      </div>
      <dl>
        <div><dt>적립금</dt><dd className="num">{formatWon(reserve)}</dd></div>
        <div><dt>누적 수익률</dt><dd className="num">{cumulativeReturn(reserve, principal)}</dd></div>
        <div><dt>납입 원금</dt><dd className="num">{formatWon(principal)}</dd></div>
      </dl>
      <div className="bar-l"><span>편입 펀드 {held.length}개 · {held.map(([name, ratio]) => `${name} ${ratio}%`).join(' · ')}</span></div>
      <div className="acts">
        <button className="btn sm pri" data-action="variable-open" data-no={contract.no}>상세 보기<span className="sr-only"> {contract.name}</span></button>
      </div>
    </article>
  );
}

/** 변액보험 조회 첫 화면: 변액 계약 카드 (계약조회·계약종합현황과 같은 카드 형식) */
export function VariableCards({ contracts }: { contracts: readonly VariableCardInfo[] }) {
  return (
    <>
      <p className="footnote">조회할 변액 계약을 고르면 적립금 · 펀드별 편입비율과 수익률을 볼 수 있습니다.</p>
      <div className="ct-list">{contracts.map(contract => <VariableCard key={contract.no} contract={contract} />)}</div>
    </>
  );
}

/** 상세 위: 카드 목록으로 돌아가기 + 고른 계약 이름 (상세를 열면 초점) */
export function VariableDetailTop({ contract }: { contract: VariableCardInfo }) {
  return (
    <>
      <button className="btn sm mb-14" data-action="variable-list"><Icon name="back" />계약 목록</button>
      <div className="card mb-14">
        <h2 className="split" id="contractTitle">{contract.name} <StatusChip status={contract.status} /></h2>
        <p className="note-sm">{contractMeta(contract)}</p>
      </div>
    </>
  );
}
