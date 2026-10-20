/* 알림(토스트)·화면낭독기 안내·복사·확인 대화상자 */
import { ConfirmDialog } from '../components/modal/ConfirmDialog';
import { $ } from '../core/dom';
import { withObjectParticle } from '../core/format';
import { closeModal, openModal } from './modal';

/** 짧은 알림: 화면낭독기에도 읽히도록 상태 영역(role=status)에 표시 */
export function toast(message: string): void {
  const element = document.createElement('div');
  element.className = 'toast';
  element.textContent = message;
  $('#toastRegion')?.appendChild(element);
  setTimeout(() => element.remove(), 4000);
}

/** 화면낭독기에만 들리는 안내 (검색 결과 수 · 배정 합계 등) */
export function announce(message: string): void {
  const region = $('#liveRegion');
  if (!region) return;
  region.textContent = '';
  setTimeout(() => { region.textContent = message; }, 50);
}

/** 텍스트 복사 (클립보드 API 불가 시 임시 입력란으로 대체) */
export async function copyText(text: string, label = '내용'): Promise<void> {
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

interface ConfirmOptions {
  title: string;
  message: string;
  yesLabel?: string;
  noLabel?: string;
  onYes?: () => void;
  onNo?: () => void;
}

/** 확인 레이어팝업: X·아니오·Esc → onNo(있으면) 후 닫힘 / 예 → 닫힌 뒤 onYes */
export function confirmDialog({ title, message, yesLabel, noLabel, onYes, onNo }: ConfirmOptions): void {
  let answered = false;
  const answer = (callback?: () => void) => () => { answered = true; closeModal(); callback?.(); };
  openModal(<ConfirmDialog title={title} message={message} yesLabel={yesLabel} noLabel={noLabel} onYes={answer(onYes)} onNo={answer(onNo)} />,
            { onClose: () => { if (!answered) onNo?.(); } });
}
