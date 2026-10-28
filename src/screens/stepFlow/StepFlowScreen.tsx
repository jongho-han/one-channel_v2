/* T3 단계형 화면: 진행 상태(state.screen.flow)와 연결 — 선택 → 입력 → 확인 → 인증 → 완료 */
import type { ReactNode } from 'react';
import type { CalcRow, ReceiptRow } from '../../components/widgets';
import { APP } from '../../core/config';
import { clockTime, receiptNo } from '../../core/format';
import { CONTRACTS } from '../../data/customerRepository';
import type { ScreenSpec } from '../../data/menu';
import { annuityContracts } from '../../features/annuity';
import { signAndConfirm } from '../../services/auth';
import { state, updateScreenFlow, updateScreenValues } from '../../state/store';
import { announce } from '../../ui/overlay';
import { STEP_FLOWS, type StepFlowConfig, type StepFlowState } from '../stepFlows';
import { AnnuityPick } from './AnnuityPick';
import { ClaimGuide } from './ClaimGuide';
import { claimTypeOf } from '../../data/claimGuide';
import { LoanPick } from './LoanPick';
import { ConfirmStep, DoneStep, InputStep, PickStep, SignStep, Stepper } from './StepFlow';
import { goToStep } from './stepFlowActions';
import { confirmRows, doneTitle, pickLabelName, pickedItem, pickedKeys, stepsOf } from './stepRules';

type Screen = ScreenSpec & { bizType: string; result: string };

const next = () => goToStep(1);

/** 연금개시 변경: 계약을 바꾸면 고른 나이는 초기화 */
function pickAnnuity(flow: StepFlowState, key: string) {
  if (flow.pick === key) return;
  const { age, ...rest } = flow.values;
  updateScreenFlow({ pick: key, values: rest });
}

function PickStage({ config, flow }: { config: StepFlowConfig; flow: StepFlowState }) {
  const pick = config.pick ?? {};
  if (pick.custom === 'annuity') {
    return <AnnuityPick label={pick.label ?? ''} contracts={annuityContracts()} picked={flow.pick} onPick={key => pickAnnuity(flow, key)} onNext={next} />;
  }
  if (pick.custom === 'loan') {
    return <LoanPick contracts={CONTRACTS} amount={Number(flow.values.loanAmount) || 0} announce={announce}
                     onNext={amount => { updateScreenValues({ loanAmount: amount }); next(); }} />;
  }
  return <PickStep label={pick.label ?? ''} items={pick.items?.() ?? []} picked={flow.pick} multiple={pick.multiple} pickedKeys={pickedKeys(flow)} retain={config.retain} onNext={next} />;
}

/** 계산에 넘길 고른 값: 여러 개 고르기면 키를 쉼표로 이음 */
const calcPick = (config: StepFlowConfig, flow: StepFlowState): string | null => (config.pick?.multiple ? pickedKeys(flow).join(',') : flow.pick);

/** 입력 단계 위 안내: 여러 개 고르기면 '납입할 계약 N건 · 이름들' */
function pickDescribe(config: StepFlowConfig, flow: StepFlowState): ReactNode {
  if (!config.pick?.multiple) return config.pick?.describe?.(flow);
  const keys = pickedKeys(flow);
  const titles = (config.pick.items?.() ?? []).filter(item => keys.includes(item.key)).map(item => item.title);
  return <><b>{pickLabelName(config.pick.label)} {titles.length}건</b>{titles.join(' · ')}</>;
}

function DoneStage({ screen, config, flow }: { screen: Screen; config: StepFlowConfig; flow: StepFlowState }) {
  flow.receiptNo ??= receiptNo(config.receiptPrefix || 'R2610');
  const totals: ReceiptRow[] = config.calc ? config.calc(flow.values, calcPick(config, flow)).filter(([, , isTotal]) => isTotal).map(([label, value]) => [label, value]) : [];
  const message = typeof config.done === 'function' ? config.done(flow.values) : config.done;
  const rows: ReceiptRow[] = [['접수번호', flow.receiptNo], ['접수일시', `${APP.today} ${clockTime()}`], ...totals, ['안내', config.doneGuide?.(flow.values) || screen.result, true]];
  return (
    <DoneStep title={doneTitle(config, screen.bizType, flow.values)} message={message} rows={rows}
              summary={config.pick?.summary?.(flow, 'done')} extra={config.doneExtra?.(flow)} next={config.doneNext ?? ['내 계약 보기', 'CT-01']} />
  );
}

/** 청구 종류를 바꾸면 피보험자는 그 종류의 첫 선택지로 */
function changeClaimType(key: string) {
  updateScreenValues({ claimType: key, who: claimTypeOf(key).who[0] });
}

function Stage({ screen, config: baseConfig, flow, step }: { screen: Screen; config: StepFlowConfig; flow: StepFlowState; step: string }): ReactNode {
  const config = baseConfig.fieldsFor ? { ...baseConfig, fields: baseConfig.fieldsFor(flow.values, flow.pick) } : baseConfig;
  switch (step) {
    case '안내':
      return <ClaimGuide claimType={String(flow.values.claimType ?? '')} onChange={changeClaimType} onNext={next} />;
    case '선택':
      return <PickStage config={config} flow={flow} />;
    case '입력':
      return (
        <InputStep config={config} values={flow.values} agreed={flow.agreed} pick={calcPick(config, flow)} picked={config.pick?.multiple ? undefined : pickedItem(config, flow.pick)}
                   describe={pickDescribe(config, flow)} announce={announce}
                   onValuesChange={values => updateScreenValues(values)} onAgreedChange={agreed => updateScreenFlow({ agreed })}
                   onSubmit={(values, agreed) => { updateScreenFlow({ values: { ...flow.values, ...values }, agreed }); next(); }} />
      );
    case '확인': {
      const calcRows: readonly CalcRow[] | undefined = config.calc?.(flow.values, calcPick(config, flow));
      return <ConfirmStep rows={confirmRows(config, flow)} calcRows={calcRows} summary={config.pick?.summary?.(flow, 'confirm')} onConfirm={next} />;
    }
    case '인증':
      return <SignStep authLevel={screen.authLevel} onSign={method => signAndConfirm(screen, method, next)} />;
    default:
      return <DoneStage screen={screen} config={config} flow={flow} />;
  }
}

export function StepFlowScreen({ screen }: { screen: Screen }) {
  const config = STEP_FLOWS[screen.id];
  const flow = (state.screen.flow ??= { step: 0, pick: null, values: {}, agreed: [] }) as StepFlowState;
  const steps = stepsOf(config);
  return (
    <>
      <Stepper steps={steps} current={flow.step} />
      <Stage screen={screen} config={config} flow={flow} step={steps[flow.step]} />
    </>
  );
}
