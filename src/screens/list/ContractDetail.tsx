/* 계약조회(CT-02): 보유계약 카드 목록 → 고른 계약의 기본정보 + 보장내용 + 계약관계자·납입정보 + 약관·안내장 */
import { Icon } from '../../components/Icon';
import { LinkButtons, StatusChip } from '../../components/widgets';
import { formatWon } from '../../core/format';
import { insuredLabel, paymentProgress } from '../dashboard/contractSummary';
import type { ContractDocument } from '../../data/contractDocumentRepository';

export interface ContractInfo {
  no: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  payEnd: string;
  coverage: readonly (readonly [type: string, description: string, amount: string])[];
  insured: string;
  insuredRelation?: string;
  beneficiary: string;
  premium: number;
  paidCount: number;
  totalCount: number | string;
  account: string;
  debitDay: string;
}


function ContractDocumentsCard({ contract, documents }: { contract: ContractInfo; documents: readonly ContractDocument[] }) {
  return (
    <div className="card">
      <h2>약관 · 안내장</h2>
      <div className="tbl-wrap"><table className="tbl min-420">
        <caption className="sr-only">{contract.name} 약관·안내장 목록</caption>
        <thead><tr><th>구분</th><th>서류명</th><th>기준일</th><th>내려받기</th></tr></thead>
        <tbody>{documents.map(doc => (
          <tr key={doc.id}>
            <td>{doc.kind}</td><td>{doc.title}</td><td className="num">{doc.date}</td>
            <td><button className="btn sm" data-action="download-contract-doc" data-no={contract.no} data-doc={doc.id}><Icon name="doc" />PDF<span className="sr-only"> {doc.title} 내려받기</span></button></td>
          </tr>
        ))}</tbody>
      </table></div>
      <p className="note-sm">약관과 보험상품안내장은 가입 당시 기준입니다.</p>
    </div>
  );
}

function ContractCard({ contract, index }: { contract: ContractInfo; index: number }) {
  const progress = paymentProgress(contract);
  return (
    <article className="ct">
      <div className="ct-head">
        <div><h2>{contract.name}</h2><small className="num">증권번호 {contract.no} · 피보험자 {insuredLabel(contract)}</small></div>
        <div className="badges"><StatusChip status={contract.status} /></div>
      </div>
      <dl>
        <div><dt>월 보험료</dt><dd className="num">{formatWon(contract.premium)}</dd></div>
        <div><dt>계약일</dt><dd className="num">{contract.startDate}</dd></div>
        <div><dt>보험기간</dt><dd>{contract.endDate}</dd></div>
      </dl>
      {progress !== null
        ? <div>
            <div className="bar-l"><span>납입 {contract.paidCount}/{contract.totalCount}회</span><span>{progress}%</span></div>
            <div className="bar"><i style={{ width: `${progress}%` }} /></div>
          </div>
        : <div className="bar-l"><span>갱신형</span></div>}
      <div className="acts">
        <button className="btn sm pri" data-action="contract-open" data-index={index}>상세 보기<span className="sr-only"> {contract.name}</span></button>
      </div>
    </article>
  );
}

/** 계약조회 첫 화면: 보유계약 카드 (계약종합현황과 같은 카드 형식) */
export function ContractCards({ contracts }: { contracts: readonly ContractInfo[] }) {
  return (
    <>
      <p className="footnote">조회할 계약을 고르면 보장내용 · 계약관계자 · 납입정보 · 약관을 볼 수 있습니다.</p>
      <div className="ct-list">{contracts.map((contract, index) => <ContractCard key={contract.no} contract={contract} index={index} />)}</div>
    </>
  );
}

interface ContractDetailProps {
  contract: ContractInfo;
  userName: string;
  documents: readonly ContractDocument[];
}

export function ContractDetail({ contract, userName, documents }: ContractDetailProps) {
  return (
    <>
      <button className="btn sm mb-14" data-action="contract-list"><Icon name="back" />계약 목록</button>
      <div className="card">
        <h2 className="split" id="contractTitle">{contract.name} <StatusChip status={contract.status} /></h2>        <dl className="kv">
          <dt>증권번호</dt><dd className="num">{contract.no}</dd>
          <dt>계약일</dt><dd className="num">{contract.startDate}</dd>
          <dt>보험기간</dt><dd>{contract.endDate}</dd>
          <dt>납입기간</dt><dd>{contract.payEnd === '갱신형' ? '갱신형' : `${contract.payEnd}까지`}</dd>
        </dl>
      </div>
      <div className="card">
        <h2>보장내용</h2>
        <div className="tbl-wrap"><table className="tbl min-420">
          <thead><tr><th>구분</th><th>보장</th><th>가입금액</th></tr></thead>
          <tbody>{contract.coverage.map(([type, description, amount]) => <tr key={type}><td>{type}</td><td>{description}</td><td className="r num">{amount}</td></tr>)}</tbody>
        </table></div>
      </div>
      <div className="card">
        <h2>계약관계자 · 납입정보</h2>
        <dl className="kv">
          <dt>계약자</dt><dd>{userName}</dd>
          <dt>피보험자</dt><dd>{insuredLabel(contract)}</dd>
          <dt>수익자</dt><dd>{contract.beneficiary}</dd>
          <dt>월 보험료</dt><dd className="num">{formatWon(contract.premium)}</dd>
          <dt>납입 회차</dt><dd className="num">{contract.paidCount}회 / {contract.totalCount}{typeof contract.totalCount === 'number' ? '회' : ''}</dd>
          <dt>자동이체</dt><dd>{contract.account} · 매월 {contract.debitDay}</dd>
        </dl>
        <LinkButtons links={[['계약관계자 변경', 'CH-10'], ['자동이체 변경', 'PM-02'], ['보험증권 재발급', 'CF-03']]} spacing="mt-16" primaryIndex={2} />
      </div>
      <ContractDocumentsCard contract={contract} documents={documents} />
    </>
  );
}
