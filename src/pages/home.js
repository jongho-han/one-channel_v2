import { openScreen } from '../app/router.js';
import { APP } from '../core/config.js';
import { $, $$, each, escapeHtml, when } from '../core/dom.js';
import { CONTRACTS, USER } from '../data/customerRepository.js';
import { HOME } from '../data/homeContent.js';
import { MENU_GROUPS, searchScreens } from '../data/menuRepository.js';
import { HOME_NOTICE_COUNT, NOTICES } from '../data/noticeRepository.js';
import { LOGIN_METHODS } from '../services/auth.js';
import { state } from '../state/store.js';
import { icon } from '../ui/icons.js';
import { announce, openModal } from '../ui/overlay.js';

/* 메인 -------------------------------------------------------------- */
export function renderHomePage() {
  $('#main').innerHTML = [
    homeHeroSection(),
    when(state.isLoggedIn, homeTodoSection()),
    homeQuickSection(),
    homeLifeGuideSection(),
    homeNoticeSection(),
  ].join('');
  bindHomeSearch();
}

function homeHeroSection() {
  return `
  <section class="hero"><div class="wrap">
    <div class="shortbar">
      <span>자주 이용하신다면 바로가기를 만들어 두세요.</span>
      <button class="shortbtn" data-action="open-shortcut"><span class="ap" aria-hidden="true">iM</span><span class="sl">바로가기 추가</span></button>
    </div>
    <div>
      <div class="eyebrow">iM라이프 사이버창구</div>
      <h1>${state.isLoggedIn ? `${USER.name}님, <em>무엇을 도와드릴까요?</em>` : '보험 업무, <em>찾지 말고 물어보세요</em>'}</h1>
      <p class="lead">“병원비 청구”, “주소 변경”, “연말정산”처럼 하고 싶은 일을 입력하면 바로 그 화면으로 안내합니다.</p>
      <div class="search" role="search">
        <span class="search-icon">${icon('search')}</span>
        <label class="sr-only" for="q">하고 싶은 업무 검색</label>
        <input id="q" type="search" placeholder="예: 병원비 청구, 대출 이자, 납입증명서" autocomplete="off"
               role="combobox" aria-autocomplete="list" aria-controls="sugList" aria-expanded="false" aria-describedby="qHint">
        <span class="sr-only" id="qHint">입력하면 추천 업무가 아래에 나타나며, 위아래 화살표로 고르고 Enter로 이동합니다.</span>
        <button class="btn pri" id="qbtn">찾기</button>
        <div class="suggest" id="sug" hidden></div>
      </div>
      <div class="chips"><span>많이 찾는 업무</span>
        ${each(HOME.popular, ([label, id]) => `<button class="chip" data-action="open" data-id="${id}">${label}</button>`)}
      </div>
    </div>
    ${state.isLoggedIn ? mySummaryCard() : guestLoginCard()}
  </div></section>`;
}

function mySummaryCard() {
  const monthlyPremium = CONTRACTS.filter(c => c.status === '정상').reduce((sum, c) => sum + c.premium, 0);
  const totalLoan = CONTRACTS.reduce((sum, c) => sum + c.loan, 0);
  return `
  <div class="login-card my-summary">
    <div class="hi">${USER.name}님의 보험<small>${APP.today} 기준</small></div>
    <dl class="kv3">
      <div><dt>보유계약</dt><dd class="num">${CONTRACTS.length}건</dd></div>
      <div><dt>이번 달 보험료</dt><dd class="num">${(monthlyPremium / 10000).toFixed(1)}만원</dd></div>
      <div><dt>대출 잔액</dt><dd class="num">${totalLoan ? `${Math.round(totalLoan / 10000).toLocaleString()}만원` : '없음'}</dd></div>
    </dl>
    <button class="btn pri block" data-action="open" data-id="CT-01">계약종합현황 보기</button>
  </div>`;
}

function guestLoginCard() {
  return `
  <div class="login-card login-guest">
    <h2>로그인하고 바로 처리하세요</h2>
    <p>조회·청구·대출·증명서 발급을 한 번의 인증으로 이용할 수 있습니다.</p>
    <div class="auth-grid">
      ${each(LOGIN_METHODS, method => `<button class="auth-opt" data-action="login" data-method="${method.name}"><b>${method.name}</b><small>${method.desc}</small></button>`)}
    </div>
    <div class="foot"><span>로그인 없이 이용</span><button data-action="open" data-id="CS-01">청구서류 내려받기</button></div>
  </div>`;
}

