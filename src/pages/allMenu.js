import { $, $$, each, escapeHtml, when } from '../core/dom.js';
import { MENU_GROUPS, MENU_ORDER, MENU_TREE, SEARCH_KEYWORDS } from '../data/menuRepository.js';
import { state } from '../state/store';
import { icon } from '../ui/icons.js';
import { announce } from '../ui/overlay.js';

/* 전체메뉴: 2Depth를 누르면 3Depth가 아래로 펼쳐짐 ---------------------- */
export function renderAllMenuPage() {
  $('#main').innerHTML = `
  <div class="page"><div class="wrap">
    <div class="title-row"><div>
      <h1>전체메뉴</h1>
      <p>메뉴를 누르면 세부 메뉴가 펼쳐집니다. ${icon('lock')} 표시는 추가인증이 필요한 금전 거래입니다.</p>
    </div></div>
    <div class="search am-search">
      <span class="search-icon">${icon('search')}</span>
      <label class="sr-only" for="amq">메뉴 이름으로 찾기</label>
      <input id="amq" type="search" placeholder="메뉴 이름으로 찾기">
    </div>
    <div class="am" id="amList">${each(MENU_ORDER, allMenuGroupCard)}</div>
    <p class="am-empty" id="amNone" hidden>맞는 메뉴가 없습니다. 다른 단어로 찾아보세요.</p>
  </div></div>`;
  bindAllMenuSearch();
}

function allMenuGroupCard(groupKey) {
  const sections = Object.entries(MENU_TREE[groupKey]);
  return `
  <div class="am-col" data-group="${groupKey}">
    <h2>${icon(MENU_GROUPS[groupKey].icon)}${MENU_GROUPS[groupKey].label}</h2>
    ${each(sections, ([title, screens], index) => allMenuSection(groupKey, title, screens, index))}
  </div>`;
}

function allMenuSection(groupKey, title, screens, index) {
  const key = `${groupKey}|${title}`;
  const isOpen = state.ui.openMenuSections.has(key);
  const panelId = `amp-${groupKey}${index}`;
  return `
  <div class="acc ${isOpen ? 'open' : ''}" data-key="${escapeHtml(key)}">
    <button class="acc-h" data-action="toggle-menu-section" aria-expanded="${isOpen}" aria-controls="${panelId}">
      <span>${escapeHtml(title)}</span>${icon('chev')}
    </button>
    <ul class="acc-p" id="${panelId}" ${isOpen ? '' : 'hidden'}>
      ${each(screens, screen => `
        <li data-n="${escapeHtml(`${screen.depth3} ${screen.depth2} ${SEARCH_KEYWORDS[screen.id] || ''}`)}">
          <button data-action="open" data-id="${screen.id}">
            <span class="nm">${escapeHtml(screen.depth3)}</span>
            <span class="mt">${when(screen.authLevel === 'A2', `${icon('lock')}<span class="sr-only">(추가인증 필요)</span>`)}</span>
          </button>
        </li>`)}
    </ul>
  </div>`;
}

export function setMenuSectionOpen(section, isOpen) {
  section.classList.toggle('open', isOpen);
  $('.acc-h', section).setAttribute('aria-expanded', isOpen);
  $('.acc-p', section).hidden = !isOpen;
}

/** 검색어가 있으면 맞는 메뉴가 있는 2Depth만 펼치고, 지우면 원래 상태로 */
function bindAllMenuSearch() {
  const input = $('#amq');
  input.addEventListener('input', () => {
    const query = input.value.trim();
    let anyMatch = false;

    for (const card of $$('#amList .am-col')) {
      let cardMatch = false;
      for (const section of $$('.acc', card)) {
        let matchCount = 0;
        for (const item of $$('li', section)) {
          const isMatch = !query || item.dataset.n.includes(query);
          item.hidden = !isMatch;
          if (isMatch) matchCount++;
        }
        section.hidden = Boolean(query) && !matchCount;
        setMenuSectionOpen(section, query ? matchCount > 0 : state.ui.openMenuSections.has(section.dataset.key));
        if (matchCount) cardMatch = true;
      }
      card.hidden = Boolean(query) && !cardMatch;
      if (cardMatch) anyMatch = true;
    }
    $('#amNone').hidden = anyMatch || !query;
    if (query) announce(anyMatch ? `맞는 메뉴 ${$$('#amList li').filter(item => !item.hidden).length}개` : '맞는 메뉴가 없습니다.');
  });
}
