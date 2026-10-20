import type { Page } from '../../state/store';
import { Icon } from '../Icon';
import { AuthButton, LargeTextButton, Logo } from './common';

interface AppBarProps {
  page: Page;
  title: string;
  largeText: boolean;
  isLoggedIn: boolean;
}

/** 모바일 상단 앱바: 홈은 로고, 하위 화면은 뒤로·제목·홈 */
export function AppBar({ page, title, largeText, isLoggedIn }: AppBarProps) {
  if (page === 'home') {
    return <><Logo /><LargeTextButton on={largeText} /><AuthButton isLoggedIn={isLoggedIn} logoutStyle="ghost" /></>;
  }
  return (
    <>
      <button className="icon-btn" data-action="back" aria-label="뒤로"><Icon name="back" /></button>
      <p className="title" aria-hidden="true">{title}</p>
      <LargeTextButton on={largeText} />
      <button className="icon-btn" data-action="nav" data-page="home" aria-label="홈"><Icon name="home" /></button>
    </>
  );
}
