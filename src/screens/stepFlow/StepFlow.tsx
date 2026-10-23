/* T3 단계형 신청 화면 부품: 진행 단계 · 선택 · 입력 · 확인 · 인증 · 완료 */
import { useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { Field } from '../../components/form/Field';
import type { FieldSpec, FieldValues } from '../../components/form/fieldSpec';
import { Icon } from '../../components/Icon';
import { Agreements, CalcBox, DoneCard, InfoBox, KeyValueList, checkedAgreements, type CalcRow, type ReceiptRow } from '../../components/widgets';
import { focusElement } from '../../core/dom';
import { RETENTION_OPTIONS } from '../../data/homeContent';
import type { AuthLevel } from '../../data/menu';
import { isFieldVisible, renderedValues } from '../../form/display';
import { focusFirstError } from '../../form/focus';
import { readFieldValues } from '../../form/fieldValues';
import { applyLocks, lockChanges, type LockRules, type Locks } from '../../form/locks';
import { validateValues } from '../../form/validation';
import { SIGN_METHODS } from '../../services/auth';
import type { PickItem } from './stepRules';

export { Stepper } from '../../components/widgets';

/* 선택 ------------------------------------------------------------------ */
/** 해지 전에 먼저 보여주는 대안 (대출 · 감액완납 · 자동대출납입) */
function RetentionOptions() {
  return (
    <div className="card retain-card">
      <h2>해지하기 전에 이런 방법도 있어요</h2>
      <p>보장은 그대로 두고 필요한 문제만 해결할 수 있습니다.</p>
      <div className="retain">
        {RETENTION_OPTIONS.map(([title, desc, id]) => <button key={id} data-action="open" data-id={id}><b>{title}</b><small>{desc}</small></button>)}
      </div>
    </div>
  );
}

interface PickStepProps {
  label: string;
  items: readonly PickItem[];
  picked: string | null;
  multiple?: boolean;                   // 여러 개 고르기 (전체선택, 카드는 체크 표시)
  pickedKeys?: readonly string[];       // 여러 개 고르기에서 고른 키
  retain?: boolean;
  onNext: () => void;
}

/** 카드 고르기 — 카드는 data-action="pick", 여러 개 고르기면 전체선택은 data-action="pick-all" (고르면 화면을 다시 그림) */
export function PickStep({ label, items, picked, multiple = false, pickedKeys = [], retain, onNext }: PickStepProps) {
  const isOn = (key: string) => (multiple ? pickedKeys.includes(key) : picked === key);
  const allOn = multiple && items.length > 0 && items.every(item => pickedKeys.includes(item.key));
  const hasPick = multiple ? pickedKeys.length > 0 : Boolean(picked);
  return (
    <>
      <div className="card">
        {multiple
          ? <div className="pick-head"><h2 id="pickTitle">{label}</h2>
              <button className="btn sm" data-action="pick-all" aria-pressed={allOn}>{allOn ? '전체해제' : '전체선택'}</button></div>
          : <h2 id="pickTitle">{label}</h2>}
        {multiple && <p className="note-sm" aria-live="polite">{pickedKeys.length}건 선택</p>}
        <div className="picks" role="group" aria-labelledby="pickTitle">
        {items.map(item => (
          <button key={item.key} className={['pick', multiple && 'multi', isOn(item.key) && 'on'].filter(Boolean).join(' ')} aria-pressed={isOn(item.key)} data-action="pick" data-key={item.key}>
            <span className="rd" aria-hidden="true" />
            <span className="pm"><b>{item.title}</b><small className="num">{item.sub}</small></span>
            <span className="pv num">{item.value}</span>
          </button>
        ))}
      </div></div>
      {retain && <RetentionOptions />}
      <div className="navrow">
        <button className="btn lg" data-action="back">취소</button>
        <button className="btn pri lg" id="next" disabled={!hasPick} aria-describedby="pickHint" onClick={onNext}>다음</button>
        <span className="sr-only" id="pickHint">{hasPick ? '' : '먼저 위에서 하나를 선택해야 다음 단계로 갈 수 있습니다.'}</span>
      </div>
    </>
  );
}

/* 입력 ------------------------------------------------------------------ */
export interface InputStepConfig {
  fields: readonly FieldSpec[];
  calc?: (values: FieldValues, pick?: string | null) => readonly CalcRow[];
  agree?: readonly string[];
  warn?: string;
  intro?: { tone: string; title: string; desc: string };
  compact?: boolean;
  lockRules?: LockRules;
}

interface InputStepProps {
  config: InputStepConfig;
  values: FieldValues;
  agreed: readonly number[];
  pick?: string | null;
  picked?: PickItem;
  describe?: ReactNode;                 // 선택 단계 결과 안내 (대출 신청금액 등)
  announce: (message: string) => void;
  onValuesChange: (values: FieldValues) => void;
  onAgreedChange: (agreed: number[]) => void;
  onSubmit: (values: FieldValues, agreed: number[]) => void;
}

const lockedIds = (locks: Locks) => Object.keys(locks);

export function InputStep({ config, values: initialValues, agreed: initialAgreed, pick, picked, describe, announce, onValuesChange, onAgreedChange, onSubmit }: InputStepProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const [initial] = useState(() => applyLocks(config.fields, { ...renderedValues(config.fields, initialValues), ...pickNonField(initialValues, config.fields) }, config.lockRules));
  const [values, setValues] = useState<FieldValues>(initial.values);
  const [locks, setLocks] = useState<Locks>(initial.locks);
  const [everLocked, setEverLocked] = useState<readonly string[]>(lockedIds(initial.locks));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreeError, setAgreeError] = useState('');

  /** 화면의 입력값을 읽고 고정 규칙 적용 → 계산·조건부 항목·고정 표시 갱신 */
  const sync = (): FieldValues => {
    const read = formRef.current ? readFieldValues(formRef.current, config.fields) as FieldValues : {};
    const next = applyLocks(config.fields, { ...values, ...read }, config.lockRules);
    const changes = lockChanges(config.fields, locks, next.locks);
    flushSync(() => {
      setValues(next.values);
      setLocks(next.locks);
      setEverLocked(list => [...new Set([...list, ...lockedIds(next.locks)])]);
    });
    if (changes.length) announce(`바뀐 항목: ${changes.join(', ')}`);
    onValuesChange(next.values);
    return next.values;
  };

  const changed = (field: FieldSpec, value: string) => {
    if (field.type === 'select' && value && errors[field.id]) flushSync(() => setErrors(({ [field.id]: _, ...rest }) => rest));   // 고르면 오류 지움
    sync();
  };

  const next = () => {
    const current = sync();
    const visible = config.fields.filter(field => isFieldVisible(field, config.fields, current));
    const found = validateValues(visible, current);
    flushSync(() => setErrors(found));
    if (Object.keys(found).length) {
      if (formRef.current) focusFirstError(formRef.current);
      return;
    }
    const agreed = config.agree ? checkedAgreements() : [];
    if (config.agree) onAgreedChange(agreed);
    if (config.agree && agreed.length < config.agree.length) {
      flushSync(() => setAgreeError('필수 확인 항목에 모두 체크해 주세요.'));
      const box = document.getElementById('agr');
      box?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      focusElement(box?.querySelector('input:not(:checked)') ?? null);
      return;
    }
    onSubmit(current, agreed);
  };

  const { intro } = config;
  return (
    <>
      {picked && <InfoBox tone="ok mb-14" icon="check"><b>{picked.title}</b>{picked.sub} · {picked.value}</InfoBox>}
      {describe && <InfoBox tone="ok mb-14" icon="check">{describe}</InfoBox>}
      {intro && <InfoBox tone={`${intro.tone} mb-14`} icon={intro.tone === 'warn' ? 'alert' : 'info'}><b>{intro.title}</b>{intro.desc}</InfoBox>}
      {config.fields.length
        ? <div className="card"><h2>입력하기</h2><div className={config.compact ? 'form compact' : 'form'} id="frm" ref={formRef}>
            {config.fields.map(field => (
              <Field key={field.id} field={field} values={values} error={errors[field.id]} hidden={!isFieldVisible(field, config.fields, values)}
                     lock={config.lockRules && field.type === 'radio' ? { value: locks[field.id]?.[0], reason: locks[field.id]?.[1], everLocked: everLocked.includes(field.id) } : undefined}
                     onChange={value => changed(field, value)} />
            ))}
          </div></div>
        : <div id="frm" ref={formRef} />}
      {config.calc && <div className="mt-14" id="calc" aria-live="polite"><CalcBox rows={config.calc(values, pick)} /></div>}
      {config.warn && <InfoBox tone="warn mt-14" icon="alert">{config.warn}</InfoBox>}
      {config.agree && <Agreements items={config.agree} agreed={initialAgreed} error={agreeError} onChange={onAgreedChange} />}
      <div className="navrow">
        <button className="btn lg" data-action="step-prev">이전</button>
        <button className="btn pri lg" id="next" onClick={next}>다음</button>
      </div>
    </>
  );
}

