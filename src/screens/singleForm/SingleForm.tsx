/* T4 단일폼 변경: 현재값 확인 → 변경 입력 → (확인 후) 전자서명 */
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Field } from '../../components/form/Field';
import type { FieldSpec, FieldValues } from '../../components/form/fieldSpec';
import { Agreements, CalcBox, InfoBox, type CalcRow } from '../../components/widgets';
import { focusElement } from '../../core/dom.js';
import type { AuthLevel } from '../../data/menu';
import { readFieldValues } from '../../form/formEngine.js';
import { validateValues } from '../../form/validation';

/** 표준 단일폼 설정 (screens/changeForms 중 전용 화면이 아닌 것) */
export interface SingleFormConfig {
  current: readonly (readonly [string, string])[];
  fields: FieldSpec[];
  calc?: (values: FieldValues) => readonly CalcRow[];
  agree?: readonly string[];
  note?: string;
  nextLabel?: string;
  done: string;
}

export interface SingleFormFlow {
  step: number;
  values: FieldValues;
  agreed: number[];
}

interface SingleFormProps {
  config: SingleFormConfig;
  values: FieldValues;                          // 이전에 입력한 값 (큰글씨 전환·다시 보기)
  agreed: readonly number[];
  authLevel: AuthLevel;
  onValuesChange: (values: FieldValues) => void;
  onAgreedChange: (agreed: number[]) => void;
  onSubmit: () => void;                         // 검증을 통과하면 호출 (전자서명으로 이어짐)
}

/** 첫 오류 칸으로 스크롤·초점 (KWCAG 25번 오류 정정) */
function focusFirstError(form: HTMLElement) {
  const group = form.querySelector('.err:not(:empty)')?.closest('.fld');
  if (!group) return;
  group.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  focusElement(group.querySelector('input:not([type=hidden]), select, textarea') ?? group);
}

export function SingleForm({ config, values, agreed: initialAgreed, authLevel, onValuesChange, onAgreedChange, onSubmit }: SingleFormProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreeError, setAgreeError] = useState('');
  const [calcValues, setCalcValues] = useState<FieldValues | null>(null);
  const [agreed, setAgreed] = useState<readonly number[]>(initialAgreed);

  /** 화면의 입력값을 읽어 알림 */
  const syncValues = (): FieldValues => {
    const read = formRef.current ? readFieldValues(formRef.current, config.fields) as FieldValues : {};
    const merged = { ...values, ...read };
    onValuesChange(merged);
    return merged;
  };

  const changed = (field: FieldSpec, value: string) => {
    if (field.type === 'select' && value && errors[field.id]) flushSync(() => setErrors(({ [field.id]: _, ...rest }) => rest));   // 고르면 오류 지움
    if (config.calc) flushSync(() => setCalcValues(syncValues()));
  };

  const next = () => {
    const values = syncValues();
    const found = validateValues(config.fields, values);
    flushSync(() => setErrors(found));
    if (Object.keys(found).length) {
      if (formRef.current) focusFirstError(formRef.current);
      return;
    }
    if (config.agree && agreed.length < config.agree.length) {
      flushSync(() => setAgreeError('필수 확인 항목에 체크해 주세요.'));
      return;
    }
    onSubmit();
  };

  const calcSource = calcValues ?? { ...defaultValues(config.fields), ...values };
  return (
    <>
      <div className="card"><h2>현재 등록된 정보</h2>
        <dl className="kv">{config.current.map(([key, value]) => [<dt key={`${key}-t`}>{key}</dt>, <dd key={`${key}-d`}>{value}</dd>])}</dl>
      </div>
      <div className="card"><h2>변경할 내용</h2>
        <div className="form" id="frm" ref={formRef}>
          {config.fields.map(field => <Field key={field.id} field={field} values={values} error={errors[field.id]} onChange={value => changed(field, value)} />)}
        </div>
      </div>
      {config.calc && <div className="mt-14" id="calc" aria-live="polite"><CalcBox rows={config.calc(calcSource)} /></div>}
      {config.note && <InfoBox tone="info mt-14" icon="info">{config.note}</InfoBox>}
      {config.agree && <Agreements items={config.agree} agreed={initialAgreed} error={agreeError} onChange={checked => { setAgreed(checked); onAgreedChange(checked); }} />}
      <div className="navrow">
        <button className="btn lg" data-action="back">취소</button>
        <button className="btn pri lg" id="next" onClick={next}>{config.nextLabel ?? (authLevel === 'A2' ? '추가인증 후 변경' : '변경하기')}</button>
      </div>
    </>
  );
}

/** 화면에 처음 보이는 값 (라디오는 첫 선택지, 선택 상자는 첫 항목) — 첫 계산에 사용 */
export function defaultValues(fields: readonly FieldSpec[]): FieldValues {
  const values: FieldValues = {};
  for (const field of fields) {
    const first = field.type === 'radio' || field.type === 'select' ? field.options?.[0] : undefined;
    values[field.id] = field.value ?? first ?? '';
  }
  return values;
}
