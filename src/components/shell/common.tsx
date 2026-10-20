/* 헤더·앱바가 함께 쓰는 버튼 */

export function Logo() {
  return (
    <button className="logo" data-action="nav" data-page="home">
      <span className="mark" aria-hidden="true">iM</span>
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
