/* 인증 (시뮬레이션: 실제 인증은 일어나지 않음) — 로그인·전자서명·금전 거래 추가인증 */
import { showNewPage } from '../app/router';
import { OtpDialog } from '../components/modal/OtpDialog';
import { AuthWaiting, SignMethodDialog, type AuthMethod } from '../components/modal/SignMethodDialog';
import { maskPhone } from '../core/format';
import { USER } from '../data/customerRepository';
import type { ScreenSpec } from '../data/menu';
import { freshScreenState, state } from '../state/store';
import { closeModal, openModal } from '../ui/modal';
import { announce, toast } from '../ui/overlay';

const AUTH_METHODS = {
  simple: { name: '간편인증',   desc: '카카오·네이버·PASS·토스', icon: 'phone' },
  joint:  { name: '공동인증서', desc: 'PC·휴대폰 저장 인증서',   icon: 'key' },
} satisfies Record<string, Required<AuthMethod>>;
export const LOGIN_METHODS: readonly Required<AuthMethod>[] = [AUTH_METHODS.simple, AUTH_METHODS.joint];   // 로그인: 간편인증·공동인증서
export const SIGN_METHODS: readonly AuthMethod[] = [AUTH_METHODS.simple, AUTH_METHODS.joint];    // 전자서명: 간편인증·공동인증서

const AUTH_DELAY = 1300;

type AuthLevelHolder = Pick<ScreenSpec, 'authLevel'>;

/** 인증 요청 화면을 잠시 보여준 뒤 onDone 실행 (대기 중에는 Esc 로 닫히지 않음) */
function requestAuth(methodName: string, onDone: () => void, title = '본인인증'): void {
  openModal(<AuthWaiting title={title} methodName={methodName} />, { closable: false });
  setTimeout(() => { closeModal(); onDone(); }, AUTH_DELAY);
}

/** 금전 거래(A2)용 휴대폰 추가인증 */
function requestExtraAuth(onDone: () => void): void {
  openModal(<OtpDialog phone={maskPhone(USER.phone)} announce={announce} toast={toast} onConfirm={() => { closeModal(); onDone(); }} />);
}

/** 전자서명 → (A2 화면이면) 추가인증 → onDone */
export function signAndConfirm(screen: AuthLevelHolder, methodName: string, onDone: () => void): void {
  requestAuth(methodName, () => (screen.authLevel === 'A2' ? requestExtraAuth(onDone) : onDone()), '전자서명');
}

/** 단일폼(T4) 변경용: 인증수단을 고르게 한 뒤 전자서명 진행 (단계형의 '인증' 단계와 같은 선택지) */
export function chooseSignMethod(screen: AuthLevelHolder, onDone: () => void): void {
  openModal(<SignMethodDialog needsExtraAuth={screen.authLevel === 'A2'} methods={SIGN_METHODS} onChoose={name => signAndConfirm(screen, name, onDone)} />);
}

export function login(methodName: string): void {
  requestAuth(methodName, () => {
    state.isLoggedIn = true;
    toast(`${USER.name}님, 안녕하세요. 로그인되었습니다.`);

    const nextScreenId = state.pendingScreenId;
    state.pendingScreenId = null;
    if (nextScreenId) {
      state.route = { page: 'screen', screenId: nextScreenId };
      state.history.push({ page: 'home', screenId: null });
      state.screen = freshScreenState();
    } else {
      state.history = [];
      state.route = { page: 'home', screenId: null };
    }
    showNewPage();
  }, '로그인 인증');
}

export function logout(): void {
  state.isLoggedIn = false;
  state.history = [];
  state.route = { page: 'home', screenId: null };
  showNewPage();
  toast('안전하게 로그아웃되었습니다.');
}
