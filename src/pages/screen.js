import { documentTitle } from '../app/router.js';
import { $, $$, each, escapeHtml } from '../core/dom.js';
import { SCREEN_SUBTITLES } from '../data/homeContent.js';
import { MENU_GROUPS, MENU_TREE, SCREEN_BY_ID } from '../data/menuRepository.js';
import { readFieldValues } from '../form/fieldValues';
import { CERTIFICATES } from '../screens/certificates';
import { CHANGE_FORMS } from '../screens/changeForms';
import { mountScreenBody, unmountScreenBody } from '../screens/mountScreenBody';
import { REACT_TEMPLATES } from '../screens/reactTemplates';
import { STEP_FLOWS } from '../screens/stepFlows';
import { state } from '../state/store';
import { applyTableA11y } from '../ui/a11y.js';
import { icon } from '../ui/icons.js';

/* 업무 화면 ============================================================ */
/** 화면 틀(좌측 메뉴·경로·제목)은 여기서, 본문(#sbody)은 화면유형별 React 템플릿(screens/reactTemplates)이 그림 */

/* 화면 틀: 좌측 메뉴 · 경로 · 제목 · 본문 ---------------------------- */
export function renderScreenPage(screenId) {
  const screen = SCREEN_BY_ID[screenId];
  const body = REACT_TEMPLATES[screen.screenType]?.(screen) ?? null;

  unmountScreenBody();
  $('#main').innerHTML = `
  <div class="page"><div class="wrap sub-layout">
    ${screenSideMenu(screen)}
    <div class="sub-main">
      <nav class="crumb" aria-label="현재 위치">홈 ${icon('chev')} ${MENU_GROUPS[screen.depth1].label} ${icon('chev')} ${escapeHtml(screen.depth2)} ${icon('chev')} <b aria-current="page">${escapeHtml(screen.depth3)}</b></nav>
      <div class="title-row">
        <div><h1>${escapeHtml(screen.depth3)}</h1><p>${screenSubtitle(screen)}</p></div>
        <div class="badges">${screenAuthBadge(screen)}<span class="bdg">이용대상 · ${escapeHtml(screen.target)}</span></div>
      </div>
      <div id="sbody"></div>
    </div>
  </div></div>`;

  mountScreenBody($('#sbody'), body);
  applyTableA11y($('#main'));
  document.title = documentTitle();
}

/** 업무 화면 다시 그리기 (진행 상태는 유지) */
export function rerenderScreen() {
  renderScreenPage(state.route.screenId);
}

function screenSideMenu(screen) {
  return `
  <nav class="lnb" aria-labelledby="lnbTitle">
    <h2 id="lnbTitle">${MENU_GROUPS[screen.depth1].label}</h2>
    ${each(Object.entries(MENU_TREE[screen.depth1]), ([title, screens], groupIndex) => `
      <div class="lnb-group" role="group" aria-labelledby="lnbG${groupIndex}">
        <div class="g" id="lnbG${groupIndex}">${escapeHtml(title)}</div>
        <div class="lnb-sub">
          ${each(screens, item => `<button class="${item.id === screen.id ? 'on' : ''}" data-action="open" data-id="${item.id}"${item.id === screen.id ? ' aria-current="page"' : ''}>${escapeHtml(item.depth3)}</button>`)}
        </div>
      </div>`)}
  </nav>`;
}

function screenSubtitle(screen) {
  return SCREEN_SUBTITLES.byScreen[screen.id] || SCREEN_SUBTITLES.byBizType[screen.bizType] || '';
}

function screenAuthBadge(screen) {
  if (screen.authLevel === 'A2') return `<span class="bdg lock">${icon('lock')}추가인증 필요</span>`;   // 아이콘 + 글자 (색에만 의존하지 않음)
  if (screen.authLevel === 'A0') return '<span class="bdg open">로그인 없이 이용</span>';
  return '';
}

/** 입력 폼이 있는 화면유형별 설정 */
const FORM_CONFIGS = { T3: STEP_FLOWS, T4: CHANGE_FORMS, T5: CERTIFICATES };

/** 화면을 통째로 다시 그리기 전에 입력 중인 값을 진행 상태에 저장 (큰글씨 전환 시 입력 유지) */
export function saveScreenInputs() {
  const { page, screenId } = state.route;
  const flow = state.screen.flow;
  const root = $('#sbody');
  if (page !== 'screen' || !flow || !root) return;
  const fields = FORM_CONFIGS[SCREEN_BY_ID[screenId].screenType][screenId]?.fields;
  if (fields) Object.assign(flow.values, readFieldValues(root, fields));
  const agreements = $$('[data-agree]', root);
  if (agreements.length) flow.agreed = agreements.filter(box => box.checked).map(box => Number(box.dataset.agree));
}