/** 입력 항목이 아닌 값(선택 단계에서 정한 대출금액 등)은 그대로 유지 */
function pickNonField(values: FieldValues, fields: readonly FieldSpec[]): FieldValues {
  const ids = new Set(fields.flatMap(field => [field.id, `${field.id}_zip`, `${field.id}_d`]));
  return Object.fromEntries(Object.entries(values).filter(([key]) => !ids.has(key)));
}

/* 확인 · 인증 · 완료 ------------------------------------------------------ */
interface ConfirmStepProps {
  rows: readonly (readonly [string, string])[];
  calcRows?: readonly CalcRow[];
  summary?: ReactNode;
  onConfirm: () => void;
}

export function ConfirmStep({ rows, calcRows, summary, onConfirm }: ConfirmStepProps) {
  return (
    <>
      {summary}
      <div className="card"><h2>신청 내용을 확인해 주세요</h2><KeyValueList rows={rows} /></div>
      {calcRows && <div className="mt-14"><CalcBox rows={calcRows} /></div>}
      <div className="navrow">
        <button className="btn lg" data-action="step-prev">수정</button>
        <button className="btn pri lg" id="next" onClick={onConfirm}>신청 내용이 맞습니다</button>
      </div>
    </>
  );
}


export function SignStep({ authLevel, onSign }: { authLevel: AuthLevel; onSign: (methodName: string) => void }) {
  const needsExtraAuth = authLevel === 'A2';
  return (
    <>
      <div className="card sign-card">
        <div className="donebox"><div className="ck"><Icon name={needsExtraAuth ? 'lock' : 'key'} /></div></div>
        <h2>{needsExtraAuth ? '전자서명 + 휴대폰 추가인증' : '전자서명'}</h2>
        <p>{needsExtraAuth ? '본인 계좌로 돈이 오가는 업무라 인증서 서명 후 휴대폰 인증을 한 번 더 진행합니다.' : '신청 내용에 인증서로 서명하면 접수가 완료됩니다.'}</p>
        <div className="auth-grid">
          {SIGN_METHODS.map(method => <button key={method.name} className="auth-opt" data-auth={method.name} onClick={() => onSign(method.name)}><b>{method.name}</b><small>{method.desc}</small></button>)}
        </div>
      </div>
      <div className="navrow"><button className="btn lg" data-action="step-prev">이전</button></div>
    </>
  );
}

interface DoneStepProps {
  title: string;
  message: string;
  rows: readonly ReceiptRow[];
  summary?: ReactNode;
  extra?: ReactNode;
  next: readonly [label: string, screenId: string];
}

export function DoneStep({ title, message, rows, summary, extra, next: [label, screenId] }: DoneStepProps) {
  return (
    <>
      <DoneCard title={title} message={message} rows={rows} />
      {summary}
      {extra}
      <div className="navrow inline">
        <button className="btn lg" data-action="nav" data-page="home">홈으로</button>
        <button className="btn pri lg" data-action="open" data-id={screenId}>{label}</button>
      </div>
    </>
  );
}
