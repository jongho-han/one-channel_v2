import { goBack, navigate, openScreen, toggleAllMenu } from '../app/router';
import { refreshShell, showMegaMenu } from '../components/shell/mountShell';
import { $, focusElement } from '../core/dom';
import { MENU_TREE, SCREEN_BY_ID } from '../data/menu';
import { downloadContractDocument } from '../features/contractDocuments';
import { setLargeText } from '../features/largeText';
import { downloadShortcut, openShortcutGuide, shortcut } from '../features/shortcut';
import type { ShortcutTab } from '../components/modal/ShortcutGuide';
import { openNoticeBoard } from '../pages/noticeBoard';
import { rerenderScreen } from '../pages/screen';
import { showFundPhase, startSuitability, submitSuitability, type FundFlow } from '../screens/fund/fundFlow';
import { confirmCancelRequest, openContractDetail, openContractDetailByNo, openVariableDetail, showContractCards, showVariableCards, submitDocuments } from '../screens/list/listActions';
import { completeSingleForm } from '../screens/singleForm/completeSingleForm';
import { goToStep } from '../screens/stepFlow/stepFlowActions';
import { STEP_FLOWS, type StepFlowState } from '../screens/stepFlows';
import { chooseSignMethod, login, logout } from '../services/auth';
import { state, type Page } from '../state/store';
import { closeModal } from '../ui/modal';
import { copyText, toast } from '../ui/overlay';

/** data-* 값 · 누른 요소 · 원래 이벤트 */
type ActionHandler = (data: DOMStringMap, element: HTMLElement, event?: Event) => void;

const currentScreen = () => SCREEN_BY_ID[state.route.screenId ?? ''];

/** 클릭 가능한 요소는 모두 data-action="이름" 을 갖고, 여기 한 곳에서 처리 */
const ACTIONS: Record<string, ActionHandler> = {
  /* 이동 */
  'nav':               ({ page }) => navigate(page as Page),
  'open':              ({ id = '', variable, contract }) => {
    if (variable) state.variableNo = variable;
    openScreen(id);
    if (contract && id === 'CT-02' && state.route.screenId === id) openContractDetailByNo(contract);
    if (variable && id === 'CT-03' && state.route.screenId === id) openVariableDetail(variable);
  },
  'open-group':        ({ group = '' }) => openScreen(Object.values(MENU_TREE[group])[0][0].id),
  'back':              () => goBack(),
  'toggle-all-menu':   () => toggleAllMenu(),
  'mega-section':      ({ group = '', index }) => {
    showMegaMenu(group, Number(index));
    focusElement($(`#mega [data-index="${index}"]`));
  },
  'toggle-menu-section': (_data, element) => {   // 제자리 갱신 (다시 마운트하지 않아 초점 유지)
    const key = element.closest<HTMLElement>('.acc')?.dataset.key ?? '';
    const sections = state.ui.openMenuSections;
    if (sections.has(key)) sections.delete(key); else sections.add(key);
    refreshShell();
  },

  /* 로그인 · 설정 */
  'login':             ({ method = '' }) => login(method),
  'logout':            () => logout(),
  'toggle-large-text': () => setLargeText(!state.ui.largeText, { notify: true }),
  /* 펀드변경 적합성진단 */
  'suit-start':        () => { closeModal(); startSuitability(state.screen.flow as FundFlow); },
  'suit-edit':         () => showFundPhase('edit'),
  'suit-submit':       () => submitSuitability(),
  'fund-compare':      () => showFundPhase('compare'),
  'fund-sign':         () => chooseSignMethod(currentScreen(), () => completeSingleForm(state.screen.flow as FundFlow)),

  /* 바로가기 */
  'open-shortcut':     () => openShortcutGuide(),
  'shortcut-tab':      ({ tab }) => openShortcutGuide(tab as ShortcutTab),
  'download-shortcut': ({ kind = '' }) => downloadShortcut(kind),
  'install-app':       () => { void shortcut.installPrompt?.prompt(); shortcut.installPrompt = null; closeModal(); },

  /* 공통 */
  'toast':             ({ message = '' }) => toast(message),
  'skip-to-main':      (_data, _element, event) => { event?.preventDefault(); focusElement($('#main h1') || $('#main')); },
  'close-modal':       () => closeModal(),
  'open-notices':      ({ notice }) => openNoticeBoard(notice ?? null),
  'copy-text':         ({ text = '', label }) => { void copyText(text, label); },

  /* 업무 화면: 목록(T2) */
  'set-period':        ({ period }) => { state.screen.list.period = period; rerenderScreen(); },
  'select-row':        ({ index }) => { state.screen.list.selectedRow = Number(index); rerenderScreen(); },
  'close-row':         () => { state.screen.list.selectedRow = null; rerenderScreen(); },
  'contract-open':     ({ index }) => openContractDetail(Number(index)),
  'contract-list':     () => showContractCards(),
  'variable-open':     ({ no = '' }) => openVariableDetail(no),
  'variable-list':     () => showVariableCards(),
  'download-contract-doc': ({ no = '', doc = '' }) => downloadContractDocument(no, doc),
  'variable-tab':      ({ no = '' }) => {
    state.variableNo = no;
    if (state.screen.flow) Object.assign(state.screen.flow, { fundRatios: null, rebalance: false, phase: 'edit' });   // 펀드변경: 계약을 바꾸면 입력 초기화
    state.screen.list.selectedRow = null;
    rerenderScreen();
  },
  'cancel-request':    ({ index }) => confirmCancelRequest(Number(index)),
  'submit-documents':  () => submitDocuments(),

  /* 업무 화면: 신청·변경·발급(T3~T5) */
  'pick':              ({ key = '' }) => {
    const flow = state.screen.flow;
    if (!flow) return;
    flow.pick = key;
    STEP_FLOWS[state.route.screenId ?? '']?.pick?.onPick?.(flow as StepFlowState, key);
    rerenderScreen();
  },
  'step-prev':         () => goToStep(-1),
  'reset-flow':        () => { state.screen.flow = null; rerenderScreen(); },
};

export function runAction(element: HTMLElement, event?: Event): void {
  const handler = ACTIONS[element.dataset.action ?? ''];
  if (handler) handler(element.dataset, element, event);
}
