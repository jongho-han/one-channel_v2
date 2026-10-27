/* 폼 필드 정의 */
export type FieldType = 'text' | 'tel' | 'email' | 'date' | 'select' | 'radio' | 'checks' | 'money' | 'account' | 'file' | 'addr' | 'textarea';

export interface FieldSpec {
  id: string;
  label: string;
  type?: FieldType;               // 기본 text
  options?: readonly string[];    // select · radio · checks
  value?: string;                 // 기본값
  placeholder?: string;
  help?: string;
  optional?: boolean;             // true 이면 필수 아님
  numeric?: boolean;              // 숫자 글꼴(.num)
  wide?: boolean;
  zip?: string;                   // addr: 우편번호 기본값
  max?: number;                   // money: 최대 금액
  min?: number;                   // money: 최소 금액
  quick?: readonly (number | 'max')[];   // money: 빠른 금액 버튼
  inline?: boolean;               // checks: 가로 배치
  showWhen?: { field: string; value: string };   // 다른 항목 값이 맞을 때만 보이고 검증
  other?: { option: string; placeholder?: string };   // radio: 이 선택지 오른쪽 직접 입력칸 (고르면 입력·필수)
}

/** 라디오 직접 입력칸 id (값도 이 키로 저장) */
export const otherInputId = (field: Pick<FieldSpec, 'id'>): string => `${field.id}Etc`;

/** 입력값: 항목 id → 값 (checks·file 은 배열) */
export type FieldValues = Record<string, string | string[] | number | undefined>;

/** 본인 정보 입력칸의 자동완성 값 (KWCAG 28번 반복 입력 정보) */
export const AUTOCOMPLETE: Readonly<Record<string, string>> = { mob: 'tel', telH: 'tel', telW: 'work tel', mail: 'email' };

/** 날짜 입력(YYYY-MM-DD) → 화면 표기(YYYY.MM.DD) */
export const toDotDate = (value: string): string => value.replace(/-/g, '.');
