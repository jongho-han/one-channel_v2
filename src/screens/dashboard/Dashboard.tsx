/* T1 대시보드 (계약종합현황) */
import { formatWon } from '../../core/format';
import { InfoBox, StatusChip } from '../../components/widgets';
import { contractShortcuts, insuredLabel, paymentProgress, summarizeContracts, type Contract } from './contractSummary';

interface DashboardProps {
  contracts: readonly Contract[];
  today: string;   // 예시 금액 기준일
}

function Tile({ label, value, unit, highlight = false }: { label: string; value: number; unit: string; highlight?: boolean }) {
  return <div className={highlight ? 'tile hl' : 'tile'}><dt>{label}</dt><dd className="num">{value.toLocaleString()}<small>{unit}</small></dd></div>;
}

function Amount({ label, children }: { label: string; children: string }) {
  return <div><dt>{label}</dt><dd className="num">{children}</dd></div>;
}

function ContractCard({ contract }: { contract: Contract }) {
  const progress = paymentProgress(contract);
  return (
    <article className="ct">
      <div className="ct-head">
        <div><b>{contract.name}</b><small className="num">증권번호 {contract.no} · 피보험자 {insuredLabel(contract)}</small></div>
        <div className="badges">
          {contract.insuredRelation && <span className="bdg">타인 피보험자</span>}
          <StatusChip status={contract.status} />
        </div>
      </div>
      <dl>
        <Amount label="월 보험료">{formatWon(contract.premium)}</Amount>
        <Amount label="예상 해지환급금">{contract.surrender ? formatWon(contract.surrender) : '-'}</Amount>
        <Amount label="대출 잔액">{contract.loan ? formatWon(contract.loan) : '없음'}</Amount>
      </dl>
      {progress !== null
        ? <div>
            <div className="bar-l"><span>납입 {contract.paidCount}/{contract.totalCount}회</span><span>{progress}%</span></div>
            <div className="bar"><i style={{ width: `${progress}%` }} /></div>
          </div>
        : <div className="bar-l"><span>갱신형 · 다음 갱신 2026.12.31</span></div>}
      {contract.status === '납입유예' && <InfoBox tone="warn compact" icon="alert">납입유예 중입니다. 월대체보험료가 적립금에서 차감됩니다.</InfoBox>}
      <div className="acts">
        {contractShortcuts(contract).map(([label, id]) => (
          <button key={id} className="btn sm" data-action="open" data-id={id} data-variable={contract.isVariable ? contract.no : undefined} data-contract={id === 'CT-02' ? contract.no : undefined}>{label}</button>
        ))}
      </div>
    </article>
  );
}

export function Dashboard({ contracts, today }: DashboardProps) {
  const summary = summarizeContracts(contracts);
  return (
    <>
      <dl className="tiles">
        <Tile label="보유계약" value={summary.count} unit="건" highlight />
        <Tile label="월 보험료 합계" value={summary.monthlyPremium} unit="원" />
        <Tile label="예상 해지환급금 합계" value={summary.totalSurrender} unit="원" />
        <Tile label="보험계약대출 잔액" value={summary.totalLoan} unit="원" />
      </dl>
      <p className="footnote">예상 해지환급금은 {today} 기준 예시 금액이며 실제 지급액과 다를 수 있습니다.</p>
      <div className="ct-list">{contracts.map(contract => <ContractCard key={contract.no} contract={contract} />)}</div>
    </>
  );
}
