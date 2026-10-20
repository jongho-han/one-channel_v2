/* 공지사항 게시판: 글을 누르면 아래로 내용이 펼쳐지고 다시 누르면 접힘 (한 번에 하나만 펼침) */
import { Fragment, useState } from 'react';
import { flushSync } from 'react-dom';
import type { Notice } from '../../data/noticeRepository';
import { NoticeTag } from '../../pages/HomePage';
import { Icon } from '../Icon';
import { ModalTitle } from './ModalTitle';

/** 문단의 줄바꿈(\n)은 <br> 로 */
const Paragraph = ({ text }: { text: string }) => <p>{text.split('\n').map((line, index) => <Fragment key={index}>{index > 0 && <br />}{line}</Fragment>)}</p>;

export function NoticeBoard({ notices, openId = null }: { notices: readonly Notice[]; openId?: string | null }) {
  const [open, setOpen] = useState<string | null>(openId);
  return (
    <>
      <button className="modal-x" data-action="close-modal" aria-label="공지사항 닫기"><Icon name="close" /></button>
      <ModalTitle>공지사항</ModalTitle>
      <p className="board-count">전체 <b className="num">{notices.length}</b>건</p>
      <ul className="board" role="list">
        {notices.map(notice => {
          const isOpen = open === notice.id;
          return (
            <li className={isOpen ? 'board-item open' : 'board-item'} key={notice.id}>
              <h3><button className="board-q" id={`nq-${notice.id}`} aria-expanded={isOpen} aria-controls={`na-${notice.id}`} data-board={notice.id}
                          onClick={() => flushSync(() => setOpen(isOpen ? null : notice.id))}>
                <NoticeTag type={notice.type} /><span className="board-title">{notice.title}</span><time className="num">{notice.date}</time><Icon name="chev" className="board-chev" />
              </button></h3>
              <div className="board-a" id={`na-${notice.id}`} role="region" aria-labelledby={`nq-${notice.id}`} hidden={!isOpen}>
                {notice.body.map((paragraph, index) => <Paragraph key={index} text={paragraph} />)}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
