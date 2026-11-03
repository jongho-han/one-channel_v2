/* FATCA·CRS 본인확인서 단계: 고객 인적사항(자동 표시) + 고객 확인사항(미국인·해외 거주자, 해당하면 납세자 정보·증빙서류) */
import type { FieldValues } from '../../components/form/fieldSpec';
import { KeyValueList } from '../../components/widgets';
import { FATCA_FIELDS, FATCA_PROFILE } from '../../features/fatca';
import { InputStep, type InputStepConfig } from './StepFlow';

const FATCA_CONFIG: InputStepConfig = {
  title: '고객 확인사항',
  intro: { tone: 'info', title: 'FATCA·CRS 본인확인서를 작성해 주세요', desc: '국제조세조정에 관한 법률에 따라 대한민국 외 국가의 납세의무 여부를 확인합니다.' },
  fields: FATCA_FIELDS,
};

interface FatcaStepProps {
  values: FieldValues;
  announce: (message: string) => void;
  onValuesChange: (values: FieldValues) => void;
  onSubmit: (values: FieldValues) => void;
}

export function FatcaStep({ values, announce, onValuesChange, onSubmit }: FatcaStepProps) {
  const profile = (
    <div className="card mb-14">
      <h2>고객 인적사항</h2>
      <KeyValueList rows={FATCA_PROFILE} />
      <p className="note-sm">계약 정보로 자동 표시됩니다.</p>
    </div>
  );
  return (
    <InputStep config={FATCA_CONFIG} values={values} agreed={[]} lead={profile} announce={announce}
               onValuesChange={onValuesChange} onAgreedChange={() => undefined} onSubmit={onSubmit} />
  );
}
