import { showNewPage } from '../app/router.js';
import { $, $$, each, escapeHtml } from '../core/dom.js';
import { formatClock, maskPhone } from '../core/format';
import { USER } from '../data/customerRepository.js';
import { freshScreenState, state } from '../state/store';
import { announce, closeModal, onModalClose, openModal, toast } from '../ui/overlay.js';

/* 인증수단 */
const AUTH_METHODS = {
  simple:  { name: '간편인증',        desc: '카카오·네이버·PASS·토스',  icon: 'phone'  },
  joint:   { name: '공동인증서',      desc: 'PC·휴대폰 저장 인증서',    icon: 'key'    },
};
export const LOGIN_METHODS = [AUTH_METHODS.simple, AUTH_METHODS.joint];          // 로그인: 간편인증·공동인증서
export const SIGN_METHODS  = [AUTH_METHODS.simple, AUTH_METHODS.joint];          // 전자서명: 간편인증·공동인증서

/* 인증 (시뮬레이션: 실제 인증은 일어나지 않음) ============================== */
/** 인증 요청 화면을 잠시 보여준 뒤 onDone 실행 */
function requestAuth(methodName, onDone, title = '본인인증') {
  openModal(`
    <h2>${title}</h2>
    <p>${escapeHtml(methodName)}(으)로 인증을 요청했습니다. 휴대폰 앱에서 인증을 완료해 주세요.</p>
    <div class="spin" role="img" aria-label="인증 대기 중"></div>
    <p class="hint">프로토타입: 잠시 후 자동으로 인증됩니다.</p>`, { closable: false });
  setTimeout(() => { closeModal(); onDone(); }, 1300);
}

/** 추가인증 남은 시간 (KWCAG 11번 응답시간 조절: 시간 연장 버튼 제공) */
const OTP_SECONDS = 180;
const otpTimer = { id: null, left: OTP_SECONDS };


function startOtpTimer(modal) {
  clearInterval(otpTimer.id);
  otpTimer.left = OTP_SECONDS;
  const label = $('#otpTime', modal);
  label.textContent = formatClock(otpTimer.left);
  otpTimer.id = setInterval(() => {
    otpTimer.left = Math.max(otpTimer.left - 1, 0);
    label.textContent = formatClock(otpTimer.left);
    if (otpTimer.left === 60) announce('추가인증 남은 시간이 1분입니다. 시간 연장 버튼으로 늘릴 수 있습니다.');
    if (otpTimer.left === 0) {
      clearInterval(otpTimer.id);
      $('#otpErr', modal).textContent = '입력 시간이 지났습니다. 재전송 후 다시 입력해 주세요.';
    }
  }, 1000);
}

/** 금전 거래(A2)용 휴대폰 추가인증 */
function requestExtraAuth(onDone) {
  const modal = openModal(`
    <h2>추가인증</h2>
    <p>계좌·지급 등 금전 거래는 추가인증이 필요합니다. 등록된 휴대폰(${maskPhone(USER.phone)})으로 인증번호를 보냈습니다.</p>
    <div class="fld">
      <label for="otp">인증번호 6자리</label>
      <div class="inrow">
        <input class="inp num" id="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="숫자 6자리" aria-describedby="otpHelp otpErr">
        <button class="btn" id="otpResend">재전송</button>
      </div>
      <span class="help" id="otpHelp">프로토타입: 아무 숫자 6자리나 입력하세요. 남은 시간 <span id="otpTime" class="num">03:00</span>
        <button type="button" class="link" id="otpExtend">시간 연장</button></span>
      <span class="err" id="otpErr" role="alert"></span>
    </div>
    <div class="navrow inline mt-18">
      <button class="btn" data-action="close-modal">취소</button>
      <button class="btn pri" id="otpOk">확인</button>
    </div>`);

  const input = $('#otp', modal);
  input.focus();
  startOtpTimer(modal);
  onModalClose(() => clearInterval(otpTimer.id));
  $('#otpExtend', modal).onclick = () => { startOtpTimer(modal); announce('남은 시간을 3분으로 연장했습니다.'); };
  $('#otpResend', modal).onclick = () => { startOtpTimer(modal); $('#otpErr', modal).textContent = ''; toast('인증번호를 다시 보냈습니다.'); };
  $('#otpOk', modal).onclick = () => {
    if (!/^\d{6}$/.test(input.value) || otpTimer.left === 0) {
      $('#otpErr', modal).textContent = otpTimer.left === 0 ? '입력 시간이 지났습니다. 재전송 후 다시 입력해 주세요.' : '인증번호 6자리를 정확히 입력해 주세요.';
      input.classList.add('bad');
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    closeModal();
    onDone();
  };
}

/** 전자서명 → (A2 화면이면) 추가인증 → onDone */
export function signAndConfirm(screen, methodName, onDone) {
  requestAuth(methodName, () => (screen.authLevel === 'A2' ? requestExtraAuth(onDone) : onDone()), '전자서명');
}

/** 단일폼(T4) 변경용: 인증수단을 고르게 한 뒤 전자서명 진행 (단계형의 '인증' 단계와 같은 선택지) */
export function chooseSignMethod(screen, onDone) {
  const needsExtraAuth = screen.authLevel === 'A2';
  const dialog = openModal(`
    <h2>${needsExtraAuth ? '전자서명 + 휴대폰 추가인증' : '전자서명'}</h2>
    <p>${needsExtraAuth ? '본인 계좌로 돈이 오가는 업무라 인증서 서명 후 휴대폰 인증을 한 번 더 진행합니다.' : '변경 내용에 인증서로 서명하면 바로 반영됩니다.'}</p>
    <div class="auth-grid">
      ${each(SIGN_METHODS, method => `<button class="auth-opt" data-auth="${method.name}"><b>${method.name}</b><small>${method.desc}</small></button>`)}
    </div>
    <button class="btn block mt-16" data-action="close-modal">취소</button>`);
  $$('[data-auth]', dialog).forEach(button => {
    button.onclick = () => signAndConfirm(screen, button.dataset.auth, onDone);
  });
}

export function login(methodName) {
  requestAuth(methodName, () => {
    state.isLoggedIn = true;
    toast(`${USER.name}님, 안녕하세요. 로그인되었습니다.`);

    const nextScreenId = state.pendingScreenId;
    state.pendingScreenId = null;
    if (nextScreenId) {
      state.route = { page: 'screen', screenId: nextScreenId };
      state.history.push({ page: 'home', screenId: null });
      state.screen = freshScreenState();
      showNewPage();
    } else {
      state.history = [];
      state.route = { page: 'home', screenId: null };
      showNewPage();
    }
  }, '로그인 인증');
}

export function logout() {
  state.isLoggedIn = false;
  state.history = [];
  state.route = { page: 'home', screenId: null };
  showNewPage();
  toast('안전하게 로그아웃되었습니다.');
}
