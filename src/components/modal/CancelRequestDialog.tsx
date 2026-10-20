/* 신청 취소 확인 */
import { ModalTitle } from './ModalTitle';

export function CancelRequestDialog({ item, onConfirm }: { item: string; onConfirm: () => void }) {
  return (
    <>
      <ModalTitle>신청을 취소할까요?</ModalTitle>
      <p>{item} 신청이 취소됩니다. 취소 후에는 다시 신청해야 합니다.</p>
      <div className="navrow inline mt-0">
        <button className="btn" data-action="close-modal">닫기</button>
        <button className="btn pri" id="cOk" onClick={onConfirm}>취소하기</button>
      </div>
    </>
  );
}
