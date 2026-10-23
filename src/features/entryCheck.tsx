/* 화면에 들어올 때 확인 팝업 (개인정보변경: 개인정보 유출 주의) — 「예」면 메인으로, 「아니요」일 때만 화면 이용 */
import { ConfirmDialog } from '../components/modal/ConfirmDialog';
import { CHANGE_FORMS } from '../screens/changeForms';
import { state } from '../state/store';
import { closeModal, openModal } from '../ui/modal';

/** 새 화면을 연 뒤 호출 (화면 이동·뒤로·로그인 후 이어서 열기 모두). goHome: 「예」를 고르면 메인으로 */
export function checkScreenEntry(goHome: () => void): void {
  const { page, screenId } = state.route;
  const check = page === 'screen' ? CHANGE_FORMS[screenId ?? '']?.entryCheck : undefined;
  if (!check) return;
  openModal(
    <ConfirmDialog title={check.title} message={check.message} noLabel="아니요" closable={false} primary="no"
                   onYes={() => { closeModal(); goHome(); }} onNo={closeModal} />,
    { closable: false, size: 'compact' },   // Esc 로 닫고 넘어가지 못하게 · 작은 팝업(가운데 정렬)
  );
}
