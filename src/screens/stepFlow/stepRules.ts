/* T3 단계형 신청 규칙 — 화면과 분리한 순수 로직 */
import type { FieldSpec, FieldValues } from '../../components/form/fieldSpec';
import { displayValue, isFieldVisible } from '../../form/display';

export type StepName = '안내' | '선택' | '입력' | '확인' | '인증' | '완료';

/** 선택 카드 항목 */
export interface PickItem {
  key: string;
  title: string;
  sub: string;
  value: string;
  status?: string;   // 카드 상태 표시 (예: 정상·연체)
  detail?: string;   // 카드 보조 안내 한 줄
}

/** 단계: 안내(guide) 또는 선택(pick) · 입력 · 확인(생략 가능) · 인증 · 완료 */
export function stepsOf(config: { guide?: unknown; pick?: unknown; skipConfirm?: boolean }): StepName[] {
  const first: StepName[] = config.guide ? ['안내'] : config.pick ? ['선택'] : [];
  return [...first, '입력', ...(config.skipConfirm ? [] : ['확인' as const]), '인증', '완료'];
}

export const pickedItem = (config: { pick?: { items?: () => PickItem[] } }, pick: string | null | undefined): PickItem | undefined =>
  config.pick?.items?.().find(item => item.key === pick);

/** 고른 항목 키 목록 (여러 개 고르기면 picks, 아니면 pick 하나) */
export const pickedKeys = (flow: { pick: string | null | undefined; picks?: readonly string[] }): string[] =>
  (flow.picks ? [...flow.picks] : flow.pick ? [flow.pick] : []);

/** 선택 문구에서 항목 이름만 — '납입할 계약을 선택하세요' → '납입할 계약' */
export const pickLabelName = (label = ''): string => label.replace(/을 선택하세요|를 선택하세요/, '');

/** 확인 단계 행: 안내 단계에서 고른 것(guideRow) + 고른 항목('…을 선택하세요' 제외) + 보이는 항목 */
export function confirmRows(
  config: { pick?: { label?: string; multiple?: boolean; items?: () => PickItem[] }; guideRow?: (values: FieldValues) => [string, string]; fields: readonly FieldSpec[] },
  flow: { pick: string | null | undefined; picks?: readonly string[]; values: FieldValues },
): [string, string][] {
  const rows: [string, string][] = config.guideRow ? [config.guideRow(flow.values)] : [];
  if (config.pick?.multiple) {
    const keys = pickedKeys(flow);
    const titles = (config.pick.items?.() ?? []).filter(item => keys.includes(item.key)).map(item => item.title);
    if (titles.length) rows.push([pickLabelName(config.pick.label), `${titles.join(', ')} (${titles.length}건)`]);
  }
  const picked = config.pick?.multiple ? undefined : pickedItem(config, flow.pick);
  if (picked && config.pick?.label) rows.push([pickLabelName(config.pick.label), picked.title]);
  for (const field of config.fields.filter(item => isFieldVisible(item, config.fields, flow.values))) rows.push([field.label, displayValue(field, flow.values) || '-']);
  return rows;
}

/** 완료 제목: 화면 지정 > 지급 업무 > 기본 */
export const doneTitle = (config: { doneTitle?: (values: FieldValues) => string }, bizType: string, values: FieldValues): string =>
  config.doneTitle?.(values) || (bizType === '지급' ? '신청이 완료되었습니다' : '처리가 완료되었습니다');
