import { goBack, navigate, openScreen, toggleAllMenu } from '../app/router.js';
import { refreshShell, showMegaMenu } from '../components/shell/mountShell';
import { $, focusElement } from '../core/dom.js';
import { MENU_TREE, SCREEN_BY_ID } from '../data/menuRepository.js';
import { downloadContractDocument } from '../features/contractDocuments.js';
import { setLargeText } from '../features/largeText.js';
import { downloadShortcut, openShortcutGuide, shortcut } from '../features/shortcut.js';
import { openNoticeBoard } from '../pages/noticeBoard.js';
import { rerenderScreen } from '../pages/screen';
import { showFundPhase, startSuitability, submitSuitability } from '../screens/fund/fundFlow';
import { completeSingleForm } from '../screens/singleForm/completeSingleForm';
import { goToStep } from '../screens/stepFlow/stepFlowActions';
import { confirmCancelRequest, submitDocuments } from '../screens/list/listActions';
import { STEP_FLOWS } from '../screens/stepFlows';
import { chooseSignMethod, login, logout } from '../services/auth.js';
import { state } from '../state/store';
import { closeModal, copyText, toast } from '../ui/overlay.js';

/** 클릭 가능한 요소는 모두 data-action="이름" 을 갖고, 여기 한 곳에서 처리 */
const ACTIONS = {
  /* 이동 */
  'nav':               ({ page }) => navigate(page),
  'open':              ({ id, variable }) => { if (variable) state.variableNo = variable; openScreen(id); },
  'open-group':        ({ group }) => openScreen(Object.values(MENU_TREE[group])[0][0].id),
  'back':              () => goBack(),
  'toggle-all-menu':   () => toggleAllMenu(),
  'mega-section':      ({ group, index }) => {
    showMegaMenu(group, Number(index));
    $(`#mega [data-index="${index}"]`).focus();
  },
  'toggle-menu-section': (data, element) => {   // 제자리 갱신 (다시 마운트하지 않아 초점 유지)
    const { key } = element.closest('.acc').dataset;
    const sections = state.ui.openMenuSections;
    if (sections.has(key)) sections.delete(key); else sections.add(key);
    refreshShell();
  },

  /* 로그인 · 설정 */
  'login':             ({ method }) => login(method),
  'logout':            () => logout(),
  'toggle-large-text': () => setLargeText(!state.ui.largeText, { notify: true }),
  /* 펀드변경 적합성진단 */
  'suit-start':        () => { closeModal(); startSuitability(state.screen.flow); },
  'suit-edit':         () => showFundPhase('edit'),
  'suit-submit':       () => submitSuitability(),
  'fund-compare':      () => showFundPhase('compare'),
  'fund-sign':         () => chooseSignMethod(SCREEN_BY_ID[state.route.screenId], () => completeSingleForm(state.screen.flow)),

  /* 바로가기 */
  'open-shortcut':     () => openShortcutGuide(),
  'shortcut-tab':      ({ tab }) => openShortcutGuide(tab),
  'download-shortcut': ({ kind }) => downloadShortcut(kind),
  'install-app':       () => { shortcut.installPrompt?.prompt(); shortcut.installPrompt = null; closeModal(); },

  /* 공통 */
  'toast':             ({ message }) => toast(message),
  'skip-to-main':      (data, element, event) => { event?.preventDefault(); focusElement($('#main h1') || $('#main')); },
  'close-modal':       () => closeModal(),
  'open-notices':      ({ notice }) => openNoticeBoard(notice),
  'copy-text':         ({ text, label }) => copyText(text, label),

  /* 업무 화면: 목록(T2) */
  'set-period':        ({ period }) => { state.screen.list.period = period; rerenderScreen(); },
  'select-row':        ({ index }) => { state.screen.list.selectedRow = Number(index); rerenderScreen(); },
  'close-row':         () => { state.screen.list.selectedRow = null; rerenderScreen(); },
  'contract-tab':      ({ index }) => { state.screen.list.contractTab = Number(index); rerenderScreen(); },
  'download-contract-doc': ({ no, doc }) => downloadContractDocument(no, doc),
  'variable-tab':      ({ no }) => {
    state.variableNo = no;
    if (state.screen.flow) Object.assign(state.screen.flow, { fundRatios: null, rebalance: false, phase: 'edit' });   // 펀드변경: 계약을 바꾸면 입력 초기화
    state.screen.list.selectedRow = null;
    rerenderScreen();
  },
  'cancel-request':    ({ index }) => confirmCancelRequest(Number(index)),
  'submit-documents':  () => submitDocuments(),

  /* 업무 화면: 신청·변경·발급(T3~T5) */
  'pick':              ({ key }) => {
    const flow = state.screen.flow;
    flow.pick = key;
    STEP_FLOWS[state.route.screenId]?.pick.onPick?.(flow, key);
    rerenderScreen();
  },
  'step-prev':         () => goToStep(-1),
  'reset-flow':        () => { state.screen.flow = null; rerenderScreen(); },
};

export function runAction(element, event) {
  const handler = ACTIONS[element.dataset.action];
  if (handler) handler(element.dataset, element, event);
}
