/* 입력칸 하나 (React): 레이블 · 필수 표시(별표 + 글자) · 도움말 · 오류 문구 연결 (KWCAG 25 · 26번)
   formEngine.js renderField 와 같은 마크업. 값은 비제어(default*)로 두고 readFieldValues 로 읽음 */
import { ACCOUNTS } from '../../data/customerRepository';
import { openZipSearch } from '../../form/formEngine.js';
import { AUTOCOMPLETE, type FieldSpec, type FieldValues } from './fieldSpec';

interface FieldProps {
  field: FieldSpec;
  values: FieldValues;
  error?: string;                        // 검증 오류 문구
  onChange?: (value: string) => void;
}

interface ControlProps {
  field: FieldSpec;
  value: string;
  values: FieldValues;
  invalid: boolean;
  onChange?: (value: string) => void;
}

const GROUP_TYPES = ['radio', 'checks', 'addr'];

function RequiredMark() {
  return <><span className="req" aria-hidden="true">*</span><span className="sr-only">(필수)</span></>;
}

function describedBy(field: FieldSpec): string {
  return [field.help && `h-${field.id}`, `e-${field.id}`].filter(Boolean).join(' ');
}

function inputAttributes(field: FieldSpec, invalid: boolean) {
  return {
    'aria-required': field.optional ? undefined : true,
    'aria-describedby': describedBy(field),
    'aria-invalid': invalid ? true : undefined,
    autoComplete: AUTOCOMPLETE[field.id],
  };
}

const inputClass = (base: string, invalid: boolean) => (invalid ? `${base} bad` : base);

function Control({ field, value, values, invalid, onChange }: ControlProps) {
  const { id } = field;
  switch (field.type) {
    case 'select':
    case 'account': {
      const options = field.type === 'account' ? [...ACCOUNTS, '다른 본인 계좌 등록'] : field.options ?? [];
      return (
        <select className={inputClass('inp', invalid)} id={id} name={id} defaultValue={value || undefined} onChange={event => onChange?.(event.target.value)} {...inputAttributes(field, invalid)}>
          {field.placeholder && <option value="">{field.placeholder}</option>}
          {options.map(option => <option key={option}>{option}</option>)}
        </select>
      );
    }
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
    case 'radio': {
      const options = field.options ?? [];
      const checked = value || options[0];
      return (
        <div className="radios" role="radiogroup" aria-labelledby={`lb-${id}`} aria-describedby={describedBy(field)}>
          {options.map(option => (
            <label key={option}>
              <input type="radio" name={id} value={option} defaultChecked={checked === option} onChange={() => onChange?.(option)} />{option}
            </label>
          ))}
        </div>
      );
    }
    default:
      return (
        <input className={inputClass(field.numeric ? 'inp num' : 'inp', invalid)} type={field.type ?? 'text'} id={id} name={id} defaultValue={value}
               placeholder={field.placeholder ?? ''} inputMode={field.type === 'tel' ? 'tel' : undefined}
               onChange={event => onChange?.(event.target.value)} {...inputAttributes(field, invalid)} />
      );
  }
}

export function Field({ field, values, error = '', onChange }: FieldProps) {
  const value = String(values[field.id] ?? field.value ?? '');
  const required = field.optional ? null : <RequiredMark />;
  const label = GROUP_TYPES.includes(field.type ?? 'text')
    ? <span className="lb" id={`lb-${field.id}`}>{field.label}{required}</span>
    : <label htmlFor={field.id}>{field.label}{required}</label>;

  return (
    <div className={field.wide ? 'fld wide' : 'fld'} data-f={field.id}>
      {label}
      <Control field={field} value={value} values={values} invalid={Boolean(error)} onChange={onChange} />
      {field.help && <span className="help" id={`h-${field.id}`}>{field.help}</span>}
      <span className="err" id={`e-${field.id}`} role="alert">{error}</span>
    </div>
  );
}
