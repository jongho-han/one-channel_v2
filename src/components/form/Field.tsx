/* 입력칸 하나 (React): 레이블 · 필수 표시(별표 + 글자) · 도움말 · 오류 문구 연결 (KWCAG 25 · 26번)
   formEngine.js renderField 와 같은 마크업. 값은 비제어(default*)로 두고 readFieldValues 로 읽음 */
import { AUTOCOMPLETE, type FieldSpec, type FieldValues } from './fieldSpec';

interface FieldProps {
  field: FieldSpec;
  values: FieldValues;
  onChange?: (value: string) => void;
}

const GROUP_TYPES = ['radio', 'checks', 'addr'];

function RequiredMark() {
  return <><span className="req" aria-hidden="true">*</span><span className="sr-only">(필수)</span></>;
}

function describedBy(field: FieldSpec): string {
  return [field.help && `h-${field.id}`, `e-${field.id}`].filter(Boolean).join(' ');
}

function inputAttributes(field: FieldSpec) {
  return {
    'aria-required': field.optional ? undefined : true,
    'aria-describedby': describedBy(field),
    autoComplete: AUTOCOMPLETE[field.id],
  };
}

function Control({ field, value, onChange }: { field: FieldSpec; value: string; onChange?: (value: string) => void }) {
  const { id } = field;
  switch (field.type) {
    case 'select':
      return (
        <select className="inp" id={id} name={id} defaultValue={value || undefined} onChange={event => onChange?.(event.target.value)} {...inputAttributes(field)}>
          {field.placeholder && <option value="">{field.placeholder}</option>}
          {field.options?.map(option => <option key={option}>{option}</option>)}
        </select>
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
        <input className={field.numeric ? 'inp num' : 'inp'} type={field.type ?? 'text'} id={id} name={id} defaultValue={value}
               placeholder={field.placeholder ?? ''} inputMode={field.type === 'tel' ? 'tel' : undefined}
               onChange={event => onChange?.(event.target.value)} {...inputAttributes(field)} />
      );
  }
}

export function Field({ field, values, onChange }: FieldProps) {
  const value = String(values[field.id] ?? field.value ?? '');
  const required = field.optional ? null : <RequiredMark />;
  const label = GROUP_TYPES.includes(field.type ?? 'text')
    ? <span className="lb" id={`lb-${field.id}`}>{field.label}{required}</span>
    : <label htmlFor={field.id}>{field.label}{required}</label>;

  return (
    <div className={field.wide ? 'fld wide' : 'fld'} data-f={field.id}>
      {label}
      <Control field={field} value={value} onChange={onChange} />
      {field.help && <span className="help" id={`h-${field.id}`}>{field.help}</span>}
      <span className="err" id={`e-${field.id}`} role="alert" />
    </div>
  );
}
