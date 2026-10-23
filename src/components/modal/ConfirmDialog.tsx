/* 확인 레이어팝업: 우측 상단 X(닫기) + 하단 아니오/예 — closable=false 면 X 없음, primary='no' 면 예 · 아니오(강조) 순서 */
import { Icon } from '../Icon';
import { ModalTitle } from './ModalTitle';

interface ConfirmDialogProps {
  title: string;
  message: string;
  yesLabel?: string;
  noLabel?: string;
  closable?: boolean;           // false: 닫기(X) 없이 예·아니오 중 하나를 골라야 함
  primary?: 'yes' | 'no';       // 강조(오른쪽) 버튼
  onYes: () => void;
  onNo: () => void;
}

export function ConfirmDialog({ title, message, yesLabel = '예', noLabel = '아니오', closable = true, primary = 'yes', onYes, onNo }: ConfirmDialogProps) {
  const yes = <button key="yes" className={primary === 'yes' ? 'btn pri lg' : 'btn lg'} id="dlgYes" onClick={onYes}>{yesLabel}</button>;
  const no = <button key="no" className={primary === 'no' ? 'btn pri lg' : 'btn lg'} id="dlgNo" onClick={onNo}>{noLabel}</button>;
  return (
    <>
      {closable && <button className="modal-x" id="dlgX" aria-label="닫기" onClick={onNo}><Icon name="close" /></button>}
      <ModalTitle>{title}</ModalTitle>
      <p className="dlg-msg">{message}</p>
      <div className="navrow inline mt-0 dlg-btns">
        {primary === 'yes' ? [no, yes] : [yes, no]}
      </div>
    </>
  );
}
