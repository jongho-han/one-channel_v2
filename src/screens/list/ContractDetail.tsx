/* 계약조회(CT-02): 계약 탭 + 기본정보 + 보장내용 + 계약관계자·납입정보 + 약관·안내장 */
import { Icon } from '../../components/Icon';
import { LinkButtons, StatusChip } from '../../components/widgets';
import { formatWon } from '../../core/format';
import { insuredLabel } from '../dashboard/contractSummary';
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
        <thead><tr><th>구분</th><th>서류명</th><th>기준일</th><th className="r">내려받기</th></tr></thead>
        <tbody>{documents.map(doc => (
          <tr key={doc.id}>
            <td>{doc.kind}</td><td>{doc.title}</td><td className="num">{doc.date}</td>
            <td className="r"><button className="btn sm" data-action="download-contract-doc" data-no={contract.no} data-doc={doc.id}><Icon name="doc" />PDF<span className="sr-only"> {doc.title} 내려받기</span></button></td>
          </tr>
        ))}</tbody>
      </table></div>
      <p className="note-sm">약관과 보험상품안내장은 가입 당시 기준입니다.</p>
    </div>
  );
}

interface ContractDetailProps {
  contracts: readonly ContractInfo[];
  selected: number;
  userName: string;
  documents: readonly ContractDocument[];
}

export function ContractDetail({ contracts, selected, userName, documents }: ContractDetailProps) {
  const contract = contracts[selected];
  return (
    <>
      <div className="seg block mb-14" role="group" aria-label="조회할 계약">
        {contracts.map((item, index) => (
          <button key={item.no} className={index === selected ? 'on' : undefined} aria-pressed={index === selected} data-action="contract-tab" data-index={index}>{item.name.replace('(무)iM ', '')}</button>
        ))}
      </div>
      <div className="card">
        <h2 className="split">{contract.name} <StatusChip status={contract.status} /></h2>
        <dl className="kv">
          <dt>증권번호</dt><dd className="num">{contract.no}</dd>
          <dt>계약일</dt><dd className="num">{contract.startDate}</dd>
          <dt>보험기간</dt><dd>{contract.endDate}</dd>
          <dt>납입기간</dt><dd>{contract.payEnd === '갱신형' ? '갱신형' : `${contract.payEnd}까지`}</dd>
        </dl>
      </div>
      <div className="card">
        <h2>보장내용</h2>
        <div className="tbl-wrap"><table className="tbl min-420">
          <thead><tr><th>구분</th><th>보장</th><th className="r">가입금액</th></tr></thead>
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
