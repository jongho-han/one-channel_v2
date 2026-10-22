/* 헤더·앱바가 함께 쓰는 버튼 */
import { useId } from 'react';

/** iM 심볼 (원본: iM_symbol.ai) — 왼쪽 막대·가운데 그라데이션 호·오른쪽 호. 색은 app.css 로고 토큰 */
function LogoSymbol() {
  const gradientId = `logo-grad-${useId().replace(/:/g, '')}`;   // 헤더·앱바에 함께 있어도 겹치지 않게
  return (
    <svg className="mark" viewBox="0 0 258.9 129.45" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="45.94" y1="0" x2="175.39" y2="0">
          <stop offset="0" className="s0" /><stop offset=".5" className="s1" /><stop offset="1" className="s2" />
        </linearGradient>
      </defs>
      <path className="solid" d="M45.94 129.45H0V45.94h45.94z" />
      <path fill={`url(#${gradientId})`} d="M45.94 45.94c46.05 0 83.51 37.46 83.51 83.51h45.94C175.39 57.96 117.43 0 45.94 0z" />
      <path className="solid" d="M258.89 0v45.94c-46.04 0-83.5 37.46-83.5 83.51h-45.94C129.45 57.96 187.4 0 258.89 0z" />
    </svg>
  );
}

export function Logo() {
  return (
    <button className="logo" data-action="nav" data-page="home">
      <LogoSymbol />
      <span className="text"><b>iM라이프</b><small>사이버창구</small></span>
      <span className="sr-only">홈으로</span>
    </button>
  );
}

export function LargeTextButton({ on }: { on: boolean }) {
  return (
    <button className="bigbtn" data-action="toggle-large-text" aria-pressed={on}>
      <span className="ga" aria-hidden="true">가<small>가</small></span>
      <span className="lbl">{on ? '큰글씨 켜짐' : '큰글씨'}</span>
    </button>
  );
}

export function AuthButton({ isLoggedIn, logoutStyle = '' }: { isLoggedIn: boolean; logoutStyle?: string }) {
  return isLoggedIn
    ? <button className={`btn sm ${logoutStyle}`.trim()} data-action="logout">로그아웃</button>
    : <button className="btn sm pri" data-action="nav" data-page="login">로그인</button>;
}
