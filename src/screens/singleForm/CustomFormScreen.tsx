/* T4 전용 화면(안내장 수신설정·마케팅 동의·펀드변경): 전용 본문 + 공통 안내·버튼 줄 */
import type { ReactNode } from 'react';
import type { FieldValues } from '../../components/form/fieldSpec';
import { InfoBox } from '../../components/widgets';
import { APP } from '../../core/config';
import { MARKETING_CONSENTS, NOTICE_E_CONSENT_DEFAULT, NOTICE_SETTINGS } from '../../data/consentRepository';
import { EMAIL_DOMAINS, USER, isEmailTaken } from '../../data/customerRepository';
import { SUITABILITY, SUITABILITY_QUESTIONS } from '../../data/fundRepository';
import type { ScreenSpec } from '../../data/menu';
import { VARIABLE_CONTRACTS, selectedVariableContract } from '../../features/variableContract';
import { chooseSignMethod, verifyPhone } from '../../services/auth';
import { $, focusElement } from '../../core/dom';
import { EMAIL_DOMAIN_MISSING, privacyErrors, type PrivacyErrors, type PrivacyValues } from '../../form/privacyRules';
import { searchZip } from '../../form/zipSearch';
import { rerenderScreen } from '../../pages/screen';
import { state, updateScreenFlow, updateScreenValues } from '../../state/store';
import { announce, confirmDialog, toast } from '../../ui/overlay';
import type { ChangeFormConfig } from '../changeForms';
import { currentFundRatios, submitFundChange, type FundFlow } from '../fund/fundFlow';
import { ratioTotal } from '../fund/fundRules';
import { FundCompare, FundEdit, SuitabilityQuestions, SuitabilityResult } from '../fund/FundViews';
import { completeSingleForm } from './completeSingleForm';
import { MarketingConsents, NoticeSettings } from './CustomForms';
import { PrivacyForm } from './PrivacyForm';

interface CustomFlow extends FundFlow {
  values: FieldValues & { noticeMethods?: string[]; eConsent?: boolean };
  privacyErrors?: PrivacyErrors;
}

/** 개인정보변경 검증 오류 → 초점을 옮길 칸 */
const PRIVACY_FOCUS: Record<keyof PrivacyErrors, string> = { mob: '#mob', email: '#emailLocal', addrH: '#addrH_d', addrW: '#addrW_d', telH: '#telH1', telW: '#telW1', form: '#e-form' };

function PrivacyBody({ flow }: { flow: CustomFlow }) {
  return (
    <PrivacyForm current={USER} values={flow.values as PrivacyValues} errors={flow.privacyErrors ?? {}} domains={EMAIL_DOMAINS} callCenter={APP.callCenter}
                 onChange={values => updateScreenValues(values as FieldValues)} verifyPhone={verifyPhone} searchZip={searchZip} isEmailTaken={isEmailTaken} />
  );
}

/** 개인정보변경: 입력한 항목 검증 → 오류면 첫 오류 칸으로, 통과하면 전자서명 */
function submitPrivacy(screen: ScreenSpec, flow: CustomFlow) {
  const errors = privacyErrors(flow.values as PrivacyValues);
  updateScreenFlow({ privacyErrors: errors });
  rerenderScreen();
  const first = (Object.keys(PRIVACY_FOCUS) as (keyof PrivacyErrors)[]).find(key => errors[key]);
  if (first) return focusElement($(errors.email === EMAIL_DOMAIN_MISSING ? '#emailDomainText' : PRIVACY_FOCUS[first]));
  chooseSignMethod(screen, () => completeSingleForm(flow));
}

const contracts = VARIABLE_CONTRACTS;
const notices = NOTICE_SETTINGS;

function confirmRelease(onYes: () => void, onNo: () => void) {
  confirmDialog({
    title: '전자적방법 수신동의 해제',
    message: '전자적방법 수신동의 체크 해제 시 안내장별 수신 방법을 우편으로 선택하셔야 합니다. 해제하시겠습니까?',
    onYes, onNo,
  });
}

function NoticeBody({ flow }: { flow: CustomFlow }) {
  const { values } = flow;
  return (
    <NoticeSettings notices={notices} contact={USER} methods={values.noticeMethods ?? notices.map(([, , method]) => method)}
                    consent={values.eConsent ?? NOTICE_E_CONSENT_DEFAULT} confirmRelease={confirmRelease} announce={announce} toast={toast}
                    onChange={(methods, consent) => updateScreenValues({ noticeMethods: methods, eConsent: consent })} />
  );
}

/** 펀드변경: 단계별 본문 (편집 외 단계는 자체 버튼 사용) */
function FundBody({ flow }: { flow: CustomFlow }) {
  const contract = selectedVariableContract();
  switch (flow.phase) {
    case 'diagnose':
      return <SuitabilityQuestions questions={SUITABILITY_QUESTIONS} answers={flow.suitAnswers ?? {}} missing={flow.suitMissing ?? []}
                                   onAnswer={(question, option) => updateScreenFlow({ suitAnswers: { ...flow.suitAnswers, [question]: option } })} />;
    case 'result':
      return flow.result ? <SuitabilityResult result={flow.result} today={APP.today} /> : null;
    case 'compare':
      return <FundCompare contract={contract} after={currentFundRatios(flow)} rebalance={Boolean(flow.rebalance)} suitability={SUITABILITY} />;
    default:
      return <FundEdit contracts={contracts} contract={contract} ratios={currentFundRatios(flow)} rebalance={Boolean(flow.rebalance)} suitability={SUITABILITY}
                       onRatiosChange={ratios => updateScreenFlow({ fundRatios: ratios })} onRebalanceChange={rebalance => updateScreenFlow({ rebalance })} />;
  }
}

export function CustomFormScreen({ screen, config }: { screen: ScreenSpec; config: ChangeFormConfig }) {
  const flow = state.screen.flow as CustomFlow;
  const isFund = config.custom === 'fund';
  if (isFund && flow.phase && flow.phase !== 'edit') return <FundBody flow={flow} />;

  const body: Record<string, ReactNode> = {
    notice: <NoticeBody flow={flow} />,
    marketing: <MarketingConsents consents={MARKETING_CONSENTS} />,
    fund: <FundBody flow={flow} />,
    privacy: <PrivacyBody flow={flow} />,
  };

  const next = () => {
    if (config.custom === 'privacy') return submitPrivacy(screen, flow);
    if (!isFund) return chooseSignMethod(screen, () => completeSingleForm(flow));
    if (ratioTotal(currentFundRatios(flow)) !== 100) return toast('변경 후 비율 합계를 100%로 맞춰 주세요.');
    submitFundChange(flow);
  };

  return (
    <>
      {body[config.custom ?? '']}
      {config.note && <InfoBox tone="info mt-14" icon="info">{config.note}</InfoBox>}
      <div className="navrow">
        <button className="btn lg" data-action="back">취소</button>
        <button className="btn pri lg" id="next" onClick={next}>{config.nextLabel ?? (screen.authLevel === 'A2' ? '추가인증 후 변경' : '변경하기')}</button>
      </div>
    </>
  );
}
