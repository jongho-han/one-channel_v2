import { $, $$, each, escapeHtml } from '../core/dom.js';
import { NOTICES } from '../data/noticeRepository';
import { icon } from '../ui/icons.js';
import { openModal } from '../ui/overlay.js';

/* 공지사항 게시판 레이어팝업 (모달은 아직 HTML 문자열로 그림) */
const noticeTag = type => `<span class="tag ${type === '공지' ? 'n' : 'i'}">${type}</span>`;

/** 공지사항 게시판 레이어팝업: 글을 누르면 아래로 내용이 펼쳐지고 다시 누르면 접힘 (한 번에 하나만 펼침)
    openId: 메인에서 고른 글 — 펼친 상태로 열고 그 글로 이동 */
export function openNoticeBoard(openId = null) {
  const dialog = openModal(`
    <button class="modal-x" data-action="close-modal" aria-label="공지사항 닫기">${icon('close')}</button>
    <h2>공지사항</h2>
    <p class="board-count">전체 <b class="num">${NOTICES.length}</b>건</p>
    <ul class="board" role="list">
      ${each(NOTICES, notice => `
        <li class="board-item">
          <h3><button class="board-q" id="nq-${notice.id}" aria-expanded="false" aria-controls="na-${notice.id}" data-board="${notice.id}">
            ${noticeTag(notice.type)}<span class="board-title">${notice.title}</span><time class="num">${notice.date}</time>${icon('chev', 'board-chev')}
          </button></h3>
          <div class="board-a" id="na-${notice.id}" role="region" aria-labelledby="nq-${notice.id}" hidden>
            ${each(notice.body, paragraph => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)}
          </div>
        </li>`)}
    </ul>`, { size: 'wide' });

  const toggle = (id, open) => {
    const button = $(`#nq-${id}`, dialog);
    button.setAttribute('aria-expanded', open);
    button.closest('.board-item').classList.toggle('open', open);
    $(`#na-${id}`, dialog).hidden = !open;
  };
  $$('[data-board]', dialog).forEach(button => {
    button.onclick = () => {
      const willOpen = button.getAttribute('aria-expanded') !== 'true';
      NOTICES.forEach(notice => toggle(notice.id, false));
      if (willOpen) toggle(button.dataset.board, true);
    };
  });

  if (openId) {
    toggle(openId, true);
    const target = $(`#nq-${openId}`, dialog);
    target.focus();
    target.closest('.board-item').scrollIntoView({ block: 'nearest' });
  }
}
