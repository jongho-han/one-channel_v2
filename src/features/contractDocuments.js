import { buildPdf } from '../core/pdf.js';
import { saveFile } from '../core/download.js';
import { formatWon } from '../core/format';
import { findContractDocument } from '../data/contractDocumentRepository.js';
import { USER, insuredLabel } from '../data/customerRepository';
import { toast } from '../ui/overlay.js';

/* 계약조회(CT-02): 계약별 약관 · 안내장 PDF 내려받기 (목록 화면은 screens/list/ContractDetail) */
/** 서류 종류별 본문 (시연용 샘플 문구) — 안내장은 가입 당시 계약 내용 */
function documentBody(contract, doc) {
  if (doc.kind === '약관') {
    return [
      '제1조(목적) 이 보험계약은 보험계약자와 회사 사이에 피보험자의 보험사고에 대하여 보장을 제공하는 데 목적이 있습니다.',
      '제2조(용어의 정의) 이 약관에서 사용하는 용어의 뜻은 다음과 같습니다.',
      `제3조(보장내용) ${contract.coverage.map(([type, desc]) => `${type}: ${desc}`).join(' / ')}`,
    ];
  }
  return [
    `계약일: ${contract.startDate}  ·  보험기간: ${contract.endDate}  ·  납입기간: ${contract.payEnd}`,
    `월 보험료: ${formatWon(contract.premium)}  ·  총 납입횟수: ${contract.totalCount}${typeof contract.totalCount === 'number' ? '회' : ''}`,
    ...contract.coverage.map(([type, desc, amount]) => `${type} — ${desc}: ${amount}`),
  ];
}

/** 긴 문장을 한 줄 글자 수에 맞춰 나눔 */
const wrap = (text, width = 40) => text.match(new RegExp(`.{1,${width}}`, 'g')) || [''];

export function downloadContractDocument(no, id) {
  const { contract, document: doc } = findContractDocument(no, id);
  if (!doc) return;

  const title = `${contract.name} ${doc.title}`;
  const lines = [
    { text: doc.title, size: 18, gap: 1 },
    { text: contract.name, size: 13 },
    { text: `증권번호 ${contract.no}  ·  기준일 ${doc.date}`, size: 11 },
    { text: `계약자 ${USER.name}  ·  피보험자 ${insuredLabel(contract)}`, size: 11, gap: 1.6 },
    ...documentBody(contract, doc).flatMap(text => wrap(text).map(line => ({ text: line, size: 11 }))),
    { text: '', size: 11 },
    { text: '※ 본 문서는 프로토타입 시연용 샘플입니다.', size: 9 },
  ];
  saveFile(`${contract.no}_${doc.title.replace(/\s+/g, '_')}.pdf`, buildPdf({ title, lines }), 'application/pdf');
  toast(`${doc.title}을(를) 내려받았습니다.`);
}
