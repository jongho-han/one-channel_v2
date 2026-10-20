/* T2 목록 동작: 신청 취소 · 보완서류 제출 (data-action 에서 호출) */
import { $, escapeHtml, focusElement } from '../../core/dom.js';
import { rerenderScreen } from '../../pages/screen.js';
import { state } from '../../state/store';
import { closeModal, openModal, toast } from '../../ui/overlay.js';
import { LIST_SCREENS, setRowStatus } from '../listScreens';
import type { ListState } from './ListScreen';

const listState = () => state.screen.list as ListState;
const screenId = () => state.route.screenId ?? '';

export function confirmCancelRequest(rowIndex: number): void {
  const rows = LIST_SCREENS[screenId()].rows;
  const modal = openModal(`
    <h2>신청을 취소할까요?</h2>
    <p>${escapeHtml(rows[rowIndex][1])} 신청이 취소됩니다. 취소 후에는 다시 신청해야 합니다.</p>
    <div class="navrow inline mt-0">
      <button class="btn" data-action="close-modal">닫기</button>
      <button class="btn pri" id="cOk">취소하기</button>
    </div>`);
  $('#cOk', modal).onclick = () => {
    closeModal();
    setRowStatus(screenId(), rowIndex, '취소');
    listState().selectedRow = null;
    rerenderScreen();
    toast('신청을 취소했습니다.');
  };
}

/** 보완서류 제출: 선택한 청구 건에 파일이 1개 이상 있어야 제출 */
export function submitDocuments(): void {
  const input = $('#upl') as HTMLInputElement | null;
  const list = listState();
  if (!input?.files?.length) {
    list.uploadError = '보완서류를 1장 이상 올려 주세요.';
    rerenderScreen();
    focusElement($('#upl'));
    return;
  }
  setRowStatus(screenId(), list.selectedRow ?? -1, '처리중');
  Object.assign(list, { selectedRow: null, uploadError: '' });
  rerenderScreen();
  toast('보완서류를 제출했습니다. 알림톡으로 결과를 알려드립니다.');
}
