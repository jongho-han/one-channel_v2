/* 모달 레이어 (#layer React 루트): 제목으로 이름 붙이기, 초점을 안으로, Tab 순환, Esc 닫기, 닫으면 연 곳으로 초점 복귀 (KWCAG 9 · 30번) */
import type { ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import { FOCUSABLE } from '../core/dom';

export interface ModalOptions {
  closable?: boolean;     // false 이면 Esc 로 닫히지 않음 (인증 대기 중)
  size?: string;          // 'wide' 등 모달 크기 클래스
  onClose?: () => void;   // 닫힐 때 한 번 실행할 정리 작업
}

let root: Root | null = null;
let container: HTMLElement | null = null;
let current: (ModalOptions & { content: ReactNode; key: number }) | null = null;
let openCount = 0;   // 열 때마다 내용을 새로 마운트 (이전 상태 초기화)
let returnFocus: Element | null = null;

function ModalFrame({ content, size }: { content: ReactNode; size?: string }) {
  return (
    <div className="dim" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div className={size ? `modal ${size}` : 'modal'}>{content}</div>
    </div>
  );
}

const draw = () => flushSync(() => root?.render(current ? <ModalFrame key={current.key} content={current.content} size={current.size} /> : null));

export function mountModalLayer(element: HTMLElement): void {
  root?.unmount();
  container = element;
  root = createRoot(element);
}

export const isModalOpen = (): boolean => current !== null;

/** 모달 열기 — 이미 열려 있으면 내용만 바꾸고, 초점은 처음 연 곳으로 돌아감 */
export function openModal(content: ReactNode, options: ModalOptions = {}): void {
  if (!current) returnFocus = document.activeElement;
  current?.onClose?.();
  current = { ...options, content, key: ++openCount };
  draw();
  const dialog = container?.querySelector('.dim');
  if (!dialog) return;
  const title = dialog.querySelector<HTMLElement>('h2');
  const target = dialog.querySelector<HTMLElement>(FOCUSABLE) ?? title;
  if (target === title) title?.setAttribute('tabindex', '-1');
  target?.focus();
}

export function closeModal(): void {
  if (!current) return;
  const { onClose } = current;
  current = null;
  draw();
  onClose?.();
  const target = returnFocus;
  returnFocus = null;
  if (target instanceof HTMLElement && document.contains(target)) target.focus();
}

/** 화면에 보이는 초점 이동 가능 요소 (숨긴 영역 제외) */
const visibleControls = (dialog: Element) =>
  [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(element => !element.closest('[hidden]'));

/** 모달 안에서 Tab 순환 · Esc 닫기 — 처리했으면 true */
export function handleModalKeys(event: KeyboardEvent): boolean {
  const dialog = container?.querySelector('.dim');
  if (!current || !dialog) return false;
  if (event.key === 'Escape') {
    if (current.closable === false) return false;
    closeModal();
    return true;
  }
  if (event.key !== 'Tab') return false;
  const controls = visibleControls(dialog);
  if (!controls.length) { event.preventDefault(); return true; }
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  return true;
}
