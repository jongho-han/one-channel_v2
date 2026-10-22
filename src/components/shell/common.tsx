/* 헤더·앱바가 함께 쓰는 버튼 */
import { useId } from 'react';
import { LOGO_SYMBOL } from '../../ui/logoSymbol';

/** iM 심볼 — 왼쪽 막대·가운데 그라데이션 호·오른쪽 호 (도형은 ui/logoSymbol, 색은 app.css 로고 토큰) */
export function LogoSymbol({ className = 'logo-symbol mark' }: { className?: string }) {
  const gradientId = `logo-grad-${useId().replace(/:/g, '')}`;   // 헤더·앱바에 함께 있어도 겹치지 않게
  return (
    <svg className={className} viewBox={`0 0 ${LOGO_SYMBOL.width} ${LOGO_SYMBOL.height}`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={LOGO_SYMBOL.gradient.x1} y1="0" x2={LOGO_SYMBOL.gradient.x2} y2="0">
          <stop offset="0" className="s0" /><stop offset=".5" className="s1" /><stop offset="1" className="s2" />
        </linearGradient>
      </defs>
      <path className="solid" d={LOGO_SYMBOL.bar} />
      <path fill={`url(#${gradientId})`} d={LOGO_SYMBOL.arc} />
      <path className="solid" d={LOGO_SYMBOL.curve} />
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
