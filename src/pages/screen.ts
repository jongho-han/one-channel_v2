/* 업무 화면 다시 그리기 · 큰글씨 전환 전 입력 보존 (화면 틀과 본문은 ScreenPage.tsx) */
import { documentTitle } from '../app/router';
import { refreshShell } from '../components/shell/mountShell';
import type { FieldSpec } from '../components/form/fieldSpec';
import { SCREEN_BY_ID } from '../data/menu';
import { readFieldValues } from '../form/fieldValues';
import { CERTIFICATES } from '../screens/certificates';
import { CHANGE_FORMS } from '../screens/changeForms';
import { STEP_FLOWS } from '../screens/stepFlows';
import { state } from '../state/store';
import { applyTableA11y } from '../ui/a11y';

/** 본문을 새로 마운트해 다시 그림 (진행 상태는 유지) */
export function redrawMain(): void {
  state.ui.pageKey++;
  refreshShell();
  const main = document.getElementById('main');
  if (main) applyTableA11y(main);
  document.title = documentTitle();
}

/** 업무 화면 다시 그리기 (진행 상태는 유지) */
export const rerenderScreen = redrawMain;

/** 입력 폼이 있는 화면유형별 설정 */
const FORM_CONFIGS: Record<string, Record<string, { fields?: FieldSpec[] }>> = { T3: STEP_FLOWS, T4: CHANGE_FORMS, T5: CERTIFICATES };

/** 화면을 통째로 다시 그리기 전에 입력 중인 값을 진행 상태에 저장 (큰글씨 전환 시 입력 유지) */
export function saveScreenInputs(): void {
  const { page, screenId } = state.route;
  const flow = state.screen.flow;
  const root = document.getElementById('sbody');
  if (page !== 'screen' || !screenId || !flow || !root) return;
  const fields = FORM_CONFIGS[SCREEN_BY_ID[screenId].screenType]?.[screenId]?.fields;
  if (fields) Object.assign(flow.values ??= {}, readFieldValues(root, fields));
  const agreements = [...root.querySelectorAll<HTMLInputElement>('[data-agree]')];
  if (agreements.length) flow.agreed = agreements.filter(box => box.checked).map(box => Number(box.dataset.agree));
}
