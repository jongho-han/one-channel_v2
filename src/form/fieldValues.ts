/* 화면에 그려진 입력칸에서 값 읽기 (React 폼은 비제어 입력 + 이 함수로 값을 모음, 큰글씨 전환 시 보존에도 사용) */
import type { FieldSpec, FieldValues } from '../components/form/fieldSpec';
import { toNumber } from '../core/format';

export function readFieldValues(root: ParentNode, fields: readonly FieldSpec[]): FieldValues {
  const values: FieldValues = {};
  const input = (selector: string) => root.querySelector<HTMLInputElement>(selector);
  for (const field of fields) {
    const { id } = field;
    if (!root.querySelector(`[data-f="${id}"]`)) continue;   // 화면에 없는 칸은 읽지 않음 (다른 단계에서 값이 지워지지 않게)
    switch (field.type) {
      case 'radio':  values[id] = input(`input[name="${id}"]:checked`)?.value ?? ''; break;
      case 'checks': values[id] = [...root.querySelectorAll<HTMLInputElement>(`input[name="${id}"]:checked`)].map(box => box.value); break;
      case 'money':  values[id] = toNumber(input(`#${id}`)?.value ?? 0); break;
      case 'file':   values[id] = [...(input(`#${id}`)?.files ?? [])].map(file => file.name); break;
      case 'addr':
        for (const suffix of ['', '_zip', '_d']) {
          const element = input(`#${id}${suffix}`);
          if (element) values[id + suffix] = element.value;
        }
        break;
      default:       values[id] = root.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)?.value ?? '';
    }
  }
  return values;
}
