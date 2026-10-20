import { focusElement } from '../core/dom';

/** 첫 오류 칸으로 스크롤·초점 (KWCAG 25번 오류 정정) */
export function focusFirstError(form: HTMLElement): void {
  const group = form.querySelector('.err:not(:empty)')?.closest('.fld');
  if (!group) return;
  group.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  focusElement(group.querySelector('input:not([type=hidden]), select, textarea') ?? group);
}
