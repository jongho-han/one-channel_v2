/* 확인 레이어팝업: 우측 상단 X(닫기) + 하단 아니오/예 */
import { Icon } from '../Icon';
import { ModalTitle } from './ModalTitle';

interface ConfirmDialogProps {
  title: string;
  message: string;
  yesLabel?: string;
  noLabel?: string;
  onYes: () => void;
  onNo: () => void;
}

export function ConfirmDialog({ title, message, yesLabel = '예', noLabel = '아니오', onYes, onNo }: ConfirmDialogProps) {
  return (
    <>
      <button className="modal-x" id="dlgX" aria-label="닫기" onClick={onNo}><Icon name="close" /></button>
      <ModalTitle>{title}</ModalTitle>
      <p>{message}</p>
      <div className="navrow inline mt-0 dlg-btns">
        <button className="btn lg" id="dlgNo" onClick={onNo}>{noLabel}</button>
        <button className="btn pri lg" id="dlgYes" onClick={onYes}>{yesLabel}</button>
      </div>
    </>
  );
}
