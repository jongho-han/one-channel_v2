/* 입력칸 하나 (React): 레이블 · 필수 표시(별표 + 글자) · 도움말 · 오류 문구 연결 (KWCAG 25 · 26번)
   값은 비제어(default*)로 두고 form/fieldValues 의 readFieldValues 로 읽음
   (고정 규칙이 걸린 라디오만 제어 — 고정값을 화면이 바로 따라가게) */
import { useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { toNumber } from '../../core/format';
import { NEW_ACCOUNT, accountOptions } from '../../data/accountRepository';
import { openAccountRegister } from '../../features/accountRegister';
import { openZipSearch } from '../../form/zipSearch';
import { NOT_APPLICABLE } from '../../form/locks';
import { Icon } from '../Icon';
import { AUTOCOMPLETE, type FieldSpec, type FieldValues } from './fieldSpec';

/** 고정 규칙 상태: value 가 있으면 고정 중, everLocked 이면 안내 칸 유지(숨김) */
export interface FieldLock {
  value?: string;
  reason?: string;
  everLocked: boolean;
}

interface FieldProps {
  field: FieldSpec;
  values: FieldValues;
  error?: string;                        // 검증 오류 문구
  hidden?: boolean;                      // 조건부 항목이 숨겨진 상태
  lock?: FieldLock;
  onChange?: (value: string) => void;
}

interface ControlProps {
  field: FieldSpec;
  value: string;
  values: FieldValues;
  invalid: boolean;
  lock?: FieldLock;
  onChange?: (value: string) => void;
}

const GROUP_TYPES = ['radio', 'checks', 'addr'];

function RequiredMark() {
  return <><span className="req" aria-hidden="true">*</span><span className="sr-only">(필수)</span></>;
}

function describedBy(field: FieldSpec, extra = ''): string {
  return [field.help && `h-${field.id}`, `e-${field.id}`, extra].filter(Boolean).join(' ');
}

function inputAttributes(field: FieldSpec, invalid: boolean, extraDescribedBy = '') {
  return {
    'aria-required': field.optional ? undefined : true,
    'aria-describedby': describedBy(field, extraDescribedBy),
    'aria-invalid': invalid ? true : undefined,
    autoComplete: AUTOCOMPLETE[field.id],
  };
}

const inputClass = (base: string, invalid: boolean) => (invalid ? `${base} bad` : base);
const formatAmount = (digits: string) => (digits ? Number(digits).toLocaleString() : '');

/** 금액: 숫자만 받아 천 단위로 표시, 빠른 금액 버튼 (최대 금액까지) */
function MoneyControl({ field, value, invalid, onChange }: ControlProps) {
  const { id } = field;
  const typed = (event: FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    input.value = formatAmount(input.value.replace(/[^\d]/g, ''));
    onChange?.(input.value);
  };
  const add = (_event: MouseEvent<HTMLButtonElement>, amount: number | 'max') => {
    const input = document.getElementById(id) as HTMLInputElement | null;
    if (!input) return;
    const max = Number(input.dataset.max) || Infinity;
    const next = amount === 'max' ? max : Math.min(toNumber(input.value) + amount, max);
    input.value = next.toLocaleString();
    onChange?.(input.value);
  };
  return (
    <>
      <div className="money">
        <input className={inputClass('inp num', invalid)} id={id} name={id} inputMode="numeric" defaultValue={Number(value) ? Number(value).toLocaleString() : ''} placeholder="0"
               data-money="" data-max={field.max ?? ''} onInput={typed} {...inputAttributes(field, invalid)} />
        <span className="u" aria-hidden="true">원</span>
      </div>
      {field.quick && (
        <div className="chips quick-amounts">
          {field.quick.map(amount => (
            <button type="button" className="chip" key={amount} data-add={amount} data-for={id} onClick={event => add(event, amount)}
                    aria-label={amount === 'max' ? '최대 금액 입력' : `+${amount / 10000}만 (${(amount / 10000).toLocaleString()}만원 더하기)`}>
              {amount === 'max' ? '최대' : `+${amount / 10000}만`}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/** 파일: 고른 파일 이름을 칩으로 */
function FileControl({ field, invalid, onChange }: ControlProps) {
  const { id } = field;
  const [names, setNames] = useState<string[]>([]);
  return (
    <>
      <label className="file-drop" htmlFor={id}><Icon name="upload" /><b>사진 찍기 또는 파일 선택</b><small>{field.placeholder || 'JPG·PNG·PDF, 최대 20장'}</small>
        <input type="file" id={id} name={id} multiple accept="image/*,.pdf" {...inputAttributes(field, invalid, `fl-${id}`)}
               onChange={event => { const files = [...(event.currentTarget.files ?? [])]; flushSync(() => setNames(files.map(file => file.name))); onChange?.(''); }} />
      </label>
      <div className="files" id={`fl-${id}`} aria-live="polite">{names.map(name => <span className="fchip" key={name}>{name}</span>)}</div>
    </>
  );
}

/** 라디오: 고정 규칙이 있으면 고정값만 보이고 선택 불가, 풀려 있으면 '해당없음'은 숨김 */
function RadioControl({ field, value, lock, onChange }: ControlProps) {
  const { id } = field;
  const options = field.options ?? [];
  const locked = lock?.value !== undefined;
  const checked = locked ? lock?.value : value && value !== NOT_APPLICABLE ? value : lock ? options[0] : value || options[0];
  const describedByIds = [describedBy(field), lock?.everLocked ? `lk-${id}` : ''].filter(Boolean).join(' ');
  return (
    <div className="radios" role="radiogroup" aria-labelledby={`lb-${id}`} aria-describedby={describedByIds}>
      {options.map(option => {
        const labelHidden = lock ? (locked ? option !== lock.value : option === NOT_APPLICABLE) : undefined;
        return (
          <label key={option} hidden={labelHidden || undefined}>
            {lock
              ? <input type="radio" name={id} value={option} checked={checked === option} disabled={locked || undefined} onChange={() => onChange?.(option)} />
              : <input type="radio" name={id} value={option} defaultChecked={checked === option} onChange={() => onChange?.(option)} />}
            {option}
          </label>
        );
      })}
    </div>
  );
}

/** 계좌 선택: 「다른 본인 계좌 등록」을 고르면 등록 창 (취소하면 직전 계좌로 되돌림) */
function AccountControl({ field, value, invalid, onChange }: ControlProps) {
  const options = accountOptions();
  const previous = useRef(value || options[0]);
  const change = (event: ChangeEvent<HTMLSelectElement>) => {
    const select = event.currentTarget;
    if (select.value === NEW_ACCOUNT) { openAccountRegister(select, previous.current); return; }
    previous.current = select.value;
    onChange?.(select.value);
  };
  return (
    <select className={inputClass('inp', invalid)} id={field.id} name={field.id} defaultValue={value || undefined} onChange={change} {...inputAttributes(field, invalid)}>
      {options.map(option => <option key={option}>{option}</option>)}
    </select>
  );
}

function Control(props: ControlProps) {
  const { field, value, values, invalid, onChange } = props;
  const { id } = field;
  switch (field.type) {
    case 'account':
      return <AccountControl {...props} />;
    case 'select': {
      const options = field.options ?? [];
      return (
        <select className={inputClass('inp', invalid)} id={id} name={id} defaultValue={value || undefined} onChange={event => onChange?.(event.target.value)} {...inputAttributes(field, invalid)}>
          {field.placeholder && <option value="">{field.placeholder}</option>}
          {options.map(option => <option key={option}>{option}</option>)}
        </select>
      );
    }
    case 'radio':
      return <RadioControl {...props} />;
    case 'checks': {
      const checked = Array.isArray(values[id]) ? values[id] as string[] : [];
      return (
        <div className={field.inline ? 'checks inline' : 'checks'} role="group" aria-labelledby={`lb-${id}`} aria-describedby={describedBy(field)}>
          {field.options?.map(option => (
            <label key={option}><input type="checkbox" name={id} value={option} defaultChecked={checked.includes(option)} onChange={() => onChange?.(option)} /><span>{option}</span></label>
          ))}
        </div>
      );
    }
    case 'money':
      return <MoneyControl {...props} />;
    case 'file':
      return <FileControl {...props} />;
    case 'addr':
      return (
        <>
          <div className="inrow">
            <input className="inp num zip" id={`${id}_zip`} name={`${id}_zip`} defaultValue={String(values[`${id}_zip`] ?? field.zip ?? '')} readOnly
                   aria-label={`${field.label} 우편번호`} autoComplete="postal-code" />
            <button type="button" className="btn" data-zip={id} aria-label={`${field.label} 우편번호 검색`}
                    onClick={event => openZipSearch(event.currentTarget.closest('.fld'), id)}>우편번호 검색</button>
          </div>
          <input className={inputClass('inp', invalid)} id={id} name={id} defaultValue={value} aria-label={`${field.label} 기본주소`} autoComplete="street-address"
                 aria-required={field.optional ? undefined : true} aria-describedby={`e-${id}`} aria-invalid={invalid ? true : undefined} />
          <input className="inp" id={`${id}_d`} name={`${id}_d`} placeholder="상세주소" defaultValue={String(values[`${id}_d`] ?? '')}
                 aria-label={`${field.label} 상세주소`} autoComplete="address-line2" />
        </>
      );
    case 'textarea':
      return (
        <textarea className={inputClass('inp area', invalid)} id={id} name={id} rows={4} defaultValue={value} placeholder={field.placeholder ?? ''}
                  onChange={event => onChange?.(event.target.value)} {...inputAttributes(field, invalid)} />
      );
    default:
      return (
        <input className={inputClass(field.numeric ? 'inp num' : 'inp', invalid)} type={field.type ?? 'text'} id={id} name={id} defaultValue={value}
               placeholder={field.placeholder ?? ''} inputMode={field.type === 'tel' ? 'tel' : undefined}
               onChange={event => onChange?.(event.target.value)} {...inputAttributes(field, invalid)} />
      );
  }
}

export function Field({ field, values, error = '', hidden = false, lock, onChange }: FieldProps) {
  const raw = values[field.id] ?? field.value ?? '';
  const value = Array.isArray(raw) ? '' : String(raw);
  const required = field.optional ? null : <RequiredMark />;
  const label = GROUP_TYPES.includes(field.type ?? 'text')
    ? <span className="lb" id={`lb-${field.id}`}>{field.label}{required}</span>
    : <label htmlFor={field.id}>{field.label}{required}</label>;
  const locked = lock?.value !== undefined;
  const className = ['fld', field.wide && 'wide', locked && 'locked'].filter(Boolean).join(' ');

  return (
    <div className={className} data-f={field.id} hidden={hidden || undefined}>
      {label}
      <Control field={field} value={value} values={values} invalid={Boolean(error)} lock={lock} onChange={onChange} />
      {field.help && <span className="help" id={`h-${field.id}`}>{field.help}</span>}
      <span className="err" id={`e-${field.id}`} role="alert">{error}</span>
      {lock?.everLocked && <span className="help lock-note" id={`lk-${field.id}`} hidden={!locked || undefined}>{locked ? `${lock.reason} 고정` : ''}</span>}
    </div>
  );
}
