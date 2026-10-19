import { $, $$, FOCUSABLE } from '../core/dom.js';
import { withObjectParticle } from '../core/format';
import { icon } from './icons.js';

/** 짧은 알림: 화면낭독기에도 읽히도록 상태 영역(role=status)에 표시 */
export function toast(message) {
  const element = document.createElement('div');
  element.className = 'toast';
  element.textContent = message;
  $('#toastRegion').appendChild(element);
  setTimeout(() => element.remove(), 4000);
}

/** 화면낭독기에만 들리는 안내 (검색 결과 수 · 배정 합계 등) */
export function announce(message) {
  const region = $('#liveRegion');
  region.textContent = '';
  setTimeout(() => { region.textContent = message; }, 50);
}


const modalState = { returnFocus: null, closable: true, onClose: null };

/** 모달 열기: 제목으로 이름을 붙이고, 초점을 안으로 옮기고, Tab 키가 밖으로 나가지 않게 함 (KWCAG 9 · 30번)
    closable=false 이면 Esc로 닫히지 않음 (인증 대기 중) */
export function openModal(innerHtml, { closable = true, size = '' } = {}) {
  const isAlreadyOpen = Boolean($('#layer .dim'));
  if (!isAlreadyOpen) modalState.returnFocus = document.activeElement;
  modalState.closable = closable;

  $('#layer').innerHTML = `<div class="dim" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><div class="modal ${size}">${innerHtml}</div></div>`;
  const dialog = $('#layer').firstElementChild;
  const title = $('h2', dialog);
  if (title) title.id = 'modalTitle';

  const focusTarget = $(FOCUSABLE, dialog) || title;
  if (focusTarget === title) title?.setAttribute('tabindex', '-1');
  focusTarget?.focus();
  return dialog;
}

/** 텍스트 복사 (클립보드 API 불가 시 임시 입력란으로 대체) */
export async function copyText(text, label = '내용') {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const temp = Object.assign(document.createElement('textarea'), { value: text });
    temp.setAttribute('readonly', '');
    temp.style.cssText = 'position:fixed;opacity:0;';
    document.body.append(temp);
    temp.select();
    document.execCommand('copy');
    temp.remove();
  }
  toast(`${withObjectParticle(label)} 복사했습니다.`);
}

/** 확인 레이어팝업: 우측 상단 X(닫기) + 하단 아니오/예 버튼
    X·아니오·Esc → onNo(있으면) 후 닫힘 / 예 → 닫힌 뒤 onYes */
export function confirmDialog({ title, message, yesLabel = '예', noLabel = '아니오', onYes, onNo }) {
  const dialog = openModal(`
    <button class="modal-x" id="dlgX" aria-label="닫기">${icon('close')}</button>
    <h2>${title}</h2>
    <p>${message}</p>
    <div class="navrow inline mt-0 dlg-btns">
      <button class="btn lg" id="dlgNo">${noLabel}</button>
      <button class="btn pri lg" id="dlgYes">${yesLabel}</button>
    </div>`);
  const dismiss = () => { closeModal(); onNo?.(); };
  $('#dlgX', dialog).onclick = dismiss;
  $('#dlgNo', dialog).onclick = dismiss;
  $('#dlgYes', dialog).onclick = () => { closeModal(); onYes?.(); };
  return dialog;
}

/** 모달이 닫힐 때 한 번 실행할 정리 작업 (타이머 해제 등) */
export function onModalClose(callback) {
  modalState.onClose = callback;
}

export function closeModal() {
  $('#layer').innerHTML = '';
  modalState.onClose?.();
  modalState.onClose = null;
  const target = modalState.returnFocus;
  modalState.returnFocus = null;
  if (target && document.contains(target)) target.focus();
}

/** 모달 안에서 Tab 순환 · Esc 닫기 */
export function handleModalKeys(event) {
  const dialog = $('#layer .dim');
  if (!dialog) return false;
  if (event.key === 'Escape' && modalState.closable) { closeModal(); return true; }
  if (event.key !== 'Tab') return false;

  const controls = $$(FOCUSABLE, dialog).filter(element => element.offsetParent !== null);
  if (!controls.length) { event.preventDefault(); return true; }
  const [first, last] = [controls[0], controls[controls.length - 1]];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  return true;
}
