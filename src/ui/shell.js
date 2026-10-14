import { APP } from '../core/config.js';
import { $, $$, each, escapeHtml, when } from '../core/dom.js';
import { USER } from '../data/customerRepository.js';
import { MENU_GROUPS, MENU_ORDER, MENU_TREE, SCREEN_BY_ID } from '../data/menuRepository.js';
import { state } from '../state/store.js';
import { icon } from './icons.js';

export function renderShell() {
  renderHeader();
  renderAppBar();
  renderTabBar();
  renderFooter();
}

const logoButton = () =>
  `<button class="logo" data-action="nav" data-page="home"><span class="mark" aria-hidden="true">iM</span><span class="text"><b>iM라이프</b><small>사이버창구</small></span><span class="sr-only">홈으로</span></button>`;

const largeTextButton = () => `
  <button class="bigbtn" data-action="toggle-large-text" aria-pressed="${state.ui.largeText}">
    <span class="ga" aria-hidden="true">가<small>가</small></span><span class="lbl">${state.ui.largeText ? '큰글씨 켜짐' : '큰글씨'}</span>
  </button>`;

const loginOrLogoutButton = ({ logoutStyle }) => state.isLoggedIn
  ? `<button class="btn sm ${logoutStyle}" data-action="logout">로그아웃</button>`
  : `<button class="btn sm pri" data-action="nav" data-page="login">로그인</button>`;

function renderHeader() {
  const currentGroup = state.route.page === 'screen' ? SCREEN_BY_ID[state.route.screenId].depth1 : '';
  const isAllMenuOpen = state.route.page === 'all';

  $('#header').innerHTML = `
    <div class="wrap">
      ${logoButton()}
      <nav class="gnb" id="gnb" aria-label="주메뉴">
        ${each(MENU_ORDER, key => `<button class="${currentGroup === key ? 'on' : ''}" data-action="open-group" data-group="${key}" aria-controls="mega" aria-expanded="false"${currentGroup === key ? ' aria-current="true"' : ''}>${MENU_GROUPS[key].label}</button>`)}
      </nav>
      <div class="actions">
        ${largeTextButton()}
        ${state.isLoggedIn ? `<span class="user-chip">${icon('user')}<b>${USER.name}</b>님</span>` : ''}
        ${loginOrLogoutButton({ logoutStyle: '' })}
        <button class="icon-btn" data-action="toggle-all-menu" aria-label="${isAllMenuOpen ? '전체메뉴 닫기' : '전체메뉴'}" aria-expanded="${isAllMenuOpen}">
          ${icon(isAllMenuOpen ? 'x' : 'menu')}
        </button>
      </div>
    </div>
    <div class="mega" id="mega" role="region" aria-label="세부 메뉴" hidden></div>`;
}

/** 메가메뉴: 왼쪽 2Depth 목록, 오른쪽에 선택한 2Depth의 3Depth */
export function showMegaMenu(groupKey, activeIndex = 0) {
  const mega = $('#mega');
  const sections = Object.entries(MENU_TREE[groupKey]);
  const [activeTitle, activeScreens] = sections[activeIndex];

  mega.innerHTML = `
    <div class="wrap">
      <div class="mega-depth2" role="group" aria-label="${escapeHtml(MENU_GROUPS[groupKey].label)} 2Depth 메뉴">
        ${each(sections, ([title], index) => `
          <button class="${index === activeIndex ? 'on' : ''}" aria-expanded="${index === activeIndex}" aria-controls="megaPanel"
                  data-action="mega-section" data-group="${groupKey}" data-index="${index}">
            <span>${escapeHtml(title)}</span>${icon('chev')}
          </button>`)}
      </div>
      <div class="mega-depth3" id="megaPanel" role="group" aria-labelledby="megaTitle">
        <p class="mega-title" id="megaTitle">${escapeHtml(activeTitle)}</p>
        <ul>${each(activeScreens, screen => `<li><button data-action="open" data-id="${screen.id}">${escapeHtml(screen.depth3)}${when(screen.authLevel === 'A2', `${icon('lock')}<span class="sr-only">(추가인증 필요)</span>`)}</button></li>`)}</ul>
      </div>
    </div>`;
  mega.dataset.group = groupKey;
  mega.hidden = false;
  $$('#gnb [data-group]').forEach(button => button.setAttribute('aria-expanded', button.dataset.group === groupKey));
}

export function hideMegaMenu() {
  const mega = $('#mega');
  if (mega) mega.hidden = true;
  $$('#gnb [data-group]').forEach(button => button.setAttribute('aria-expanded', 'false'));
}

function renderAppBar() {
  const { page, screenId } = state.route;
  const titles = { all: '전체메뉴', login: '로그인', screen: screenId && SCREEN_BY_ID[screenId].depth3 };

  $('#appbar').innerHTML = page === 'home'
    ? `${logoButton()}${largeTextButton()}${loginOrLogoutButton({ logoutStyle: 'ghost' })}`
    : `<button class="icon-btn" data-action="back" aria-label="뒤로">${icon('back')}</button>
       <p class="title" aria-hidden="true">${escapeHtml(titles[page] || '')}</p>
       ${largeTextButton()}
       <button class="icon-btn" data-action="nav" data-page="home" aria-label="홈">${icon('home')}</button>`;
}

function renderTabBar() {
  const { page, screenId } = state.route;
  const tabs = [
    { label: '홈',        icon: 'home',   action: 'data-action="nav" data-page="home"',      active: page === 'home' },
    { label: '내 계약',    icon: 'shield', action: 'data-action="open" data-id="CT-01"',   active: screenId === 'CT-01' },
    { label: '보험금청구', icon: 'claim',  action: 'data-action="open" data-id="PY-01"',   active: screenId === 'PY-01' },
    { label: '증명서',     icon: 'cert',   action: 'data-action="open" data-id="CF-02"',   active: Boolean(screenId?.startsWith('CF-')) },
    { label: '전체메뉴',   icon: 'menu',   action: 'data-action="toggle-all-menu"',            active: page === 'all' },
  ];
  $('#tabbar').innerHTML = each(tabs, tab => `<button class="${tab.active ? 'on' : ''}" ${tab.action}${tab.active ? ' aria-current="page"' : ''}>${icon(tab.icon)}${tab.label}</button>`);
}

/** 하단 이용 안내 항목: URL이 있으면 회사 홈페이지 새 창 링크 */
const footerLink = ([label, url, isStrong]) => (url
  ? `<a href="${url}" target="_blank" rel="noopener noreferrer"${isStrong ? ' class="strong"' : ''}>${label}<span class="sr-only"> (새 창)</span></a>`
  : `<span>${label}</span>`);

function renderFooter() {
  $('#footer').innerHTML = `
    <div class="wrap">
      <nav aria-label="이용 안내">${each(APP.footerLinks, footerLink)}</nav>
      <p>iM라이프생명보험(주) · 고객센터 1588-4770 (평일 09:00~18:00)</p>
      <p>본 화면은 「사이버창구 Web 메뉴정의서 ${APP.specVersion}」 기반 기획 검토용 프로토타입입니다. 표시 금액은 예시이며 실제 계약과 무관합니다.</p>
    </div>`;
}