function homeTodoSection() {
  return `
  <section class="sec"><div class="wrap">
    <div class="sec-h"><div><h2>지금 확인이 필요해요</h2><p>${USER.name}님 계약에서 처리할 일을 모았습니다.</p></div></div>
    <div class="todo">
      ${each(HOME.todos, todo => `
        <button class="todo-card" data-action="open" data-id="${todo.id}">
          <span class="dot ${todo.tone}">${icon(todo.icon)}</span>
          <span><b>${todo.title}</b><span>${todo.desc}</span></span>
        </button>`)}
    </div>
  </div></section>`;
}

function homeQuickSection() {
  return `
  <section class="sec"><div class="wrap">
    <div class="sec-h"><div><h2>자주 찾는 업무</h2></div><button class="link" data-action="nav" data-page="all">전체메뉴 ${icon('chev')}</button></div>
    <div class="quick">
      ${each(HOME.quickTasks, ([id, label, iconName]) => `<button class="q" data-action="open" data-id="${id}"><span class="ic">${icon(iconName)}</span>${label}</button>`)}
    </div>
  </div></section>`;
}

function homeLifeGuideSection() {
  return `
  <section class="sec life-guide"><div class="wrap">
    <div class="sec-h"><div><h2>이럴 땐 이렇게</h2><p>상황을 고르면 필요한 업무를 순서대로 안내합니다.</p></div></div>
    <div class="life">
      ${each(HOME.lifeGuides, ([title, desc, links]) => `
        <div class="life-card"><h3>${title}</h3><p>${desc}</p>
          <div class="go">${each(links, ([label, id]) => `<button data-action="open" data-id="${id}">${label}${icon('chev')}</button>`)}</div>
        </div>`)}
    </div>
  </div></section>`;
}

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

function homeNoticeSection() {
  return `
  <section class="sec last"><div class="wrap two">
    <div class="panel">
      <h2>공지사항 <button class="link" data-action="open-notices" aria-label="공지사항 더보기">더보기 ${icon('chev')}</button></h2>
      <ul class="notice-list">
        ${each(NOTICES.slice(0, HOME_NOTICE_COUNT), notice => `
          <li><button class="notice-link" data-action="open-notices" data-notice="${notice.id}" aria-haspopup="dialog">
            <span>${noticeTag(notice.type)}${notice.title}</span><time>${notice.date}</time></button></li>`)}
      </ul>
    </div>
    <div class="panel cc">
      <h2>고객센터</h2>
      <div class="tel num">1588-4770</div>
      <p>평일 09:00~18:00 · 사고보험금 접수 24시간(모바일)</p>
      <div class="row">
        <button class="btn sm" data-action="open" data-id="CS-01">청구서류 받기</button>
      </div>
    </div>
  </div></section>`;
}



function bindHomeSearch() {
  const input = $('#q');
  const suggest = $('#sug');
  let results = [];
  let highlighted = -1;

  const drawSuggestions = () => {
    results = searchScreens(input.value);
    highlighted = -1;
    const hasQuery = Boolean(input.value.trim());
    suggest.hidden = !results.length && !hasQuery;
    input.setAttribute('aria-expanded', results.length > 0);
    input.removeAttribute('aria-activedescendant');
    suggest.innerHTML = results.length
      ? `<div role="listbox" id="sugList" aria-label="추천 업무">${each(results, (screen, index) => `
          <button role="option" id="sug-${index}" aria-selected="false" tabindex="-1" data-action="open" data-id="${screen.id}">
            ${icon(MENU_GROUPS[screen.depth1].icon)}<span>${escapeHtml(screen.depth3)}</span>
            <small>${escapeHtml(MENU_GROUPS[screen.depth1].label)} › ${escapeHtml(screen.depth2)}</small>
          </button>`)}</div>`
      : `<div class="empty compact">“${escapeHtml(input.value)}”와 맞는 업무가 없습니다. 전체메뉴에서 찾아보세요.</div>`;
    if (hasQuery) announce(results.length ? `추천 업무 ${results.length}건` : '맞는 업무가 없습니다.');
  };

  input.addEventListener('input', drawSuggestions);
  input.addEventListener('keydown', event => {
    const buttons = $$('button', suggest);
    switch (event.key) {
      case 'ArrowDown': highlighted = Math.min(highlighted + 1, buttons.length - 1); break;
      case 'ArrowUp':   highlighted = Math.max(highlighted - 1, 0); break;
      case 'Enter':     if (results.length) openScreen(results[Math.max(highlighted, 0)].id); return;
      case 'Escape':    suggest.hidden = true; input.setAttribute('aria-expanded', 'false'); return;
      default: return;
    }
    event.preventDefault();
    buttons.forEach((button, index) => {
      button.classList.toggle('on', index === highlighted);
      button.setAttribute('aria-selected', index === highlighted);
    });
    if (buttons[highlighted]) input.setAttribute('aria-activedescendant', buttons[highlighted].id);
  });
  $('#qbtn').onclick = () => {
    drawSuggestions();
    if (results.length) openScreen(results[0].id);
  };
}
