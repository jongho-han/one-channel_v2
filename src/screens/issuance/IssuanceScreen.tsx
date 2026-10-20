/* T5 발급 화면: 진행 상태(state.screen.flow)와 연결 */
import { useState } from 'react';
import type { FieldValues } from '../../components/form/fieldSpec';
import { APP } from '../../core/config';
import { scrollToTop } from '../../core/dom.js';
import { USER } from '../../data/customerRepository';
import type { ScreenSpec } from '../../data/menu';
import { rerenderScreen } from '../../pages/screen.js';
import { state } from '../../state/store';
import { CERTIFICATES, FORM_DOWNLOADS } from '../certificates';
import { FormDownloads, IssuanceForm, IssuedCertificate } from './Issuance';

interface IssuanceFlow {
  step: number;
  values: FieldValues;
  issueNo?: string;
}

const randomCode = () => Math.random().toString(36).slice(2, 6).toUpperCase();
const newIssueNo = () => `No. ${APP.today.replace(/\./g, '')}-${String(Math.floor(Math.random() * 900000) + 100000)}`;

function Issued({ flow, screen }: { flow: IssuanceFlow; screen: ScreenSpec }) {
  flow.issueNo ??= newIssueNo();
  const [documentCode] = useState(() => `${randomCode()}-${randomCode()}`);
  return <IssuedCertificate config={CERTIFICATES[screen.id]} values={flow.values} user={USER} issueNo={flow.issueNo} documentCode={documentCode} today={APP.today} />;
}

export function IssuanceScreen({ screen }: { screen: ScreenSpec }) {
  if (screen.authLevel === 'A0') return <FormDownloads title={screen.depth3} items={FORM_DOWNLOADS[screen.id]} />;

  const flow = (state.screen.flow ??= { step: 0, values: {} }) as IssuanceFlow;
  if (flow.step === 1) return <Issued flow={flow} screen={screen} />;

  const issue = (values: FieldValues) => {
    Object.assign(flow, { values, step: 1 });
    rerenderScreen();
    scrollToTop();
  };
  return <IssuanceForm config={CERTIFICATES[screen.id]} values={flow.values} user={USER} onIssue={issue} />;
}
