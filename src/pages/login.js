import { $, each, escapeHtml } from '../core/dom.js';
import { SCREEN_BY_ID } from '../data/menuRepository.js';
import { LOGIN_METHODS } from '../services/auth.js';
import { state } from '../state/store.js';
import { icon } from '../ui/icons.js';

/* 로그인 ------------------------------------------------------------ */
export function renderLoginPage() {
  const pending = state.pendingScreenId && SCREEN_BY_ID[state.pendingScreenId];
  $('#main').innerHTML = `
  <div class="page"><div class="wrap"><div class="login-page">
    <div class="title-row"><div>
      <h1>로그인</h1>
      <p>${pending ? `<b>${escapeHtml(pending.depth3)}</b> 화면은 본인 확인 후 이용할 수 있습니다.` : '사용하시는 인증 방법을 선택하세요.'}</p>
    </div></div>
    <div class="card"><div class="auth-grid">
      ${each(LOGIN_METHODS, method => `
        <button class="auth-opt" data-action="login" data-method="${method.name}">
          <span class="ic">${icon(method.icon)}</span><span><b>${method.name}</b><br><small>${method.desc}</small></span>
        </button>`)}
    </div></div>
    <div class="box info mt-14">${icon('info')}<div><b>처음 이용하시나요?</b>별도 회원가입 없이 인증서만으로 이용할 수 있습니다. 보험금 지급·계좌 변경 같은 금전 거래는 휴대폰 추가인증을 한 번 더 진행합니다.</div></div>
  </div></div></div>`;
}
