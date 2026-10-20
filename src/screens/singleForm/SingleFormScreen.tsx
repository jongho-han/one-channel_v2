/* T4 단일폼 화면: 진행 상태(state.screen.flow)·전자서명·완료와 연결 (전용 화면은 CustomFormScreen) */
import { DoneCard } from '../../components/widgets';
import { APP } from '../../core/config';
import { clockTime, receiptNo } from '../../core/format';
import type { ScreenSpec } from '../../data/menu';
import { chooseSignMethod } from '../../services/auth';
import { state } from '../../state/store';
import type { ChangeFormConfig } from '../changeForms';
import { completeSingleForm } from './completeSingleForm';
import { CustomFormScreen } from './CustomFormScreen';
import { SingleForm, type SingleFormConfig, type SingleFormFlow } from './SingleForm';

interface DoneFlow extends SingleFormFlow {
  receiptNo?: string;
}

function SingleFormDone({ screen, config, flow }: { screen: ScreenSpec & { result: string }; config: ChangeFormConfig; flow: DoneFlow }) {
  flow.receiptNo ??= receiptNo('M2610');
  return (
    <>
      <DoneCard title="변경이 완료되었습니다" message={config.done}
                rows={[['처리번호', flow.receiptNo], ['처리일시', `${APP.today} ${clockTime()}`], ['안내', screen.result, true]]} />
      <div className="navrow inline">
        <button className="btn lg" data-action="nav" data-page="home">홈으로</button>
        <button className="btn pri lg" data-action="reset-flow">다시 보기</button>
      </div>
    </>
  );
}

export function SingleFormScreen({ screen, config }: { screen: ScreenSpec & { result: string }; config: ChangeFormConfig }) {
  const flow = (state.screen.flow ??= { step: 0, values: {}, agreed: [] }) as DoneFlow;
  if (flow.step === 1) return <SingleFormDone screen={screen} config={config} flow={flow} />;
  if (config.custom) return <CustomFormScreen screen={screen} config={config} />;
  return (
    <SingleForm config={config as SingleFormConfig} values={flow.values} agreed={flow.agreed} authLevel={screen.authLevel}
                onValuesChange={values => Object.assign(flow.values, values)} onAgreedChange={agreed => { flow.agreed = agreed; }}
                onSubmit={() => chooseSignMethod(screen, () => completeSingleForm(flow))} />
  );
}
