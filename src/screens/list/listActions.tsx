/* T2 목록 동작: 신청 취소 · 보완서류 제출 (data-action 에서 호출) */
import { CancelRequestDialog } from '../../components/modal/CancelRequestDialog';
import { $, focusElement } from '../../core/dom';
import { rerenderScreen } from '../../pages/screen';
import { state } from '../../state/store';
import { closeModal, openModal } from '../../ui/modal';
import { toast } from '../../ui/overlay';
import { CONTRACTS } from '../../data/customerRepository';
import { LIST_SCREENS, setRowStatus } from '../listScreens';
import type { ListState } from './ListScreen';

const listState = () => state.screen.list as ListState;
const screenId = () => state.route.screenId ?? '';

export function confirmCancelRequest(rowIndex: number): void {
  const rows = LIST_SCREENS[screenId()].rows;
  const cancel = () => {
    closeModal();
    setRowStatus(screenId(), rowIndex, '취소');
    listState().selectedRow = null;
    rerenderScreen();
    toast('신청을 취소했습니다.');
  };
  openModal(<CancelRequestDialog item={rows[rowIndex][1]} onConfirm={cancel} />);
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

/** 계약조회(CT-02): 카드에서 고른 계약의 상세를 열고 계약 이름으로 초점 */
export function openContractDetail(index: number): void {
  listState().contractIndex = index;
  rerenderScreen();
  focusElement($('#contractTitle'));
}

/** 계약조회(CT-02): 카드 목록으로 돌아가 보던 계약 카드로 초점 */
export function showContractCards(): void {
  const index = listState().contractIndex;
  listState().contractIndex = undefined;
  rerenderScreen();
  focusElement($(`[data-action="contract-open"][data-index="${index}"]`));
}

/** 다른 화면(계약종합현황)에서 계약을 정해 계약조회를 열면 그 계약 상세로 */
export function openContractDetailByNo(no: string): void {
  const index = CONTRACTS.findIndex(contract => contract.no === no);
  if (index >= 0) openContractDetail(index);
}
