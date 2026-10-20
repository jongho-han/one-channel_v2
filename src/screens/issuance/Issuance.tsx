/* T5 발급: 조건 선택 → 즉시 발급(견본 증명서) / 비로그인 서류 내려받기 */
import { useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { Field } from '../../components/form/Field';
import { toDotDate, type FieldSpec, type FieldValues } from '../../components/form/fieldSpec';
import { Icon } from '../../components/Icon';
import { InfoBox } from '../../components/widgets';
import { PHONE_PATTERN } from '../../core/format';
import { readFieldValues } from '../../form/fieldValues';
import type { CertificateConfig, FormDownload } from '../certificates';

export interface CertificateUser {
  name: string;
  birth: string;   // YYYY.MM.DD
  email: string;
}

export const RECEIVE_FIELD: FieldSpec = { id: 'recv', label: '받는 방법', type: 'radio', options: ['화면에서 보기', 'PDF로 저장', '이메일로 받기', '팩스로 받기'] };
const DATE_KEYS = ['from', 'to', 'base'];

interface IssuanceFormProps {
  config: CertificateConfig;
  values: FieldValues;
  user: CertificateUser;
  onIssue: (values: FieldValues) => void;
}

/** 발급 조건 입력 */
export function IssuanceForm({ config, values, user, onIssue }: IssuanceFormProps) {
  const [method, setMethod] = useState(String(values.recv ?? RECEIVE_FIELD.options?.[0]));
  const [faxError, setFaxError] = useState('');

  /** 입력값은 본문 전체(버튼 줄의 부모)에서 읽음 — 감싸는 요소 없이 기존 마크업 유지 */
  const issue = (event: MouseEvent<HTMLButtonElement>) => {
    const root = event.currentTarget.closest('.navrow')?.parentElement;
    if (!root) return;
    const read = readFieldValues(root, [...config.fields, RECEIVE_FIELD]) as FieldValues;
    read.email = root.querySelector<HTMLInputElement>('#email')?.value ?? '';
    read.fax = root.querySelector<HTMLInputElement>('#fax')?.value ?? '';
    if (read.recv === '팩스로 받기' && !PHONE_PATTERN.test(read.fax)) {
      flushSync(() => setFaxError('팩스번호를 확인해 주세요.'));   // 기존 화면처럼 즉시 반영 (화면낭독기·테스트)
      return;
    }
    for (const key of DATE_KEYS) {
      const value = read[key];
      if (typeof value === 'string' && value) read[key] = toDotDate(value);
    }
    onIssue(read);
  };

  return (
    <>
      <div className="card"><h2>발급 조건</h2><div className="form" id="frm">{config.fields.map(field => <Field key={field.id} field={field} values={values} />)}</div></div>
      {config.preview && <div className="card"><h2>발급 미리보기</h2>{config.preview()}</div>}
      <div className="card"><div className="form">
        <Field field={RECEIVE_FIELD} values={values} onChange={value => flushSync(() => setMethod(value))} />
        <div className="fld" id="emailF" hidden={method !== '이메일로 받기'}><label htmlFor="email">받을 이메일</label><input className="inp" id="email" type="email" defaultValue={user.email} /></div>
        <div className="fld" id="faxF" hidden={method !== '팩스로 받기'}><label htmlFor="fax">받을 팩스번호</label><input className="inp num" id="fax" type="tel" placeholder="02-000-0000" /><span className="err" id="faxErr">{faxError}</span></div>
      </div></div>
      <div className="navrow">
        <button className="btn lg" data-action="back">취소</button>
        <button className="btn pri lg" id="issue" onClick={issue}>발급하기</button>
      </div>
    </>
  );
}

const DELIVERY_NOTES: Record<string, (values: FieldValues, user: CertificateUser) => string> = {
  '이메일로 받기': (values, user) => `${values.email || user.email}(으)로 보냈습니다.`,
  '팩스로 받기':   values => `${values.fax}(으)로 전송했습니다.`,
  'PDF로 저장':    () => '실제 서비스에서는 PDF 파일로 저장됩니다.',
};

interface IssuedCertificateProps {
  config: CertificateConfig;
  values: FieldValues;
  user: CertificateUser;
  issueNo: string;
  documentCode: string;
  today: string;
}

/** 발급된 견본 증명서 */
export function IssuedCertificate({ config, values, user, issueNo, documentCode, today }: IssuedCertificateProps) {
  const [[, title], ...rows] = config.document(values);
  const note = DELIVERY_NOTES[String(values.recv)]?.(values, user) ?? '아래 증명서를 확인하세요.';
  return (
    <>
      <InfoBox tone="ok mb-14" icon="check"><b>발급이 완료되었습니다</b>{note} 문서확인번호로 진위를 확인할 수 있습니다.</InfoBox>
      <div className="cert">
        <div className="issuer">iM라이프생명보험</div>
        <h2>{title}</h2>
        <div className="no num">{issueNo} · 문서확인번호 {documentCode}</div>
        <table><tbody>
          <tr><th>계약자</th><td>{user.name} ({user.birth.slice(0, 4)}.**.**)</td></tr>
          {rows.map(([key, value]) => <tr key={key}><th>{key}</th><td className="num">{value}</td></tr>)}
        </tbody></table>
        <p className="attest">위와 같이 증명합니다.</p>
        <div className="sign num">{today}<br />iM라이프생명보험주식회사<small>본 문서는 기획 검토용 견본이며 효력이 없습니다.</small></div>
      </div>
      <div className="navrow">
        <button className="btn lg" data-action="reset-flow">다시 발급</button>
        <button className="btn pri lg" data-action="nav" data-page="home">완료</button>
      </div>
    </>
  );
}

const DOWNLOAD_TONE: Record<string, string> = { '필수': 'r', '안내': 'b' };

/** 비로그인 서류 내려받기 (CS-01·02) */
export function FormDownloads({ title, items }: { title: string; items: readonly FormDownload[] }) {
  return (
    <>
      <InfoBox tone="ok mb-14" icon="info"><b>로그인하지 않아도 받을 수 있습니다</b>서류를 출력해 작성한 뒤, 사이버창구·모바일 청구 또는 우편·팩스로 제출하세요.</InfoBox>
      <div className="card"><h2>{title}</h2><div className="picks">
        {items.map(([name, description, kind]) => (
          <div className="pick static" key={name}>
            <span className="ic doc-ic" aria-hidden="true"><Icon name="doc" /></span>
            <span className="pm"><b>{name}</b><small>{description}</small></span>
            <span className={`st ${DOWNLOAD_TONE[kind] ?? 'n'}`}>{kind}</span>
            <button className="btn sm" data-action="toast" data-message={`${name} PDF는 실제 서비스에서 내려받습니다.`} aria-label={`${name} PDF 받기`}>PDF 받기</button>
          </div>
        ))}
      </div></div>
      <div className="navrow">
        <button className="btn lg" data-action="nav" data-page="home">홈으로</button>
        <button className="btn pri lg" data-action="open" data-id="PY-01">모바일로 바로 청구하기</button>
      </div>
    </>
  );
}
