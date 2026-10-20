/* 공지사항 게시판 레이어팝업 */
import { NoticeBoard } from '../components/modal/NoticeBoard';
import { NOTICES } from '../data/noticeRepository';
import { openModal } from '../ui/modal';

/** openId: 메인에서 고른 글 — 펼친 상태로 열고 그 글로 이동 */
export function openNoticeBoard(openId: string | null = null): void {
  openModal(<NoticeBoard notices={NOTICES} openId={openId} />, { size: 'wide' });
  if (!openId) return;
  const target = document.getElementById(`nq-${openId}`);
  target?.focus();
  target?.closest('.board-item')?.scrollIntoView({ block: 'nearest' });
}
